import { Router } from "express";

const router = Router();

// ─── Overpass API (OpenStreetMap) — free, no key needed ──────────────────────

async function searchOverpass(
  lat: number,
  lon: number,
  query: string,
  radius: number
): Promise<any[]> {
  const overpassUrl = "https://overpass-api.de/api/interpreter";
  const body = `[out:json][timeout:25];(${query}(around:${radius},${lat},${lon}););out body;`;

  const res = await fetch(overpassUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(body)}`,
    signal: AbortSignal.timeout(28000),
  });

  if (!res.ok) throw new Error(`Overpass error: ${res.status}`);
  const data = await res.json();
  return data.elements || [];
}

function osmToPlace(el: any, defaultEmoji?: string) {
  const tags = el.tags || {};
  const name = tags.name || tags["name:fr"] || tags["name:ar"] || defaultEmoji || "Lieu";
  const street = tags["addr:street"] || "";
  const city = tags["addr:city"] || tags["addr:town"] || "";
  const housenumber = tags["addr:housenumber"] || "";
  const address = [housenumber, street, city].filter(Boolean).join(", ") || tags.description || "";

  return {
    id: String(el.id),
    name,
    address,
    rating: null,
    userRatingsTotal: null,
    isOpen: null,
    location: { lat: el.lat || el.center?.lat, lng: el.lon || el.center?.lon },
    photoUrl: null,
    phone: tags.phone || tags["contact:phone"] || null,
    website: tags.website || tags["contact:website"] || null,
    types: [tags.amenity, tags.shop, tags.cuisine].filter(Boolean),
    source: "osm",
  };
}

// GET /api/places/mosques?lat=&lng=&radius=
router.get("/places/mosques", async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: "lat and lng required" });

    const r = radius ? parseInt(radius as string) : 5000;
    const latF = parseFloat(lat as string);
    const lngF = parseFloat(lng as string);

    const query = `
      node["amenity"="place_of_worship"]["religion"="muslim"];
      way["amenity"="place_of_worship"]["religion"="muslim"];
      relation["amenity"="place_of_worship"]["religion"="muslim"]
    `.trim();

    const elements = await searchOverpass(latF, lngF, query, r);

    const places = elements
      .map((el: any) => osmToPlace(el, "🕌"))
      .filter((p: any) => p.name !== "🕌")
      .sort((a: any, b: any) => {
        const distA = Math.hypot(
          (a.location?.lat || latF) - latF,
          (a.location?.lng || lngF) - lngF
        );
        const distB = Math.hypot(
          (b.location?.lat || latF) - latF,
          (b.location?.lng || lngF) - lngF
        );
        return distA - distB;
      })
      .slice(0, 30);

    res.json({ places, source: "openstreetmap" });
  } catch (err) {
    req.log.error(err, "Failed to fetch mosques");
    res.status(500).json({ error: "Impossible de charger les mosquées. Réessayez." });
  }
});

// GET /api/places/halal?lat=&lng=&radius=
router.get("/places/halal", async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: "lat and lng required" });

    const r = radius ? parseInt(radius as string) : 3000;
    const latF = parseFloat(lat as string);
    const lngF = parseFloat(lng as string);

    // Multiple OSM halal queries
    const query = `
      node["shop"="halal"];
      node["diet:halal"="yes"];
      node["diet:halal"="only"];
      node["cuisine"~"halal",i];
      node["shop"="butcher"]["halal"="yes"];
      node["shop"="supermarket"]["halal"="yes"];
      way["shop"="halal"];
      way["diet:halal"="yes"];
      way["diet:halal"="only"]
    `.trim();

    const elements = await searchOverpass(latF, lngF, query, r);

    // Deduplicate by id
    const seen = new Set<string>();
    const places = elements
      .map((el: any) => osmToPlace(el, "🥩"))
      .filter((p: any) => {
        if (p.name === "🥩") return false;
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      })
      .sort((a: any, b: any) => {
        const distA = Math.hypot(
          (a.location?.lat || latF) - latF,
          (a.location?.lng || lngF) - lngF
        );
        const distB = Math.hypot(
          (b.location?.lat || latF) - latF,
          (b.location?.lng || lngF) - lngF
        );
        return distA - distB;
      })
      .slice(0, 40);

    res.json({ places, source: "openstreetmap" });
  } catch (err) {
    req.log.error(err, "Failed to fetch halal places");
    res.status(500).json({ error: "Impossible de charger les commerces halal. Réessayez." });
  }
});

// GET /api/places/details/:placeId — kept for backward compat
router.get("/places/details/:placeId", async (_req, res) => {
  res.json({ place: null });
});

export default router;
