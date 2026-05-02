import { useCallback, useEffect, useState } from "react";
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
  error: string | null;
  city: string;
  latitude: number;
  longitude: number;
  qiblaDirection: number;
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

const DEFAULT_LAT = 21.4225;
const DEFAULT_LON = 39.8262;
const DEFAULT_CITY = "Makkah al-Mukarramah";

export function usePrayerTimes(): PrayerTimesState {
  const { calculationMethod, madhab } = useApp();
  const [state, setState] = useState<PrayerTimesState>({
    times: [],
    nextPrayer: null,
    loading: true,
    error: null,
    city: DEFAULT_CITY,
    latitude: DEFAULT_LAT,
    longitude: DEFAULT_LON,
    qiblaDirection: 0,
  });

  const calculate = useCallback(
    (lat: number, lon: number, city: string) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const adhan = require("adhan");
        const coords = new adhan.Coordinates(lat, lon);
        const params = getAdhanParams(calculationMethod, adhan);
        if (madhab === "hanafi") {
          params.madhab = adhan.Madhab.Hanafi;
        } else {
          params.madhab = adhan.Madhab.Shafi;
        }
        const date = new Date();
        const pt = new adhan.PrayerTimes(coords, date, params);
        const qibla: number = adhan.Qibla(coords);

        const names: PrayerName[] = [
          "fajr",
          "sunrise",
          "dhuhr",
          "asr",
          "maghrib",
          "isha",
        ];
        const times: PrayerTime[] = names.map((name) => ({
          name,
          time: pt[name] as Date,
        }));

        const now = new Date();
        const upcoming = times.filter((p) => p.time > now);
        const nextPrayer = upcoming.length > 0 ? upcoming[0] : null;

        setState({
          times,
          nextPrayer,
          loading: false,
          error: null,
          city,
          latitude: lat,
          longitude: lon,
          qiblaDirection: Math.round(qibla),
        });
      } catch {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to calculate",
        }));
      }
    },
    [calculationMethod, madhab]
  );

  useEffect(() => {
    if (Platform.OS === "web") {
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            calculate(pos.coords.latitude, pos.coords.longitude, "Your Location");
          },
          () => {
            calculate(DEFAULT_LAT, DEFAULT_LON, DEFAULT_CITY);
          },
          { timeout: 8000 }
        );
      } else {
        calculate(DEFAULT_LAT, DEFAULT_LON, DEFAULT_CITY);
      }
      return;
    }

    (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const Location = require("expo-location");
        const { status } =
          await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          calculate(DEFAULT_LAT, DEFAULT_LON, DEFAULT_CITY);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const { latitude, longitude } = loc.coords;
        try {
          const geo = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });
          const city =
            geo[0]?.city || geo[0]?.region || "Your Location";
          calculate(latitude, longitude, city);
        } catch {
          calculate(latitude, longitude, "Your Location");
        }
      } catch {
        calculate(DEFAULT_LAT, DEFAULT_LON, DEFAULT_CITY);
      }
    })();
  }, [calculate]);

  return state;
}

export function toHijri(date: Date): {
  day: number;
  month: number;
  year: number;
} {
  const jd =
    Math.floor(date.getTime() / 86400000) + 2440587.5 + 0.5;
  const z = Math.floor(jd);
  const a =
    z < 2299161
      ? z
      : (() => {
          const alpha = Math.floor((z - 1867216.25) / 36524.25);
          return z + 1 + alpha - Math.floor(alpha / 4);
        })();
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const dayG = b - d - Math.floor(30.6001 * e);
  const monthG = e < 14 ? e - 1 : e - 13;
  const yearG = monthG > 2 ? c - 4716 : c - 4715;

  let jdGreg =
    367 * yearG -
    Math.floor((7 * (yearG + Math.floor((monthG + 9) / 12))) / 4) -
    Math.floor((3 * (Math.floor((yearG + (monthG - 9) / 7) / 100) + 1)) / 4) +
    Math.floor((275 * monthG) / 9) +
    dayG +
    1721028.5;

  const l = Math.floor(jdGreg) - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
    Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 =
    l2 -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;

  return { day, month, year };
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function getCountdown(targetTime: Date): string {
  const now = new Date();
  const diff = targetTime.getTime() - now.getTime();
  if (diff <= 0) return "00:00:00";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
