import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
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

const ISLAMIC_MONTHS_AR = [
  "مُحَرَّم","صَفَر","رَبِيعٌ الأَوَّل","رَبِيعٌ الثَّانِي",
  "جُمَادَى الأُولَى","جُمَادَى الآخِرَة","رَجَب","شَعْبَان",
  "رَمَضَان","شَوَّال","ذُو القَعْدَة","ذُو الحِجَّة",
];

const STAR_POSITIONS = [
  { top: "15%", left: "10%", size: 3, opacity: 0.6 },
  { top: "40%", left: "80%", size: 2, opacity: 0.4 },
  { top: "20%", left: "50%", size: 4, opacity: 0.8 },
  { top: "65%", left: "25%", size: 2, opacity: 0.5 },
  { top: "10%", left: "75%", size: 3, opacity: 0.3 },
  { top: "55%", left: "60%", size: 2, opacity: 0.7 },
];

interface FeatureCard {
  icon: string;
  label: string;
  route: string;
  color: string;
  desc: string;
  emoji?: string;
}

export default function MoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { language } = useApp();
  const t = useTranslations(language);
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const [now] = useState(new Date());
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const hijri = toHijri(now);
  const hijriMonth = t.hijriMonths[hijri.month - 1] || "";
  const hijriMonthAr = ISLAMIC_MONTHS_AR[hijri.month - 1] || "";

  const styles = makeStyles(colors, topPad, bottomPad);

  const features: FeatureCard[] = [
    { icon: "star", label: t.namesOfAllah as string, route: "/names", color: colors.gold, desc: "99 Beaux Noms", emoji: "✨" },
    { icon: "compass", label: "Qibla", route: "/qibla", color: colors.primary, desc: "Direction La Mecque", emoji: "🧭" },
    { icon: "calendar", label: "Agenda", route: "/agenda", color: "#8B6F2D", desc: "Événements islamiques", emoji: "📅" },
    { icon: "location", label: "Mosquées", route: "/mosques", color: colors.primary, desc: "À proximité", emoji: "🕌" },
    { icon: "restaurant", label: "Halal", route: "/halal", color: colors.gold, desc: "Commerces certifiés", emoji: "🥩" },
    { icon: "hand-left", label: t.duas as string, route: "/dhikr-page", color: "#7C5CBF", desc: "Douâs & Dhikr", emoji: "🤲" },
    { icon: "settings", label: t.settings as string, route: "/settings", color: colors.mutedForeground, desc: "Langue & Calcul", emoji: "⚙️" },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{t.moreTitle}</Text>

      {/* Hijri Calendar Hero */}
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View style={styles.hijriCard}>
          <LinearGradient
            colors={[colors.primary, "#1A5C3A", "#0D3021"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {STAR_POSITIONS.map((star, i) => (
            <View
              key={i}
              style={[
                styles.star,
                {
                  top: star.top as any,
                  left: star.left as any,
                  width: star.size,
                  height: star.size,
                  opacity: star.opacity,
                },
              ]}
            />
          ))}
          <View style={styles.hijriTop}>
            <Ionicons name="calendar-outline" size={20} color={colors.gold + "CC"} />
            <Text style={styles.hijriLabel}>{t.hijriCalendar}</Text>
          </View>
          <View style={styles.hijriDateRow}>
            <Text style={styles.hijriDay}>{hijri.day}</Text>
            <View style={styles.hijriMonthCol}>
              <Text style={styles.hijriMonthAr}>{hijriMonthAr}</Text>
              <Text style={styles.hijriMonth}>{hijriMonth}</Text>
              <Text style={styles.hijriYear}>{hijri.year} AH</Text>
            </View>
          </View>
          <View style={styles.hijriDivider} />
          <View style={styles.gregorianRow}>
            <Ionicons name="today-outline" size={14} color={colors.primaryForeground} style={{ opacity: 0.6 }} />
            <Text style={styles.gregorianDate}>
              {now.toLocaleDateString([], {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
              })}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Feature Grid — 2 columns */}
      <Animated.View style={[styles.grid, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {features.map((feature) => (
          <TouchableOpacity
            key={feature.route}
            style={styles.featureCard}
            onPress={() => router.push(feature.route as any)}
            activeOpacity={0.75}
          >
            <LinearGradient
              colors={[feature.color + "18", feature.color + "06"]}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.featureEmoji}>{feature.emoji}</Text>
            <Text style={styles.featureLabel}>{feature.label}</Text>
            <Text style={[styles.featureDesc, { color: feature.color + "BB" }]}>{feature.desc}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* About Card */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.aboutCard}>
          <View style={styles.aboutRow}>
            <View style={[styles.aboutIcon, { backgroundColor: colors.primary + "20" }]}>
              <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
            </View>
            <View style={styles.aboutText}>
              <Text style={styles.aboutTitle}>{t.privacyFirst}</Text>
              <Text style={styles.aboutSub}>{t.noDataCollection}</Text>
            </View>
          </View>
          <View style={styles.aboutDivider} />
          <View style={styles.aboutRow}>
            <View style={[styles.aboutIcon, { backgroundColor: colors.gold + "20" }]}>
              <Ionicons name="gift" size={18} color={colors.gold} />
            </View>
            <View style={styles.aboutText}>
              <Text style={styles.aboutTitle}>{t.free}</Text>
              <Text style={styles.aboutSub}>{t.alwaysFree}</Text>
            </View>
          </View>
          <View style={styles.aboutDivider} />
          <View style={styles.versionRow}>
            <View style={styles.appNameRow}>
              <Text style={styles.appName}>Anssam</Text>
              <Text style={styles.appNameAr}> — أنسام</Text>
            </View>
            <Text style={styles.version}>{t.appVersion}</Text>
          </View>
        </View>
      </Animated.View>

      {/* SPI Attribution */}
      <Animated.View style={[styles.spiRow, { opacity: fadeAnim }]}>
        <Text style={styles.madeByText}>Made by</Text>
        <View style={styles.spiLogoWrap}>
          <Image
            source={require("../../assets/images/spi-logo.jpg")}
            style={styles.spiLogoImg}
          />
        </View>
        <Text style={styles.spiName}>Straight Path Intelligence</Text>
      </Animated.View>
    </ScrollView>
  );
}

function makeStyles(colors: any, topPad: number, bottomPad: number) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: {
      paddingTop: topPad + 16,
      paddingHorizontal: 20,
      paddingBottom: bottomPad + 100,
      gap: 16,
    },
    title: { fontFamily: "Inter_700Bold", fontSize: 28, color: colors.foreground },
    hijriCard: {
      borderRadius: 24, padding: 24, overflow: "hidden",
      shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3, shadowRadius: 20, elevation: 12,
    },
    star: { position: "absolute", borderRadius: 99, backgroundColor: "#ffffff" },
    hijriTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 },
    hijriLabel: { fontFamily: "Inter_500Medium", fontSize: 13, color: colors.primaryForeground, opacity: 0.7 },
    hijriDateRow: { flexDirection: "row", alignItems: "center", gap: 20 },
    hijriDay: { fontFamily: "Inter_700Bold", fontSize: 80, color: colors.primaryForeground, lineHeight: 88 },
    hijriMonthCol: { gap: 2 },
    hijriMonthAr: { fontFamily: "Inter_700Bold", fontSize: 22, color: colors.gold },
    hijriMonth: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: colors.primaryForeground, opacity: 0.9 },
    hijriYear: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.primaryForeground, opacity: 0.6 },
    hijriDivider: { width: "100%", height: 1, backgroundColor: colors.primaryForeground + "20", marginVertical: 18 },
    gregorianRow: { flexDirection: "row", alignItems: "center", gap: 7 },
    gregorianDate: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.primaryForeground, opacity: 0.7 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    featureCard: {
      width: "48%",
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 16,
      alignItems: "flex-start",
      gap: 6,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    featureEmoji: { fontSize: 24, marginBottom: 2 },
    featureLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: colors.foreground },
    featureDesc: { fontFamily: "Inter_400Regular", fontSize: 11 },
    aboutCard: {
      backgroundColor: colors.card, borderRadius: 20,
      padding: 20, borderWidth: 1, borderColor: colors.border,
    },
    aboutRow: { flexDirection: "row", alignItems: "center", gap: 14 },
    aboutIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    aboutText: { flex: 1 },
    aboutTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.foreground },
    aboutSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
    aboutDivider: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
    versionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    appNameRow: { flexDirection: "row", alignItems: "baseline" },
    appName: { fontFamily: "Inter_700Bold", fontSize: 16, color: colors.primary },
    appNameAr: { fontFamily: "Inter_700Bold", fontSize: 16, color: colors.gold },
    version: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground },
    spiRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 4 },
    madeByText: { fontFamily: "Inter_400Regular", fontSize: 11, color: colors.mutedForeground, opacity: 0.55 },
    spiLogoWrap: { width: 20, height: 20, borderRadius: 10, overflow: "hidden", borderWidth: 1, borderColor: colors.border },
    spiLogoImg: { width: 20, height: 20 },
    spiName: { fontFamily: "Inter_500Medium", fontSize: 11, color: colors.mutedForeground, opacity: 0.65 },
  });
}
