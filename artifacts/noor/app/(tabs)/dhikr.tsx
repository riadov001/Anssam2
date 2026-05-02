import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Circle, Svg } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";
import { useTranslations } from "@/data/translations";
import { useColors } from "@/hooks/useColors";

interface Preset {
  key: string;
  arabic: string;
  transliteration: string;
  target: number;
  color: string;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function DhikrScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const t = useTranslations(language);
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const PRESETS: Preset[] = [
    { key: "subhanAllah", arabic: "سبحان الله", transliteration: "Subḥān Allāh", target: 33, color: colors.primary },
    { key: "alhamdulillah", arabic: "الحمد لله", transliteration: "Al-ḥamdu lillāh", target: 33, color: "#4A90D9" },
    { key: "allahuAkbar", arabic: "الله أكبر", transliteration: "Allāhu Akbar", target: 34, color: colors.gold },
    { key: "laIlaha", arabic: "لا إله إلا الله", transliteration: "Lā ilāha illā Allāh", target: 100, color: "#9B59B6" },
    { key: "astaghfirullah", arabic: "أستغفر الله", transliteration: "Astaghfiru Allāh", target: 100, color: "#E74C3C" },
  ];

  const [count, setCount] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState<Preset>(PRESETS[0]);
  const [completed, setCompleted] = useState(false);
  const [totalSessions, setTotalSessions] = useState(0);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const RING_RADIUS = 90;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

  useEffect(() => {
    const progress = count / selectedPreset.target;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [count, selectedPreset.target, progressAnim]);

  useEffect(() => {
    if (count >= selectedPreset.target && !completed) {
      setCompleted(true);
      setTotalSessions((s) => s + 1);
      if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 250, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.95, duration: 150, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [count, selectedPreset.target, completed, pulseAnim, isWeb]);

  const handlePress = useCallback(() => {
    if (count >= selectedPreset.target) return;
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.90, duration: 55, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }),
    ]).start();
    setCount((c) => c + 1);
  }, [count, selectedPreset.target, scaleAnim, isWeb]);

  const handleReset = useCallback(() => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setCount(0);
      setCompleted(false);
      progressAnim.setValue(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  }, [fadeAnim, progressAnim, isWeb]);

  const selectPreset = useCallback((preset: Preset) => {
    setSelectedPreset(preset);
    setCount(0);
    setCompleted(false);
    progressAnim.setValue(0);
  }, [progressAnim]);

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [RING_CIRCUMFERENCE, 0],
  });

  const styles = makeStyles(colors, topPad, bottomPad);

  const tapGradientColors: [string, string] = completed
    ? ["#4ADE8070", "#4ADE8030"]
    : [selectedPreset.color, selectedPreset.color + "CC"];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[selectedPreset.color + "18", colors.background, colors.background]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t.dhikrTitle}</Text>
          {totalSessions > 0 && (
            <View style={styles.sessionsBadge}>
              <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
              <Text style={styles.sessionsText}>{totalSessions} sets</Text>
            </View>
          )}
        </View>

        {/* Preset Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presetsRow}
        >
          {PRESETS.map((preset) => {
            const active = selectedPreset.key === preset.key;
            return (
              <TouchableOpacity
                key={preset.key}
                style={[
                  styles.presetChip,
                  active && { backgroundColor: preset.color + "25", borderColor: preset.color + "60" },
                ]}
                onPress={() => selectPreset(preset)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.presetLabel,
                  active && { color: preset.color, fontFamily: "Inter_600SemiBold" },
                ]}>
                  {String(t[preset.key as keyof typeof t] ?? preset.key)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Arabic Dhikr */}
        <View style={styles.arabicCard}>
          <LinearGradient
            colors={[selectedPreset.color + "20", selectedPreset.color + "08"]}
            style={StyleSheet.absoluteFill}
          />
          <Text style={[styles.arabicDhikr, { color: selectedPreset.color }]}>
            {selectedPreset.arabic}
          </Text>
          <Text style={styles.transliteration}>{selectedPreset.transliteration}</Text>
        </View>

        {/* SVG Progress Ring */}
        <Animated.View style={[styles.ringContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Svg width={210} height={210} style={styles.svgRing}>
            <Circle
              cx={105}
              cy={105}
              r={RING_RADIUS}
              stroke={colors.border}
              strokeWidth={10}
              fill="transparent"
            />
            <AnimatedCircle
              cx={105}
              cy={105}
              r={RING_RADIUS}
              stroke={completed ? "#4ADE80" : selectedPreset.color}
              strokeWidth={10}
              fill="transparent"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin="105,105"
            />
          </Svg>
          <Animated.View style={[styles.counterCenter, { opacity: fadeAnim }]}>
            <Text style={styles.countNumber}>{count}</Text>
            <Text style={styles.targetText}>/ {selectedPreset.target}</Text>
            {completed && (
              <View style={styles.completeBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#4ADE80" />
                <Text style={[styles.completeText, { color: "#4ADE80" }]}>{t.complete}</Text>
              </View>
            )}
          </Animated.View>
        </Animated.View>

        {/* Tap Button */}
        <Pressable onPress={handlePress} disabled={completed}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <LinearGradient
              colors={tapGradientColors}
              style={styles.tapButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {completed ? (
                <View style={styles.completedInner}>
                  <Ionicons name="checkmark" size={36} color="#fff" />
                  <Text style={styles.completedLabel}>Complete!</Text>
                </View>
              ) : (
                <Text style={styles.tapButtonText}>{selectedPreset.arabic}</Text>
              )}
            </LinearGradient>
          </Animated.View>
        </Pressable>

        {/* Reset */}
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.7}>
          <Ionicons name="refresh" size={16} color={colors.mutedForeground} />
          <Text style={styles.resetText}>{t.reset}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: any, topPad: number, bottomPad: number) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    scrollContent: {
      paddingTop: topPad + 16,
      paddingHorizontal: 24,
      paddingBottom: bottomPad + 100,
      alignItems: "center",
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      alignSelf: "stretch",
      marginBottom: 20,
    },
    title: {
      fontFamily: "Inter_700Bold",
      fontSize: 26,
      color: colors.foreground,
    },
    sessionsBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: colors.primary + "20",
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    sessionsText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 12,
      color: colors.primary,
    },
    presetsRow: {
      flexDirection: "row",
      gap: 8,
      paddingBottom: 4,
      alignSelf: "stretch",
      marginBottom: 8,
    },
    presetChip: {
      paddingHorizontal: 16,
      paddingVertical: 9,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    presetLabel: {
      fontFamily: "Inter_500Medium",
      fontSize: 13,
      color: colors.mutedForeground,
    },
    arabicCard: {
      alignSelf: "stretch",
      borderRadius: 20,
      padding: 24,
      alignItems: "center",
      marginVertical: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      gap: 8,
      backgroundColor: colors.card,
    },
    arabicDhikr: {
      fontFamily: "Inter_700Bold",
      fontSize: 30,
      textAlign: "center",
      lineHeight: 48,
    },
    transliteration: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: colors.mutedForeground,
      fontStyle: "italic",
      textAlign: "center",
    },
    ringContainer: {
      width: 210,
      height: 210,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
    },
    svgRing: {
      position: "absolute",
    },
    counterCenter: {
      alignItems: "center",
      gap: 4,
    },
    countNumber: {
      fontFamily: "Inter_700Bold",
      fontSize: 60,
      color: colors.foreground,
      lineHeight: 68,
    },
    targetText: {
      fontFamily: "Inter_400Regular",
      fontSize: 16,
      color: colors.mutedForeground,
    },
    completeBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginTop: 6,
    },
    completeText: {
      fontFamily: "Inter_700Bold",
      fontSize: 13,
    },
    tapButton: {
      width: 188,
      height: 188,
      borderRadius: 94,
      alignItems: "center",
      justifyContent: "center",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.45,
      shadowRadius: 24,
      elevation: 16,
    },
    tapButtonText: {
      fontFamily: "Inter_700Bold",
      fontSize: 24,
      color: "#fff",
      textAlign: "center",
      paddingHorizontal: 16,
      lineHeight: 38,
    },
    completedInner: { alignItems: "center", gap: 6 },
    completedLabel: {
      fontFamily: "Inter_700Bold",
      fontSize: 14,
      color: "#fff",
    },
    resetBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      marginTop: 28,
      paddingHorizontal: 24,
      paddingVertical: 11,
      borderRadius: 22,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    resetText: {
      fontFamily: "Inter_500Medium",
      fontSize: 14,
      color: colors.mutedForeground,
    },
  });
}
