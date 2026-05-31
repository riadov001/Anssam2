---
name: Places API — Overpass preferred
description: Google Places remplacé par OpenStreetMap Overpass API (gratuit, sans clé) pour mosquées et commerces halal
---

## Rule
Toujours utiliser l'API Overpass (OpenStreetMap) comme moteur principal pour les recherches de lieux (mosquées, commerces halal). Ne pas utiliser Google Places API sans clé configurée.

**Why:** `GOOGLE_MAPS_API_KEY` n'était pas configuré → toutes les requêtes retournaient des erreurs. Overpass est gratuit, sans clé, fonctionne globalement, et souvent mieux pour les mosquées/halal.

**How to apply:**
- `artifacts/api-server/src/routes/places.ts` — utilise `https://overpass-api.de/api/interpreter` (POST)
- Format: `[out:json][timeout:25];(query(around:radius,lat,lon););out body;`
- Mosquées: `node/way/relation["amenity"="place_of_worship"]["religion"="muslim"]`
- Halal: `node["shop"="halal"];node["diet:halal"="yes"];node["cuisine"~"halal",i];`
- `halal.tsx` et `mosques.tsx` utilisent `usePrayerTimes()` pour le GPS (partagé, pas de requête redondante)
- La distance est calculée côté client via `haversineKm()` dans chaque écran
