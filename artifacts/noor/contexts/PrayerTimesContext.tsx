import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";

import { useApp } from "@/contexts/AppContext";

export type PrayerName =
  | "fajr"
  | "sunrise"
  | "dhuhr"
  | "asr"
  | "maghrib"
  | "isha";

export interface PrayerTime {
  name: PrayerName;
  time: Date;
}

export interface PrayerTimesState {
  times: PrayerTime[];
  nextPrayer: PrayerTime | null;
  loading: boolean;
  locationLoading: boolean;
  error: string | null;
  permissionDenied: boolean;
  city: string;
  latitude: number;
  longitude: number;
  qiblaDirection: number;
  refreshLocation: () => void;
  recalculate: () => void;
}

const DEFAULT_LAT = 21.4225;
const DEFAULT_LON = 39.8262;
const DEFAULT_CITY = "Makkah al-Mukarramah";
const LOCATION_CACHE_KEY = "anssam_last_location";

interface CachedLocation {
  latitude: number;
  longitude: number;
  city: string;
}

function getAdhanParams(method: string, adhan: any): any {
  const CM = adhan.CalculationMethod;
  const map: Record<string, () => any> = {
    MWL: CM.MuslimWorldLeague,
    ISNA: CM.NorthAmerica,
    Egypt: CM.Egyptian,
    Makkah: CM.UmmAlQura,
    Karachi: CM.Karachi,
    Gulf: CM.Gulf,
    Kuwait: CM.Kuwait,
    Qatar: CM.Qatar,
    Singapore: CM.Singapore,
    France: CM.France,
    Turkey: CM.Turkey,
  };
  return map[method] ? map[method]() : CM.MuslimWorldLeague();
}

function computePrayerTimes(
  lat: number,
  lon: number,
  city: string,
  calculationMethod: string,
  madhab: string
): Omit<PrayerTimesState, "loading" | "locationLoading" | "error" | "permissionDenied" | "refreshLocation" | "recalculate"> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const adhan = require("adhan");
  const coords = new adhan.Coordinates(lat, lon);
  const params = getAdhanParams(calculationMethod, adhan);
  params.madhab = madhab === "hanafi" ? adhan.Madhab.Hanafi : adhan.Madhab.Shafi;

  const date = new Date();
  const pt = new adhan.PrayerTimes(coords, date, params);
  const qibla: number = adhan.Qibla(coords);

  const names: PrayerName[] = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
  const times: PrayerTime[] = names.map((name) => ({ name, time: pt[name] as Date }));

  const now = new Date();
  const upcoming = times.filter((p) => p.time > now);
  const nextPrayer = upcoming.length > 0 ? upcoming[0] : null;

  return {
    times,
    nextPrayer,
    city,
    latitude: lat,
    longitude: lon,
    qiblaDirection: Math.round(qibla),
  };
}

const PrayerTimesContext = createContext<PrayerTimesState | undefined>(undefined);

export function PrayerTimesProvider({ children }: { children: React.ReactNode }) {
  const { calculationMethod, madhab } = useApp();

  const [locationLoading, setLocationLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number; city: string }>({
    lat: DEFAULT_LAT,
    lon: DEFAULT_LON,
    city: DEFAULT_CITY,
  });
  const [prayerData, setPrayerData] = useState<
    Omit<PrayerTimesState, "loading" | "locationLoading" | "error" | "permissionDenied" | "refreshLocation" | "recalculate">
  >({
    times: [],
    nextPrayer: null,
    city: DEFAULT_CITY,
    latitude: DEFAULT_LAT,
    longitude: DEFAULT_LON,
    qiblaDirection: 0,
  });

  const coordsRef = useRef(coords);
  coordsRef.current = coords;

  // Recalculate whenever coords or settings change
  useEffect(() => {
    try {
      const data = computePrayerTimes(
        coords.lat,
        coords.lon,
        coords.city,
        calculationMethod,
        madhab
      );
      setPrayerData(data);
    } catch {
      setError("Échec du calcul des horaires");
    }
  }, [coords, calculationMethod, madhab]);

  const fetchLocation = useCallback(async () => {
    setLocationLoading(true);
    setError(null);

    if (Platform.OS === "web") {
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            let city = "Votre position";
            try {
              const r = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
              );
              if (r.ok) {
                const d = await r.json();
                city =
                  d.address?.city ||
                  d.address?.town ||
                  d.address?.village ||
                  d.address?.county ||
                  "Votre position";
              }
            } catch {}
            const c = { lat: latitude, lon: longitude, city };
            setCoords(c);
            await AsyncStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify({ latitude, longitude, city }));
            setLocationLoading(false);
          },
          () => {
            setLocationLoading(false);
          },
          { timeout: 10000, enableHighAccuracy: true }
        );
      } else {
        setLocationLoading(false);
      }
      return;
    }

    // Native (iOS / Android)
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Location = require("expo-location");
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setPermissionDenied(true);
        setLocationLoading(false);
        return;
      }

      setPermissionDenied(false);

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 0,
        distanceInterval: 0,
      });

      const { latitude, longitude } = loc.coords;
      let city = "Votre position";

      try {
        const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
        city =
          geo[0]?.city ||
          geo[0]?.subregion ||
          geo[0]?.region ||
          "Votre position";
      } catch {}

      const c = { lat: latitude, lon: longitude, city };
      setCoords(c);
      await AsyncStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify({ latitude, longitude, city }));
      setLocationLoading(false);
    } catch (e: any) {
      setError("Impossible d'obtenir votre position");
      setLocationLoading(false);
    }
  }, []);

  // On mount: load cached location immediately, then fetch fresh GPS
  useEffect(() => {
    (async () => {
      // 1. Try cached location first — instant display
      try {
        const cached = await AsyncStorage.getItem(LOCATION_CACHE_KEY);
        if (cached) {
          const { latitude, longitude, city }: CachedLocation = JSON.parse(cached);
          setCoords({ lat: latitude, lon: longitude, city });
          setLocationLoading(false); // show cached data immediately
        }
      } catch {}

      // 2. Always fetch fresh GPS in background
      await fetchLocation();
    })();
  }, [fetchLocation]);

  const refreshLocation = useCallback(() => {
    fetchLocation();
  }, [fetchLocation]);

  const recalculate = useCallback(() => {
    const { lat, lon, city } = coordsRef.current;
    try {
      const data = computePrayerTimes(lat, lon, city, calculationMethod, madhab);
      setPrayerData(data);
    } catch {
      setError("Échec du calcul des horaires");
    }
  }, [calculationMethod, madhab]);

  const loading = locationLoading && prayerData.times.length === 0;

  return (
    <PrayerTimesContext.Provider
      value={{
        ...prayerData,
        loading,
        locationLoading,
        error,
        permissionDenied,
        refreshLocation,
        recalculate,
      }}
    >
      {children}
    </PrayerTimesContext.Provider>
  );
}

export function usePrayerTimesContext(): PrayerTimesState {
  const ctx = useContext(PrayerTimesContext);
  if (!ctx) throw new Error("usePrayerTimesContext must be inside PrayerTimesProvider");
  return ctx;
}
