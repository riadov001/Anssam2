// Re-exports from PrayerTimesContext — usePrayerTimes is now a thin wrapper
// that reads from the global singleton context (GPS requested only once).
export type { PrayerName, PrayerTime, PrayerTimesState } from "@/contexts/PrayerTimesContext";
export { usePrayerTimesContext as usePrayerTimes } from "@/contexts/PrayerTimesContext";

// ─── Pure utility functions (no GPS, no side-effects) ────────────────────────

export function toHijri(date: Date): { day: number; month: number; year: number } {
  const jd = Math.floor(date.getTime() / 86400000) + 2440587.5 + 0.5;
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
