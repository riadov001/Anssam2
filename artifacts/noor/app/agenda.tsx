import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";
import { useTranslations } from "@/data/translations";
import { useColors } from "@/hooks/useColors";
import { toHijri } from "@/hooks/usePrayerTimes";

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : "";

// Static Islamic events (shown even without backend)
const STATIC_EVENTS = [
  { id: "s1", titleFr: "Awal Moharram — Nouvel An Hijri", titleAr: "رأس السنة الهجرية", hijriMonth: 1, hijriDay: 1, color: "#C9A065", icon: "🌙", eventType: "celebration" },
  { id: "s2", titleFr: "Achoura", titleAr: "يوم عاشوراء", hijriMonth: 1, hijriDay: 10, color: "#2D8B6F", icon: "🤲", eventType: "ibada" },
  { id: "s3", titleFr: "Mawlid an-Nabawi", titleAr: "المولد النبوي الشريف", hijriMonth: 3, hijriDay: 12, color: "#C9A065", icon: "⭐", eventType: "celebration" },
  { id: "s4", titleFr: "Isra wal Miraj", titleAr: "الإسراء والمعراج", hijriMonth: 7, hijriDay: 27, color: "#8B6F2D", icon: "🌟", eventType: "celebration" },
  { id: "s5", titleFr: "Début du Ramadan", titleAr: "بداية شهر رمضان", hijriMonth: 9, hijriDay: 1, color: "#2D8B6F", icon: "🌙", eventType: "ibada" },
  { id: "s6", titleFr: "Laylat al-Qadr", titleAr: "ليلة القدر", hijriMonth: 9, hijriDay: 27, color: "#C9A065", icon: "✨", eventType: "ibada" },
  { id: "s7", titleFr: "Aïd al-Fitr", titleAr: "عيد الفطر", hijriMonth: 10, hijriDay: 1, color: "#C9A065", icon: "🎊", eventType: "eid" },
  { id: "s8", titleFr: "Jour d'Arafah", titleAr: "يوم عرفة", hijriMonth: 12, hijriDay: 9, color: "#2D8B6F", icon: "🤲", eventType: "ibada" },
  { id: "s9", titleFr: "Aïd al-Adha", titleAr: "عيد الأضحى", hijriMonth: 12, hijriDay: 10, color: "#C9A065", icon: "🎊", eventType: "eid" },
];

const HIJRI_MONTHS_FR = [
  "Moharram", "Safar", "Rabiʿ al-Awwal", "Rabiʿ al-Thani",
  "Joumada al-Oula", "Joumada al-Akhira", "Rajab", "Chaʿbane",
  "Ramadan", "Chawwal", "Dhu al-Qaʿda", "Dhu al-Hijja",
];

const HIJRI_MONTHS_AR = [
  "مُحَرَّم", "صَفَر", "رَبِيعٌ الأَوَّل", "رَبِيعٌ الثَّانِي",
  "جُمَادَى الأُولَى", "جُمَادَى الآخِرَة", "رَجَب", "شَعْبَان",
  "رَمَضَان", "شَوَّال", "ذُو القَعْدَة", "ذُو الحِجَّة",
];

function isEventSoon(event: any, currentHijri: { month: number; day: number }) {
  const eventDay = event.hijriDay;
  const eventMonth = event.hijriMonth;
  const currentAbsDay = currentHijri.month * 30 + currentHijri.day;
  const eventAbsDay = eventMonth * 30 + eventDay;
  const diff = eventAbsDay - currentAbsDay;
  return diff >= 0 && diff <= 14;
}

function isEventToday(event: any, currentHijri: { month: number; day: number }) {
  return event.hijriMonth === currentHijri.month && event.hijriDay === currentHijri.day;
}

export default function AgendaScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { language } = useApp();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  const [events, setEvents] = useState(STATIC_EVENTS as any[]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const now = new Date();
  const hijri = toHijri(now);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/events`);
        if (res.ok) {
          const data = await res.json();
          if (data.events?.length > 0) {
            setEvents([...STATIC_EVENTS, ...data.events]);
          }
        }
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredEvents = selectedMonth
    ? events.filter((e) => e.hijriMonth === selectedMonth)
    : events;

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (a.hijriMonth !== b.hijriMonth) return a.hijriMonth - b.hijriMonth;
    return a.hijriDay - b.hijriDay;
  });

  const upcomingEvents = events.filter((e) => isEventSoon(e, { month: hijri.month, day: hijri.day }));

  const styles = makeStyles(colors, topPad);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agenda Islamique</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Current Hijri Date */}
        <LinearGradient
          colors={[colors.primary, "#1A5C3A"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.hijriCard}
        >
          <Text style={styles.hijriCardLabel}>Aujourd'hui</Text>
          <Text style={styles.hijriCardDate}>
            {hijri.day} {HIJRI_MONTHS_FR[hijri.month - 1]} {hijri.year} AH
          </Text>
          <Text style={styles.hijriCardAr}>
            {hijri.day} {HIJRI_MONTHS_AR[hijri.month - 1]}
          </Text>
          <Text style={styles.hijriCardGreg}>
            {now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </Text>
        </LinearGradient>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>🔔 Prochainement</Text>
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} hijri={hijri} colors={colors} isToday={isEventToday(event, { month: hijri.month, day: hijri.day })} />
            ))}
          </View>
        )}

        {/* Month Filter */}
        <Text style={styles.sectionTitle}>Calendrier Annuel</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
          <View style={styles.monthRow}>
            <TouchableOpacity
              style={[styles.monthChip, !selectedMonth && { backgroundColor: colors.primary }]}
              onPress={() => setSelectedMonth(null)}
            >
              <Text style={[styles.monthChipText, !selectedMonth && { color: "#fff" }]}>Tous</Text>
            </TouchableOpacity>
            {HIJRI_MONTHS_FR.map((m, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.monthChip, selectedMonth === i + 1 && { backgroundColor: colors.primary }]}
                onPress={() => setSelectedMonth(selectedMonth === i + 1 ? null : i + 1)}
              >
                <Text style={[styles.monthChipText, selectedMonth === i + 1 && { color: "#fff" }]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />}

        {sortedEvents.map((event) => (
          <EventCard key={event.id} event={event} hijri={hijri} colors={colors} isToday={isEventToday(event, { month: hijri.month, day: hijri.day })} />
        ))}
      </ScrollView>
    </View>
  );
}

function EventCard({ event, hijri, colors, isToday }: any) {
  const monthFr = HIJRI_MONTHS_FR[event.hijriMonth - 1];
  const typeColors: Record<string, string> = {
    eid: "#C9A065",
    ibada: "#2D8B6F",
    celebration: "#8B6F2D",
    general: colors.primary,
  };
  const borderColor = typeColors[event.eventType] || colors.primary;

  return (
    <View style={[{
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: isToday ? borderColor : colors.border,
      borderLeftWidth: 4,
      borderLeftColor: borderColor,
    }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Text style={{ fontSize: 26 }}>{event.icon || "🌙"}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.foreground }}>
            {event.titleFr || event.titleEn}
          </Text>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: colors.gold, marginTop: 2 }}>
            {event.titleAr}
          </Text>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: colors.mutedForeground, marginTop: 4 }}>
            {event.hijriDay} {monthFr}
          </Text>
        </View>
        {isToday && (
          <View style={{ backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 10, color: "#fff" }}>Aujourd'hui</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function makeStyles(colors: any, topPad: number) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingTop: topPad + 12, paddingHorizontal: 20, paddingBottom: 12,
    },
    backBtn: {
      width: 36, height: 36, borderRadius: 12,
      backgroundColor: colors.card, alignItems: "center", justifyContent: "center",
    },
    headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: colors.foreground },
    content: { padding: 20, gap: 12, paddingBottom: 120 },
    hijriCard: { borderRadius: 20, padding: 24, gap: 6 },
    hijriCardLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1 },
    hijriCardDate: { fontFamily: "Inter_700Bold", fontSize: 20, color: "#fff" },
    hijriCardAr: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#C9A065" },
    hijriCardGreg: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4 },
    sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: colors.foreground, marginBottom: 4 },
    monthScroll: { marginBottom: 4 },
    monthRow: { flexDirection: "row", gap: 8, paddingBottom: 4 },
    monthChip: {
      paddingHorizontal: 14, paddingVertical: 7,
      borderRadius: 20, backgroundColor: colors.card,
      borderWidth: 1, borderColor: colors.border,
    },
    monthChipText: { fontFamily: "Inter_500Medium", fontSize: 12, color: colors.mutedForeground },
  });
}
