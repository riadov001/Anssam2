import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Circle, Svg } from "react-native-svg";
import Reanimated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { PrayerKey, useSpiritual } from "@/contexts/SpiritualContext";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const PRAYER_LABELS: Record<PrayerKey, { label: string; emoji: string; arabic: string }> = {
  fajr:    { label: "Fajr",    emoji: "🌅", arabic: "الفجر" },
  dhuhr:   { label: "Dhuhr",   emoji: "☀️", arabic: "الظهر" },
  asr:     { label: "Asr",     emoji: "🌤️", arabic: "العصر" },
  maghrib: { label: "Maghrib", emoji: "🌙", arabic: "المغرب" },
  isha:    { label: "Isha",    emoji: "🌃", arabic: "العشاء" },
};

const PRAYERS: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

const LEVEL_COLORS: Record<string, string> = {
  low: "#E74C3C",
  medium: "#F39C12",
  high: "#2D8B6F",
  perfect: "#C9A84C",
};

const LEVEL_LABELS: Record<string, string> = {
  low: "À améliorer",
  medium: "En progrès",
  high: "Très bien !",
  perfect: "Parfait !",
};

const RING_R = 88;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R;

function PrayerRow({
  prayerKey,
  done,
  onToggle,
  colors,
  index,
}: {
  prayerKey: PrayerKey;
  done: boolean;
  onToggle: () => void;
  colors: any;
  index: number;
}) {
  const meta = PRAYER_LABELS[prayerKey];
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.88, { damping: 10, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 200 }),
    );
    onToggle();
  };

  return (
    <Reanimated.View entering={FadeInDown.delay(index * 60).duration(350).springify()}>
      <TouchableOpacity
        style={[
          styles.prayerRow,
          { borderColor: done ? colors.primary + "40" : colors.border },
          done && { backgroundColor: colors.primary + "08" },
        ]}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <Text style={styles.prayerEmoji}>{meta.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.prayerLabel, { color: colors.foreground }]}>{meta.label}</Text>
          <Text style={[styles.prayerArabic, { color: colors.mutedForeground }]}>{meta.arabic}</Text>
        </View>
        <Reanimated.View style={[
          styles.checkbox,
          { borderColor: done ? colors.primary : colors.border },
          done && { backgroundColor: colors.primary },
          animStyle,
        ]}>
          {done && <Ionicons name="checkmark" size={14} color="#fff" />}
        </Reanimated.View>
      </TouchableOpacity>
    </Reanimated.View>
  );
}

export default function SpiritualScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  const {
    today, score, streak, weekHistory,
    togglePrayer, setQuranPages, addDhikrSession,
    coachingMessage, coachingLevel,
  } = useSpiritual();

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: score / 100,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [score, progressAnim]);

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [RING_CIRCUMFERENCE, 0],
  });

  const levelColor = LEVEL_COLORS[coachingLevel];
  const levelLabel = LEVEL_LABELS[coachingLevel];
  const prayersDone = PRAYERS.filter((p) => today[p]).length;

  const styles = makeStyles(colors, topPad);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[levelColor + "25", colors.background, colors.background]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        style={{ ...StyleSheet.absoluteFillObject }}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon Parcours Spirituel</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* Score Ring Card */}
        <Reanimated.View entering={ZoomIn.duration(600).springify().damping(14)}>
          <View style={[styles.scoreCard, { borderColor: levelColor + "40" }]}>
            <LinearGradient
              colors={[levelColor + "18", levelColor + "05"]}
              style={{ ...StyleSheet.absoluteFillObject }}
            />
            <View style={styles.ringWrap}>
              <Svg width={206} height={206}>
                <Circle
                  cx={103} cy={103} r={RING_R}
                  stroke={colors.border}
                  strokeWidth={12}
                  fill="transparent"
                />
                <AnimatedCircle
                  cx={103} cy={103} r={RING_R}
                  stroke={levelColor}
                  strokeWidth={12}
                  fill="transparent"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  rotation="-90"
                  origin="103,103"
                />
              </Svg>
              <View style={styles.ringCenter}>
                <Text style={[styles.scoreNumber, { color: levelColor }]}>{score}</Text>
                <Text style={styles.scoreSlash}>/100</Text>
                <View style={[styles.levelBadge, { backgroundColor: levelColor + "22", borderColor: levelColor + "50" }]}>
                  <Text style={[styles.levelText, { color: levelColor }]}>{levelLabel}</Text>
                </View>
              </View>
            </View>

            {/* Streak */}
            <View style={styles.streakRow}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={[styles.streakText, { color: colors.foreground }]}>
                {streak} jour{streak > 1 ? "s" : ""} de suite
              </Text>
              {streak >= 7 && <Text style={styles.streakBadge}>🏆</Text>}
            </View>

            {/* Prayers done quick stat */}
            <View style={styles.quickStats}>
              <View style={styles.quickStat}>
                <Text style={[styles.quickValue, { color: colors.primary }]}>{prayersDone}/5</Text>
                <Text style={[styles.quickLabel, { color: colors.mutedForeground }]}>Prières</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStat}>
                <Text style={[styles.quickValue, { color: colors.gold }]}>{today.quranPages}</Text>
                <Text style={[styles.quickLabel, { color: colors.mutedForeground }]}>Pages Coran</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStat}>
                <Text style={[styles.quickValue, { color: "#9B59B6" }]}>{today.dhikrSessions}</Text>
                <Text style={[styles.quickLabel, { color: colors.mutedForeground }]}>Dhikr</Text>
              </View>
            </View>
          </View>
        </Reanimated.View>

        {/* Weekly history */}
        <Reanimated.View entering={FadeInDown.delay(150).duration(400).springify()}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Cette semaine</Text>
            <View style={styles.weekRow}>
              {weekHistory.map((day, i) => {
                const dayColor = day.score >= 80 ? colors.primary : day.score >= 50 ? colors.gold : day.score > 0 ? "#E74C3C" : colors.border;
                return (
                  <View key={day.date} style={styles.weekDay}>
                    <View style={[styles.weekDot, { backgroundColor: dayColor }]} />
                    <Text style={[styles.weekLabel, { color: colors.mutedForeground }]}>{day.label}</Text>
                    <Text style={[styles.weekScore, { color: day.score > 0 ? colors.foreground : colors.mutedForeground }]}>
                      {day.score > 0 ? day.score : "—"}
                    </Text>
                  </View>
                );
              })}
              {/* Today */}
              <View style={styles.weekDay}>
                <View style={[styles.weekDot, { backgroundColor: levelColor, borderWidth: 2, borderColor: levelColor + "80" }]} />
                <Text style={[styles.weekLabel, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>Auj.</Text>
                <Text style={[styles.weekScore, { color: levelColor, fontFamily: "Inter_700Bold" }]}>{score}</Text>
              </View>
            </View>
          </View>
        </Reanimated.View>

        {/* Prayers checklist */}
        <Reanimated.View entering={FadeInDown.delay(200).duration(400).springify()}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Prières du jour
              <Text style={[styles.sectionBadge, { color: colors.primary }]}>  {prayersDone}/5</Text>
            </Text>
            <View style={styles.prayerList}>
              {PRAYERS.map((p, i) => (
                <PrayerRow
                  key={p}
                  prayerKey={p}
                  done={today[p]}
                  onToggle={() => togglePrayer(p)}
                  colors={colors}
                  index={i}
                />
              ))}
            </View>
          </View>
        </Reanimated.View>

        {/* Quick actions: Quran + Dhikr */}
        <Reanimated.View entering={FadeInDown.delay(300).duration(400).springify()}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Actions rapides</Text>
            <View style={styles.actionsRow}>
              {/* Quran pages */}
              <View style={[styles.actionCard, { borderColor: colors.gold + "40" }]}>
                <LinearGradient colors={[colors.gold + "15", colors.gold + "05"]} style={{ ...StyleSheet.absoluteFillObject }} />
                <Text style={styles.actionEmoji}>📖</Text>
                <Text style={[styles.actionLabel, { color: colors.foreground }]}>Pages du Coran</Text>
                <View style={styles.counterRow}>
                  <TouchableOpacity
                    style={[styles.counterBtn, { backgroundColor: colors.gold + "25" }]}
                    onPress={() => setQuranPages(today.quranPages - 1)}
                  >
                    <Ionicons name="remove" size={16} color={colors.gold} />
                  </TouchableOpacity>
                  <Text style={[styles.counterValue, { color: colors.gold }]}>{today.quranPages}</Text>
                  <TouchableOpacity
                    style={[styles.counterBtn, { backgroundColor: colors.gold + "25" }]}
                    onPress={() => setQuranPages(today.quranPages + 1)}
                  >
                    <Ionicons name="add" size={16} color={colors.gold} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.actionScore, { color: colors.mutedForeground }]}>
                  {today.quranPages >= 3 ? "+20 pts ✓" : today.quranPages >= 1 ? "+12 pts" : "0 pt"}
                </Text>
              </View>

              {/* Dhikr sessions */}
              <View style={[styles.actionCard, { borderColor: "#9B59B640" }]}>
                <LinearGradient colors={["#9B59B615", "#9B59B605"]} style={{ ...StyleSheet.absoluteFillObject }} />
                <Text style={styles.actionEmoji}>🤲</Text>
                <Text style={[styles.actionLabel, { color: colors.foreground }]}>Sessions Dhikr</Text>
                <View style={styles.counterRow}>
                  <View style={[styles.counterValue2, { backgroundColor: "#9B59B620" }]}>
                    <Text style={[styles.counterValue, { color: "#9B59B6" }]}>{today.dhikrSessions}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.dhikrBtn, { backgroundColor: "#9B59B6" }]}
                  onPress={addDhikrSession}
                >
                  <Text style={styles.dhikrBtnText}>+ Compléter</Text>
                </TouchableOpacity>
                <Text style={[styles.actionScore, { color: colors.mutedForeground }]}>
                  {today.dhikrSessions >= 2 ? "+10 pts ✓" : today.dhikrSessions >= 1 ? "+7 pts" : "0 pt"}
                </Text>
              </View>
            </View>
          </View>
        </Reanimated.View>

        {/* Coaching message */}
        <Reanimated.View entering={FadeInUp.delay(350).duration(450).springify()}>
          <View style={[styles.coachingCard, { borderColor: levelColor + "40" }]}>
            <LinearGradient colors={[levelColor + "15", levelColor + "05"]} style={{ ...StyleSheet.absoluteFillObject }} />
            <View style={styles.coachingHeader}>
              <View style={[styles.coachingIcon, { backgroundColor: levelColor + "25" }]}>
                <Ionicons name="heart" size={18} color={levelColor} />
              </View>
              <Text style={[styles.coachingTitle, { color: colors.foreground }]}>Conseil du jour</Text>
            </View>
            <Text style={[styles.coachingText, { color: colors.mutedForeground }]}>
              {coachingMessage}
            </Text>
          </View>
        </Reanimated.View>

        {/* Score breakdown */}
        <Reanimated.View entering={FadeInUp.delay(420).duration(400)}>
          <View style={styles.breakdownCard}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 12 }]}>Calcul du score</Text>
            {[
              { label: "Prières (×14 pts)", value: PRAYERS.filter(p => today[p]).length * 14, max: 70, color: colors.primary },
              { label: "Coran (pages lues)", value: today.quranPages >= 3 ? 20 : today.quranPages >= 1 ? 12 : 0, max: 20, color: colors.gold },
              { label: "Sessions de dhikr", value: today.dhikrSessions >= 2 ? 10 : today.dhikrSessions >= 1 ? 7 : 0, max: 10, color: "#9B59B6" },
            ].map((item) => (
              <View key={item.label} style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
                <View style={styles.breakdownBarBg}>
                  <View style={[styles.breakdownBar, {
                    backgroundColor: item.color,
                    width: `${(item.value / item.max) * 100}%` as any,
                  }]} />
                </View>
                <Text style={[styles.breakdownValue, { color: item.color }]}>{item.value}</Text>
              </View>
            ))}
          </View>
        </Reanimated.View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 12, paddingTop: 12,
  },
  backBtn: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 17 },
  content: { paddingHorizontal: 20, paddingBottom: 120, gap: 16 },

  scoreCard: {
    borderRadius: 24, borderWidth: 1.5, overflow: "hidden",
    padding: 24, alignItems: "center", gap: 16,
  },
  ringWrap: { alignItems: "center", justifyContent: "center" },
  ringCenter: { position: "absolute", alignItems: "center", gap: 2 },
  scoreNumber: { fontFamily: "Inter_700Bold", fontSize: 52, lineHeight: 58 },
  scoreSlash: { fontFamily: "Inter_400Regular", fontSize: 14, opacity: 0.5 },
  levelBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, marginTop: 4 },
  levelText: { fontFamily: "Inter_700Bold", fontSize: 12 },

  streakRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  streakEmoji: { fontSize: 20 },
  streakText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  streakBadge: { fontSize: 18 },

  quickStats: { flexDirection: "row", alignItems: "center", gap: 0 },
  quickStat: { flex: 1, alignItems: "center", gap: 3 },
  quickStatDivider: { width: 1, height: 36, backgroundColor: "rgba(128,128,128,0.2)" },
  quickValue: { fontFamily: "Inter_700Bold", fontSize: 20 },
  quickLabel: { fontFamily: "Inter_400Regular", fontSize: 10 },

  section: { gap: 10 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  sectionBadge: { fontFamily: "Inter_600SemiBold", fontSize: 14 },

  weekRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4 },
  weekDay: { alignItems: "center", gap: 4, flex: 1 },
  weekDot: { width: 12, height: 12, borderRadius: 6 },
  weekLabel: { fontFamily: "Inter_400Regular", fontSize: 10 },
  weekScore: { fontFamily: "Inter_600SemiBold", fontSize: 11 },

  prayerList: { gap: 8 },
  prayerRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 16, borderWidth: 1,
  },
  prayerEmoji: { fontSize: 22, width: 28, textAlign: "center" },
  prayerLabel: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  prayerArabic: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 1 },
  checkbox: {
    width: 26, height: 26, borderRadius: 8, borderWidth: 1.5,
    alignItems: "center", justifyContent: "center",
  },

  actionsRow: { flexDirection: "row", gap: 10 },
  actionCard: {
    flex: 1, borderRadius: 18, borderWidth: 1, padding: 16,
    alignItems: "center", gap: 8, overflow: "hidden",
  },
  actionEmoji: { fontSize: 28 },
  actionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 12, textAlign: "center" },
  counterRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  counterBtn: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  counterValue: { fontFamily: "Inter_700Bold", fontSize: 24 },
  counterValue2: { width: 52, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  dhikrBtn: {
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 7,
  },
  dhikrBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: "#fff" },
  actionScore: { fontFamily: "Inter_400Regular", fontSize: 10 },

  coachingCard: {
    borderRadius: 20, borderWidth: 1, padding: 18, gap: 10, overflow: "hidden",
  },
  coachingHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  coachingIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  coachingTitle: { fontFamily: "Inter_700Bold", fontSize: 15 },
  coachingText: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 22 },

  breakdownCard: {
    borderRadius: 20, padding: 18,
  },
  breakdownRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  breakdownLabel: { fontFamily: "Inter_400Regular", fontSize: 12, width: 160 },
  breakdownBarBg: { flex: 1, height: 6, borderRadius: 3, backgroundColor: "rgba(128,128,128,0.15)" },
  breakdownBar: { height: 6, borderRadius: 3 },
  breakdownValue: { fontFamily: "Inter_700Bold", fontSize: 13, width: 28, textAlign: "right" },
});
