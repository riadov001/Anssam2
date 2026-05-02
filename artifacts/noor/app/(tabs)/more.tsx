import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
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

interface FeatureCard {
  icon: string;
  labelKey: string;
  route: string;
  color: string;
  desc: string;
}

const ISLAMIC_MONTHS_AR = [
  "مُحَرَّم", "صَفَر", "رَبِيعٌ الأَوَّل", "رَبِيعٌ الثَّانِي",
  "جُمَادَى الأُولَى", "جُمَادَى الآخِرَة", "رَجَب", "شَعْبَان",
  "رَمَضَان", "شَوَّال", "ذُو القَعْدَة", "ذُو الحِجَّة",
];

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
    {
      icon: "star",
      labelKey: "namesOfAllah",
      route: "/names",
      color: colors.gold,
      desc: "99 Beautiful Names",
    },
    {
      icon: "settings",
      labelKey: "settings",
      route: "/settings",
      color: colors.primary,
      desc: "Prayer & Language",
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{t.moreTitle}</Text>

      {/* Hijri Calendar Hero Card */}
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View style={styles.hijriCard}>
          <LinearGradient
            colors={[colors.primary, "#1A5C3A", "#0D3021"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            borderRadius={24}
          />

          {/* Stars decoration */}
          <View style={styles.stars}>
            {[...Array(6)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.star,
                  {
                    top: `${[15, 40, 20, 65, 10, 55][i]}%` as any,
                    left: `${[10, 80, 50, 25, 75, 60][i]}%` as any,
                    width: [3, 2, 4, 2, 3, 2][i],
                    height: [3, 2, 4, 2, 3, 2][i],
                    opacity: [0.6, 0.4, 0.8, 0.5, 0.3, 0.7][i],
                  },
                ]}
              />
            ))}
          </View>

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
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Feature Cards */}
      <View style={styles.grid}>
        {features.map((feature, idx) => (
          <Animated.View
            key={feature.route}
            style={{
              flex: 1,
              opacity: fadeAnim,
              transform: [{ translateY: Animated.multiply(slideAnim, new Animated.Value(1 + idx * 0.3)) }],
            }}
          >
            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push(feature.route as any)}
              activeOpacity={0.75}
            >
              <LinearGradient
                colors={[feature.color + "18", feature.color + "06"]}
                style={StyleSheet.absoluteFill}
                borderRadius={20}
              />
              <View style={[styles.featureIcon, { backgroundColor: feature.color + "22" }]}>
                <Ionicons name={feature.icon as any} size={28} color={feature.color} />
              </View>
              <Text style={styles.featureLabel}>
                {t[feature.labelKey as keyof typeof t] as string}
              </Text>
              <Text style={[styles.featureDesc, { color: feature.color + "AA" }]}>
                {feature.desc}
              </Text>
              <View style={[styles.featureArrow, { backgroundColor: feature.color + "20" }]}>
                <Ionicons name="arrow-forward" size={14} color={feature.color} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* About Card */}
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
            <Text style={styles.appName}>Noor</Text>
            <Text style={styles.appNameAr}> — نور</Text>
          </View>
          <Text style={styles.version}>{t.appVersion}</Text>
        </View>
      </View>
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
    title: {
      fontFamily: "Inter_700Bold",
      fontSize: 28,
      color: colors.foreground,
    },
    hijriCard: {
      borderRadius: 24,
      padding: 24,
      overflow: "hidden",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 12,
    },
    stars: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
    star: {
      position: "absolute",
      borderRadius: 99,
      backgroundColor: "#ffffff",
    },
    hijriTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 20,
    },
    hijriLabel: {
      fontFamily: "Inter_500Medium",
      fontSize: 13,
      color: colors.primaryForeground,
      opacity: 0.7,
      letterSpacing: 0.5,
    },
    hijriDateRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 20,
    },
    hijriDay: {
      fontFamily: "Inter_700Bold",
      fontSize: 80,
      color: colors.primaryForeground,
      lineHeight: 88,
    },
    hijriMonthCol: { gap: 2 },
    hijriMonthAr: {
      fontFamily: "Inter_700Bold",
      fontSize: 22,
      color: colors.gold,
    },
    hijriMonth: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 16,
      color: colors.primaryForeground,
      opacity: 0.9,
    },
    hijriYear: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.primaryForeground,
      opacity: 0.6,
    },
    hijriDivider: {
      width: "100%",
      height: 1,
      backgroundColor: colors.primaryForeground + "20",
      marginVertical: 18,
    },
    gregorianRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },
    gregorianDate: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.primaryForeground,
      opacity: 0.7,
    },
    grid: {
      flexDirection: "row",
      gap: 12,
    },
    featureCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      alignItems: "center",
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 4,
    },
    featureIcon: {
      width: 58,
      height: 58,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    featureLabel: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
      color: colors.foreground,
      textAlign: "center",
    },
    featureDesc: {
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      textAlign: "center",
    },
    featureArrow: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 4,
    },
    aboutCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    aboutRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    aboutIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    aboutText: { flex: 1 },
    aboutTitle: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
      color: colors.foreground,
    },
    aboutSub: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 2,
    },
    aboutDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 14,
    },
    versionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    appNameRow: { flexDirection: "row", alignItems: "baseline" },
    appName: {
      fontFamily: "Inter_700Bold",
      fontSize: 16,
      color: colors.primary,
    },
    appNameAr: {
      fontFamily: "Inter_700Bold",
      fontSize: 16,
      color: colors.gold,
    },
    version: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.mutedForeground,
    },
  });
}
