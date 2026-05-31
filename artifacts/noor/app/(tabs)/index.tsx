import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  RefreshControl,
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
  withSequence,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "@/components/AppHeader";
import { useApp } from "@/contexts/AppContext";
import { useTranslations } from "@/data/translations";
import { useColors } from "@/hooks/useColors";
import {
  PrayerName,
  formatTime,
  getCountdown,
  toHijri,
  usePrayerTimes,
} from "@/hooks/usePrayerTimes";

const PRAYER_ICONS: Record<PrayerName, string> = {
  fajr: "partly-sunny-outline",
  sunrise: "sunny-outline",
  dhuhr: "sunny",
  asr: "cloudy-outline",
  maghrib: "moon-outline",
  isha: "moon",
};

export default function PrayerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const t = useTranslations(language);
  const { times, nextPrayer, loading, error, city, qiblaDirection, calculate } =
    usePrayerTimes();
  const [countdown, setCountdown] = useState("--:--:--");
  const [now, setNow] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const dotAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Reanimated shared values for countdown pulse
  const countdownScale = useSharedValue(1);
  const countdownOpacity = useSharedValue(1);
  const cardGlow = useSharedValue(0.35);

  const countdownStyle = useAnimatedStyle(() => ({
    transform: [{ scale: countdownScale.value }],
    opacity: countdownOpacity.value,
  }));

  const cardGlowStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(201,168,76,${cardGlow.value})`,
  }));

  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Glow pulse on next prayer card
    cardGlow.value = withSequence(
      withTiming(0.6, { duration: 1800 }),
      withTiming(0.25, { duration: 1800 }),
    );
    const glowInterval = setInterval(() => {
      cardGlow.value = withSequence(
        withTiming(0.6, { duration: 1800 }),
        withTiming(0.25, { duration: 1800 }),
      );
    }, 3600);
    return () => clearInterval(glowInterval);
  }, [fadeAnim, cardGlow]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 0.25, duration: 900, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [dotAnim]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
      if (nextPrayer) {
        const newCountdown = getCountdown(nextPrayer.time);
        setCountdown(newCountdown);
        // Pulse the countdown on every second
        countdownScale.value = withSequence(
          withSpring(1.04, { damping: 10, stiffness: 300 }),
          withSpring(1, { damping: 12, stiffness: 200 }),
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [nextPrayer, countdownScale]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (calculate) calculate();
    setTimeout(() => setRefreshing(false), 1200);
  }, [calculate]);

  const hijri = toHijri(now);
  const hijriMonth = t.hijriMonths[hijri.month - 1] || "";
  const styles = makeStyles(colors, topPad, bottomPad);
  const getPrayerLabel = (name: PrayerName): string => t[name] || name;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary + "35", colors.background, colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 0.7 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
        <AppHeader subtitle={`${city} · ${hijri.day} ${hijriMonth} ${hijri.year}`} />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.gold}
              colors={[colors.gold]}
            />
          }
        >
          {/* Date row */}
          <Reanimated.View entering={FadeInDown.duration(500).springify()} style={styles.header}>
            <View>
              <View style={styles.cityRow}>
                <Ionicons name="location-outline" size={14} color={colors.gold} />
                <Text style={styles.cityName}>{city}</Text>
              </View>
              <Text style={styles.hijriDate}>
                {hijri.day} {hijriMonth} {hijri.year} AH
              </Text>
            </View>
            <View style={styles.dateRight}>
              <Text style={styles.gregorianDate}>
                {now.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" })}
              </Text>
              <Text style={styles.gregorianYear}>{now.getFullYear()}</Text>
            </View>
          </Reanimated.View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingCard}>
                <Animated.View style={{ opacity: dotAnim }}>
                  <View style={styles.loadingDot} />
                </Animated.View>
                <Text style={styles.loadingText}>{t.loadingPrayers}</Text>
              </View>
            </View>
          ) : error ? (
            <View style={styles.loadingContainer}>
              <View style={styles.errorCard}>
                <Ionicons name="wifi-outline" size={36} color={colors.gold} />
                <Text style={styles.loadingText}>{error}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {/* Next Prayer Card */}
              {nextPrayer && (
                <Reanimated.View
                  entering={ZoomIn.duration(600).springify().damping(16)}
                  style={[styles.nextCard, cardGlowStyle]}
                >
                  <LinearGradient
                    colors={[colors.primary + "30", colors.primary + "08"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  {/* Shimmer dots */}
                  {[
                    { top: "12%", right: "8%", size: 5, opacity: 0.5 },
                    { top: "60%", left: "5%", size: 3, opacity: 0.3 },
                    { top: "20%", left: "15%", size: 4, opacity: 0.4 },
                  ].map((star, i) => (
                    <View
                      key={i}
                      style={{
                        position: "absolute",
                        width: star.size,
                        height: star.size,
                        borderRadius: star.size / 2,
                        backgroundColor: colors.gold,
                        opacity: star.opacity,
                        top: star.top as any,
                        left: (star as any).left,
                        right: (star as any).right,
                      }}
                    />
                  ))}
                  <View style={styles.nextCardInner}>
                    <View style={styles.nextLabelRow}>
                      <Animated.View style={[styles.liveDot, { opacity: dotAnim }]} />
                      <Text style={styles.nextLabel}>{t.nextPrayer}</Text>
                    </View>
                    <Text style={styles.nextPrayerName}>
                      {getPrayerLabel(nextPrayer.name)}
                    </Text>
                    <Reanimated.Text style={[styles.countdown, countdownStyle]}>
                      {countdown}
                    </Reanimated.Text>
                    <View style={styles.nextTimePill}>
                      <Ionicons
                        name={PRAYER_ICONS[nextPrayer.name] as any}
                        size={14}
                        color={colors.gold}
                      />
                      <Text style={styles.nextTime}>{formatTime(nextPrayer.time)}</Text>
                    </View>
                  </View>
                </Reanimated.View>
              )}

              {/* Prayer Times */}
              <View style={styles.timesCard}>
                {times.map((prayer, idx) => {
                  const isNext = nextPrayer?.name === prayer.name;
                  const isPast = prayer.time < now;
                  return (
                    <Reanimated.View
                      key={prayer.name}
                      entering={FadeInDown.delay(idx * 90).duration(400).springify().damping(14)}
                      style={[
                        styles.prayerRow,
                        isNext && styles.prayerRowNext,
                        idx === times.length - 1 && styles.prayerRowLast,
                      ]}
                    >
                      {isNext && (
                        <LinearGradient
                          colors={[colors.primary + "28", "transparent"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={StyleSheet.absoluteFill}
                        />
                      )}
                      <View style={styles.prayerLeft}>
                        <View style={[styles.prayerIconBg, isNext && styles.prayerIconBgNext]}>
                          <Ionicons
                            name={PRAYER_ICONS[prayer.name] as any}
                            size={17}
                            color={isNext ? colors.primaryForeground : isPast ? colors.mutedForeground : colors.gold}
                          />
                        </View>
                        <View>
                          <Text style={[
                            styles.prayerName,
                            isPast && !isNext && styles.textPast,
                            isNext && styles.prayerNameNext,
                          ]}>
                            {getPrayerLabel(prayer.name)}
                          </Text>
                          {isPast && !isNext && (
                            <Text style={styles.pastLabel}>Passé</Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.prayerRight}>
                        <Text style={[
                          styles.prayerTime,
                          isPast && !isNext && styles.textPast,
                          isNext && styles.prayerTimeNext,
                        ]}>
                          {formatTime(prayer.time)}
                        </Text>
                        {isNext && (
                          <View style={styles.nextBadge}>
                            <Text style={styles.nextBadgeText}>SUIVANTE</Text>
                          </View>
                        )}
                      </View>
                    </Reanimated.View>
                  );
                })}
              </View>

              {/* Qibla */}
              <Reanimated.View
                entering={FadeInUp.delay(600).duration(500).springify().damping(14)}
                style={styles.qiblaCard}
              >
                <LinearGradient
                  colors={[colors.gold + "18", colors.gold + "05"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.qiblaContent}>
                  <View style={styles.qiblaIconWrap}>
                    <Ionicons name="compass" size={32} color={colors.gold} />
                  </View>
                  <View style={styles.qiblaText}>
                    <Text style={styles.qiblaTitle}>{t.qiblaDirection}</Text>
                    <Text style={styles.qiblaSub}>Makkah al-Mukarramah</Text>
                  </View>
                </View>
                <View style={styles.qiblaBadge}>
                  <Text style={styles.qiblaDeg}>{qiblaDirection}°</Text>
                  <Text style={styles.qiblaUnit}>from North</Text>
                </View>
              </Reanimated.View>
            </>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

function makeStyles(colors: any, topPad: number, bottomPad: number) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    scrollContent: {
      paddingTop: 12,
      paddingHorizontal: 20,
      paddingBottom: bottomPad + 100,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 28,
    },
    cityRow: { flexDirection: "row", alignItems: "center", gap: 5 },
    cityName: {
      fontFamily: "Inter_700Bold",
      fontSize: 20,
      color: colors.foreground,
    },
    hijriDate: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.gold,
      marginTop: 4,
    },
    dateRight: { alignItems: "flex-end" },
    gregorianDate: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
      color: colors.foreground,
      opacity: 0.85,
    },
    gregorianYear: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 2,
    },
    loadingContainer: { paddingTop: 60, alignItems: "center" },
    loadingCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 32,
      alignItems: "center",
      gap: 16,
      borderWidth: 1,
      borderColor: colors.border,
      width: "100%",
    },
    errorCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 32,
      alignItems: "center",
      gap: 16,
      borderWidth: 1,
      borderColor: colors.gold + "30",
      width: "100%",
    },
    loadingDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: colors.gold,
    },
    loadingText: {
      fontFamily: "Inter_400Regular",
      fontSize: 15,
      color: colors.mutedForeground,
      textAlign: "center",
    },
    retryBtn: {
      paddingHorizontal: 28,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: colors.primary,
      marginTop: 4,
    },
    retryText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
      color: colors.primaryForeground,
    },
    nextCard: {
      borderRadius: 24,
      padding: 28,
      alignItems: "center",
      marginBottom: 16,
      borderWidth: 1.5,
      borderColor: colors.gold + "35",
      overflow: "hidden",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 10,
      backgroundColor: colors.card,
    },
    nextCardInner: { alignItems: "center", gap: 6 },
    nextLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      marginBottom: 4,
    },
    liveDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#4ADE80",
    },
    nextLabel: {
      fontFamily: "Inter_500Medium",
      fontSize: 11,
      color: colors.gold,
      letterSpacing: 2,
      textTransform: "uppercase",
    },
    nextPrayerName: {
      fontFamily: "Inter_700Bold",
      fontSize: 34,
      color: colors.foreground,
    },
    countdown: {
      fontFamily: "Inter_700Bold",
      fontSize: 44,
      color: colors.primary,
      letterSpacing: 3,
      marginVertical: 4,
    },
    nextTimePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.gold + "18",
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 6,
      marginTop: 4,
    },
    nextTime: {
      fontFamily: "Inter_500Medium",
      fontSize: 14,
      color: colors.gold,
    },
    timesCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      overflow: "hidden",
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    prayerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      overflow: "hidden",
    },
    prayerRowNext: {},
    prayerRowLast: { borderBottomWidth: 0 },
    prayerLeft: { flexDirection: "row", alignItems: "center", gap: 13 },
    prayerRight: { alignItems: "flex-end", gap: 4 },
    prayerIconBg: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    prayerIconBgNext: { backgroundColor: colors.primary },
    prayerName: {
      fontFamily: "Inter_500Medium",
      fontSize: 16,
      color: colors.foreground,
    },
    prayerNameNext: { color: colors.primary, fontFamily: "Inter_700Bold" },
    textPast: { color: colors.mutedForeground, opacity: 0.6 },
    pastLabel: {
      fontFamily: "Inter_400Regular",
      fontSize: 10,
      color: colors.mutedForeground,
      opacity: 0.6,
    },
    prayerTime: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 15,
      color: colors.foreground,
    },
    prayerTimeNext: { color: colors.primary },
    nextBadge: {
      backgroundColor: colors.primary + "25",
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    nextBadgeText: {
      fontFamily: "Inter_700Bold",
      fontSize: 9,
      color: colors.primary,
      letterSpacing: 0.5,
    },
    qiblaCard: {
      borderRadius: 20,
      padding: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: colors.gold + "30",
      overflow: "hidden",
      backgroundColor: colors.card,
      shadowColor: colors.gold,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 4,
    },
    qiblaContent: { flexDirection: "row", alignItems: "center", gap: 14 },
    qiblaIconWrap: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: colors.gold + "18",
      alignItems: "center",
      justifyContent: "center",
    },
    qiblaText: { gap: 3 },
    qiblaTitle: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 16,
      color: colors.foreground,
    },
    qiblaSub: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.mutedForeground,
    },
    qiblaBadge: { alignItems: "flex-end" },
    qiblaDeg: {
      fontFamily: "Inter_700Bold",
      fontSize: 26,
      color: colors.gold,
    },
    qiblaUnit: {
      fontFamily: "Inter_400Regular",
      fontSize: 10,
      color: colors.mutedForeground,
    },
  });
}
