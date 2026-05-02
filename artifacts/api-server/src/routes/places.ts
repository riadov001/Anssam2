import { Router } from "express";

const router = Router();
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

async function searchPlaces(lat: number, lng: number, keyword: string, radius = 5000) {
  const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  url.searchParams.set("location", `${lat},${lng}`);
  url.searchParams.set("radius", String(radius));
  url.searchParams.set("keyword", keyword);
  url.searchParams.set("key", GOOGLE_MAPS_API_KEY || "");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Google Places error: ${res.status}`);
  return res.json();
}

async function getPlaceDetails(placeId: string) {
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "name,formatted_address,formatted_phone_number,opening_hours,rating,user_ratings_total,website,geometry,photos");
  url.searchParams.set("key", GOOGLE_MAPS_API_KEY || "");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Google Places error: ${res.status}`);
  return res.json();
}

// GET /api/places/mosques?lat=&lng=&radius=
router.get("/places/mosques", async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: "lat and lng required" });
    const data = await searchPlaces(
      parseFloat(lat as string),
      parseFloat(lng as string),
      "mosquée mosque masjid",
      radius ? parseInt(radius as string) : 5000
    );
    // Extract relevant fields and add photo URLs
    const places = (data.results || []).map((p: any) => ({
      id: p.place_id,
      name: p.name,
      address: p.vicinity,
      rating: p.rating,
      userRatingsTotal: p.user_ratings_total,
      isOpen: p.opening_hours?.open_now,
      location: p.geometry?.location,
      photoUrl: p.photos?.[0]?.photo_reference
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${p.photos[0].photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
        : null,
      types: p.types,
    }));
    res.json({ places });
  } catch (err) {
    req.log.error(err, "Failed to fetch mosques");
    res.status(500).json({ error: "Failed to fetch nearby mosques" });
  }
});

// GET /api/places/halal?lat=&lng=&radius=
router.get("/places/halal", async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: "lat and lng required" });
    const data = await searchPlaces(
      parseFloat(lat as string),
      parseFloat(lng as string),
      "halal",
      radius ? parseInt(radius as string) : 3000
    );
    const places = (data.results || []).map((p: any) => ({
      id: p.place_id,
      name: p.name,
      address: p.vicinity,
      rating: p.rating,
      userRatingsTotal: p.user_ratings_total,
      isOpen: p.opening_hours?.open_now,
      location: p.geometry?.location,
      photoUrl: p.photos?.[0]?.photo_reference
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${p.photos[0].photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
        : null,
      types: p.types,
    }));
    res.json({ places });
  } catch (err) {
    req.log.error(err, "Failed to fetch halal places");
    res.status(500).json({ error: "Failed to fetch nearby halal places" });
  }
});

// GET /api/places/:placeId
router.get("/places/details/:placeId", async (req, res) => {
  try {
    const data = await getPlaceDetails(req.params.placeId);
    res.json({ place: data.result });
  } catch (err) {
    req.log.error(err, "Failed to fetch place details");
    res.status(500).json({ error: "Failed to fetch place details" });
  }
});

export default router;
