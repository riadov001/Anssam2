import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type PrayerKey = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

export interface DailyRecord {
  date: string;
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
  quranPages: number;
  dhikrSessions: number;
}

export interface WeekDay {
  date: string;
  score: number;
  label: string;
}

export interface SpiritualContextType {
  today: DailyRecord;
  score: number;
  streak: number;
  weekHistory: WeekDay[];
  togglePrayer: (prayer: PrayerKey) => void;
  setQuranPages: (n: number) => void;
  addDhikrSession: () => void;
  coachingMessage: string;
  coachingLevel: "low" | "medium" | "high" | "perfect";
}

const STORAGE_PREFIX = "anssam_spiritual_";
const PRAYERS: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function makeDateKey(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function computeScore(record: DailyRecord): number {
  const prayersDone = PRAYERS.filter((p) => record[p]).length;
  const prayerScore = prayersDone * 14; // 5 × 14 = 70 max
  const quranScore = record.quranPages >= 3 ? 20 : record.quranPages >= 1 ? 12 : 0;
  const dhikrScore = record.dhikrSessions >= 2 ? 10 : record.dhikrSessions >= 1 ? 7 : 0;
  return Math.min(100, prayerScore + quranScore + dhikrScore);
}

function getCoachingLevel(score: number): "low" | "medium" | "high" | "perfect" {
  if (score >= 95) return "perfect";
  if (score >= 65) return "high";
  if (score >= 35) return "medium";
  return "low";
}

const COACHING: Record<string, string[]> = {
  low: [
    "Commencez par Fajr — chaque prière à l'heure est un cadeau à votre âme. 🌅",
    "«Établissez la prière, car la prière préserve de l'indécence.» (Coran 29:45) 🤲",
    "Même une seule prière aujourd'hui est une victoire. Allah est Le Pardonneur. ❤️",
  ],
  medium: [
    "Bon début ! Complétez les prières restantes et lisez quelques versets ce soir. 📖",
    "Vous progressez ! Le Dhikr du soir apaisera votre cœur. سبحان الله 💚",
    "«Rappelle-toi d'Allah souvent» — quelques pages du Coran élèveront votre score. ✨",
  ],
  high: [
    "ماشاء الله ! Belle journée. Terminez avec le dhikr du soir pour atteindre l'excellence. 🌙",
    "Excellent engagement ! Allah voit votre effort sincère. Continuez ! 🌟",
    "Très bonne journée spirituelle. La régularité est la clé — même en petites doses. 🔑",
  ],
  perfect: [
    "سبحان الله ! Score parfait. Allah vous récompensera pour cet effort exceptionnel. ✨🌟",
    "Journée complète ! Vous êtes un exemple de dévotion. Que Allah accepte vos actes. 💎",
    "100/100 — ماشاء الله تبارك الله ! Que cette constance guide vos prochains jours. 🕋",
  ],
};

function getCoachingMessage(record: DailyRecord, score: number): string {
  const level = getCoachingLevel(score);
  const messages = COACHING[level];
  const dayOfWeek = new Date().getDay();
  return messages[dayOfWeek % messages.length];
}

function emptyRecord(date: string): DailyRecord {
  return { date, fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false, quranPages: 0, dhikrSessions: 0 };
}

const SpiritualContext = createContext<SpiritualContextType | undefined>(undefined);

export function SpiritualProvider({ children }: { children: React.ReactNode }) {
  const [today, setToday] = useState<DailyRecord>(emptyRecord(todayKey()));
  const [weekHistory, setWeekHistory] = useState<WeekDay[]>([]);

  // Load today + week from AsyncStorage
  useEffect(() => {
    (async () => {
      const key = todayKey();
      try {
        const raw = await AsyncStorage.getItem(STORAGE_PREFIX + key);
        if (raw) {
          setToday(JSON.parse(raw));
        }

        // Load past 6 days
        const history: WeekDay[] = [];
        for (let i = -6; i <= -1; i++) {
          const dk = makeDateKey(i);
          const d = new Date();
          d.setDate(d.getDate() + i);
          const raw2 = await AsyncStorage.getItem(STORAGE_PREFIX + dk);
          const rec = raw2 ? JSON.parse(raw2) : emptyRecord(dk);
          history.push({
            date: dk,
            score: computeScore(rec),
            label: DAY_LABELS[d.getDay()],
          });
        }
        setWeekHistory(history);
      } catch {}
    })();
  }, []);

  const saveToday = useCallback(async (record: DailyRecord) => {
    setToday(record);
    try {
      await AsyncStorage.setItem(STORAGE_PREFIX + record.date, JSON.stringify(record));
    } catch {}
  }, []);

  const togglePrayer = useCallback(
    (prayer: PrayerKey) => {
      const updated = { ...today, [prayer]: !today[prayer] };
      saveToday(updated);
    },
    [today, saveToday]
  );

  const setQuranPages = useCallback(
    (n: number) => {
      const updated = { ...today, quranPages: Math.max(0, n) };
      saveToday(updated);
    },
    [today, saveToday]
  );

  const addDhikrSession = useCallback(() => {
    const updated = { ...today, dhikrSessions: today.dhikrSessions + 1 };
    saveToday(updated);
  }, [today, saveToday]);

  // Streak calculation: consecutive days with score > 0
  const streak = (() => {
    let s = 0;
    for (let i = weekHistory.length - 1; i >= 0; i--) {
      if (weekHistory[i].score > 0) s++;
      else break;
    }
    const todayScore = computeScore(today);
    if (todayScore > 0) s++;
    return s;
  })();

  const score = computeScore(today);
  const coachingMessage = getCoachingMessage(today, score);
  const coachingLevel = getCoachingLevel(score);

  return (
    <SpiritualContext.Provider
      value={{
        today,
        score,
        streak,
        weekHistory,
        togglePrayer,
        setQuranPages,
        addDhikrSession,
        coachingMessage,
        coachingLevel,
      }}
    >
      {children}
    </SpiritualContext.Provider>
  );
}

export function useSpiritual(): SpiritualContextType {
  const ctx = useContext(SpiritualContext);
  if (!ctx) throw new Error("useSpiritual must be inside SpiritualProvider");
  return ctx;
}
