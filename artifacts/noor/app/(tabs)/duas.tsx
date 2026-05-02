import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp, Language } from "@/contexts/AppContext";
import { DUA_CATEGORIES, DUAS, Dua, DuaCategory } from "@/data/duas";
import { useTranslations } from "@/data/translations";
import { useColors } from "@/hooks/useColors";

const CATEGORY_ICONS: Record<DuaCategory, string> = {
  morning: "partly-sunny-outline",
  evening: "moon-outline",
  sleep: "bed-outline",
  waking: "sunny-outline",
  eating: "restaurant-outline",
  mosque: "business-outline",
  travel: "airplane-outline",
  general: "heart-outline",
};

const CATEGORY_COLORS: Record<DuaCategory, string> = {
  morning: "#F59E0B",
  evening: "#6366F1",
  sleep: "#8B5CF6",
  waking: "#F97316",
  eating: "#10B981",
  mosque: "#2D8B6F",
  travel: "#0EA5E9",
  general: "#EC4899",
};

interface DuaCardProps {
  item: Dua;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  translation: string;
  colors: any;
  isWeb: boolean;
}

function DuaCard({ item, isExpanded, onToggle, translation, colors, isWeb }: DuaCardProps) {
  const heightAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;
  const prevExpanded = useRef(isExpanded);

  if (prevExpanded.current !== isExpanded) {
    prevExpanded.current = isExpanded;
    Animated.timing(heightAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 260,
      useNativeDriver: false,
    }).start();
  }

  const handleToggle = () => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(item.id);
  };

  const cardStyles = makeCardStyles(colors);

  return (
    <TouchableOpacity
      style={[cardStyles.card, isExpanded && cardStyles.cardExpanded]}
      onPress={handleToggle}
      activeOpacity={0.85}
    >
      {isExpanded && (
        <LinearGradient
          colors={[colors.primary + "12", "transparent"]}
          style={[StyleSheet.absoluteFill, { borderRadius: 18 }]}
        />
      )}
      <Text style={cardStyles.arabic}>{item.arabic}</Text>
      {isExpanded && (
        <View>
          <View style={cardStyles.divider} />
          <Text style={cardStyles.transliteration}>{item.transliteration}</Text>
          <View style={cardStyles.divider} />
          <Text style={cardStyles.translation}>{translation}</Text>
          <View style={cardStyles.footer}>
            <View style={cardStyles.sourceRow}>
              <Ionicons name="book-outline" size={11} color={colors.gold} />
              <Text style={cardStyles.source}>{item.source}</Text>
            </View>
          </View>
        </View>
      )}
      <View style={cardStyles.chevronRow}>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={15}
          color={isExpanded ? colors.primary : colors.mutedForeground}
        />
      </View>
    </TouchableOpacity>
  );
}

function makeCardStyles(colors: any) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    cardExpanded: {
      borderColor: colors.primary + "40",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    arabic: {
      fontFamily: "Inter_700Bold",
      fontSize: 21,
      color: colors.foreground,
      textAlign: "right",
      lineHeight: 38,
      writingDirection: "rtl",
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 13,
    },
    transliteration: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: colors.gold,
      lineHeight: 22,
      fontStyle: "italic",
    },
    translation: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: colors.foreground,
      lineHeight: 23,
    },
    footer: { marginTop: 12 },
    sourceRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    source: {
      fontFamily: "Inter_500Medium",
      fontSize: 11,
      color: colors.gold,
    },
    chevronRow: {
      alignItems: "center",
      marginTop: 10,
    },
  });
}

export default function DuasScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const t = useTranslations(language);
  const [selected, setSelected] = useState<DuaCategory>("morning");
  const [expanded, setExpanded] = useState<string | null>(null);
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const filteredDuas = DUAS.filter((d) => d.category === selected);
  const catColor = CATEGORY_COLORS[selected];
  const styles = makeStyles(colors, topPad, bottomPad);

  const getTranslation = useCallback((dua: Dua): string => {
    if (language === "fr") return dua.fr;
    if (language === "tr") return dua.tr;
    return dua.en;
  }, [language]);

  const handleToggle = useCallback((id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
  }, []);

  const renderDua = useCallback(({ item }: { item: Dua }) => (
    <DuaCard
      item={item}
      isExpanded={expanded === item.id}
      onToggle={handleToggle}
      translation={getTranslation(item)}
      colors={colors}
      isWeb={isWeb}
    />
  ), [expanded, handleToggle, getTranslation, colors, isWeb]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{t.duasTitle}</Text>
          <View style={[styles.countBadge, { backgroundColor: catColor + "20" }]}>
            <Text style={[styles.countText, { color: catColor }]}>{filteredDuas.length}</Text>
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
        >
          {DUA_CATEGORIES.map((cat) => {
            const active = selected === cat;
            const cc = CATEGORY_COLORS[cat];
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.catChip,
                  active && { backgroundColor: cc + "22", borderColor: cc + "50" },
                ]}
                onPress={() => { setSelected(cat); setExpanded(null); }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={CATEGORY_ICONS[cat] as any}
                  size={14}
                  color={active ? cc : colors.mutedForeground}
                />
                <Text style={[
                  styles.catLabel,
                  active && { color: cc, fontFamily: "Inter_600SemiBold" },
                ]}>
                  {String(t[cat as keyof typeof t] ?? cat)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredDuas}
        keyExtractor={(item) => item.id}
        renderItem={renderDua}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={44} color={colors.mutedForeground} />
            <Text style={styles.emptyText}>No duas in this category</Text>
          </View>
        )}
        removeClippedSubviews
      />
    </View>
  );
}

function makeStyles(colors: any, topPad: number, bottomPad: number) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 16,
      paddingHorizontal: 20,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 16,
    },
    title: {
      fontFamily: "Inter_700Bold",
      fontSize: 28,
      color: colors.foreground,
    },
    countBadge: {
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    countText: {
      fontFamily: "Inter_700Bold",
      fontSize: 13,
    },
    catRow: {
      flexDirection: "row",
      gap: 8,
    },
    catChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 13,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    catLabel: {
      fontFamily: "Inter_500Medium",
      fontSize: 13,
      color: colors.mutedForeground,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: bottomPad + 100,
      gap: 12,
    },
    empty: {
      alignItems: "center",
      paddingTop: 60,
      gap: 14,
    },
    emptyText: {
      fontFamily: "Inter_400Regular",
      fontSize: 15,
      color: colors.mutedForeground,
    },
  });
}
