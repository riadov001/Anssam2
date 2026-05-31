import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Reanimated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "@/components/AppHeader";
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

function AnimatedFeatureCard({
  feature,
  index,
  onPress,
  styles,
}: {
  feature: FeatureCard;
  index: number;
  onPress: (route: string) => void;
  styles: ReturnType<typeof makeStyles>;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Reanimated.View
      entering={FadeInUp.delay(100 + index * 65).duration(400).springify().damping(14)}
      style={[styles.featureCardWrapper, animStyle]}
    >
      <TouchableOpacity
        style={styles.featureCard}
        onPress={() => onPress(feature.route)}
        activeOpacity={1}
        onPressIn={() => { scale.value = withSpring(0.94, { damping: 12, stiffness: 300 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 200 }); }}
      >
        <LinearGradient
          colors={[feature.color + "18", feature.color + "06"]}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.featureEmoji}>{feature.emoji}</Text>
        <Text style={styles.featureLabel}>{feature.label}</Text>
        <Text style={[styles.featureDesc, { color: feature.color + "BB" }]}>{feature.desc}</Text>
      </TouchableOpacity>
    </Reanimated.View>
  );
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
    { icon: "fitness", label: "Mon Parcours", route: "/spiritual", color: "#E91E8C", desc: "Score & Coaching", emoji: "💫" },
    { icon: "settings", label: t.settings as string, route: "/settings", color: colors.mutedForeground, desc: "Langue & Calcul", emoji: "⚙️" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader subtitle="Découvrir & explorer" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

      {/* Hijri Calendar Hero */}
      <Reanimated.View entering={FadeInDown.duration(600).springify().damping(16)}>
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
            <Reanimated.Text
              entering={ZoomIn.delay(200).duration(500).springify()}
              style={styles.hijriDay}
            >
              {hijri.day}
            </Reanimated.Text>
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
      </Reanimated.View>

      {/* Feature Grid — 2 columns */}
      <View style={styles.grid}>
        {features.map((feature, index) => (
          <AnimatedFeatureCard
            key={feature.route}
            feature={feature}
            index={index}
            onPress={(route) => router.push(route as any)}
            styles={styles}
          />
        ))}
      </View>

      {/* About Card */}
      <Reanimated.View entering={FadeInUp.delay(600).duration(400).springify()}>
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
              <View style={styles.appNameDot} />
              <Text style={styles.appNameAr}>أنسام</Text>
            </View>
            <Text style={styles.version}>{t.appVersion}</Text>
          </View>
        </View>
      </Reanimated.View>

      {/* SPI Attribution */}
      <Reanimated.View entering={FadeInUp.delay(700).duration(400).springify()}>
        <View style={styles.spiCard}>
          <LinearGradient
            colors={[colors.primary + "10", colors.gold + "08", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.madeByText}>Conçu et développé par</Text>
          <View style={styles.spiBrandRow}>
            <View style={styles.spiLogoWrap}>
              <Image
                source={require("../../assets/images/spi-logo.jpg")}
                style={styles.spiLogoImg}
                resizeMode="cover"
              />
            </View>
            <View style={styles.spiTextCol}>
              <Text style={styles.spiName}>Straight Path</Text>
              <Text style={styles.spiNameAccent}>Intelligence</Text>
            </View>
          </View>
          <Text style={styles.spiTagline}>L'intelligence au service de la spiritualité</Text>
        </View>
      </Reanimated.View>
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: any, topPad: number, bottomPad: number) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: {
      paddingTop: 16,
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
    featureCardWrapper: { width: "48%" },
    featureCard: {
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
    appNameRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    appNameDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.gold, opacity: 0.7 },
    appName: { fontFamily: "Inter_700Bold", fontSize: 18, color: colors.primary, letterSpacing: 0.3 },
    appNameAr: { fontFamily: "Inter_700Bold", fontSize: 18, color: colors.gold, letterSpacing: 0.5 },
    version: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground },
    spiCard: {
      borderRadius: 22,
      paddingVertical: 24,
      paddingHorizontal: 20,
      alignItems: "center",
      gap: 14,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      backgroundColor: colors.card,
    },
    madeByText: {
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      color: colors.mutedForeground,
      letterSpacing: 1.4,
      textTransform: "uppercase",
      opacity: 0.7,
    },
    spiBrandRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    spiLogoWrap: {
      width: 56,
      height: 56,
      borderRadius: 14,
      overflow: "hidden",
      borderWidth: 1.5,
      borderColor: colors.gold + "55",
      shadowColor: colors.gold,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 6,
    },
    spiLogoImg: { width: "100%", height: "100%" },
    spiTextCol: { gap: 1 },
    spiName: {
      fontFamily: "Inter_700Bold",
      fontSize: 18,
      color: colors.foreground,
      letterSpacing: 0.4,
      lineHeight: 22,
    },
    spiNameAccent: {
      fontFamily: "Inter_700Bold",
      fontSize: 18,
      color: colors.primary,
      letterSpacing: 0.4,
      lineHeight: 22,
    },
    spiTagline: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.mutedForeground,
      fontStyle: "italic",
      textAlign: "center",
      opacity: 0.85,
    },
  });
}
