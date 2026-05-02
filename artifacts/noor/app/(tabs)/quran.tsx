import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { memo, useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "@/components/AppHeader";
import { useApp } from "@/contexts/AppContext";
import { SURAHS, Surah } from "@/data/surahs";
import { useTranslations } from "@/data/translations";
import { useColors } from "@/hooks/useColors";

const GOLD_STARTS = [1, 18, 36, 55, 67, 78, 99, 112];

interface SurahItemProps {
  item: Surah;
  onPress: (id: number) => void;
  colors: any;
  meccan: string;
  medinan: string;
  verses: string;
  isGold: boolean;
}

const SurahItem = memo(
  ({ item, onPress, colors, meccan, medinan, verses, isGold }: SurahItemProps) => {
    const numBg = isGold ? colors.gold + "28" : colors.muted;
    const numColor = isGold ? colors.gold : colors.mutedForeground;
    const arabicColor = isGold ? colors.gold : colors.primary;
    const typeColor = item.type === "M" ? colors.primary : colors.gold;
    const typeBg = item.type === "M" ? colors.primary + "20" : colors.gold + "20";

    return (
      <TouchableOpacity
        style={itemStyles.item}
        onPress={() => onPress(item.id)}
        activeOpacity={0.7}
      >
        {isGold && (
          <LinearGradient
            colors={[colors.gold + "10", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        )}
        <View style={[itemStyles.numberBadge, { backgroundColor: numBg }]}>
          <Text style={[itemStyles.numberText, { color: numColor }]}>{item.id}</Text>
        </View>
        <View style={itemStyles.itemCenter}>
          <View style={itemStyles.nameRow}>
            <Text style={[itemStyles.surahName, { color: colors.foreground }]}>{item.name}</Text>
            <View style={[itemStyles.typeBadge, { backgroundColor: typeBg }]}>
              <Text style={[itemStyles.typeBadgeText, { color: typeColor }]}>
                {item.type === "M" ? meccan : medinan}
              </Text>
            </View>
          </View>
          <Text style={[itemStyles.surahMeta, { color: colors.mutedForeground }]}>
            {item.meaning} · {item.verses} {verses}
          </Text>
        </View>
        <Text style={[itemStyles.arabicName, { color: arabicColor }]}>{item.arabic}</Text>
      </TouchableOpacity>
    );
  }
);

SurahItem.displayName = "SurahItem";

const itemStyles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 4,
    gap: 13,
    overflow: "hidden",
  },
  numberBadge: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  numberText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  itemCenter: { flex: 1, gap: 4 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  surahName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  typeBadge: {
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  typeBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
  },
  surahMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  arabicName: {
    fontFamily: "Inter_700Bold",
    fontSize: 19,
    textAlign: "right",
    flexShrink: 0,
  },
});

export default function QuranScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { language } = useApp();
  const t = useTranslations(language);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "M" | "Madini">("all");
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const filtered = useMemo(() => {
    let list = SURAHS;
    if (activeFilter !== "all") list = list.filter((s) => s.type === activeFilter);
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.meaning.toLowerCase().includes(q) ||
        s.arabic.includes(search) ||
        String(s.id).includes(q)
    );
  }, [search, activeFilter]);

  const handlePress = useCallback(
    (id: number) => { router.push(`/surah/${id}` as any); },
    [router]
  );

  const screenStyles = makeStyles(colors, topPad, bottomPad);

  const renderItem = useCallback(
    ({ item }: { item: Surah }) => (
      <SurahItem
        item={item}
        onPress={handlePress}
        colors={colors}
        meccan={t.meccan}
        medinan={t.medinan}
        verses={t.verses}
        isGold={GOLD_STARTS.includes(item.id)}
      />
    ),
    [handlePress, colors, t]
  );

  return (
    <View style={screenStyles.container}>
      <AppHeader subtitle="Al-Qur'ān al-Karīm" />
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={screenStyles.header}>
            <View style={screenStyles.titleRow}>
              <Text style={screenStyles.title}>{t.quranTitle}</Text>
              <Text style={screenStyles.surahCount}>{filtered.length}</Text>
            </View>
            <View style={screenStyles.searchBar}>
              <Ionicons name="search" size={17} color={colors.mutedForeground} />
              <TextInput
                style={screenStyles.searchInput}
                placeholder={t.searchSurah}
                placeholderTextColor={colors.mutedForeground}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <Ionicons name="close-circle" size={17} color={colors.mutedForeground} />
                </TouchableOpacity>
              )}
            </View>
            <View style={screenStyles.filterRow}>
              {(["all", "M", "Madini"] as const).map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[
                    screenStyles.filterChip,
                    activeFilter === f && screenStyles.filterChipActive,
                  ]}
                  onPress={() => setActiveFilter(f)}
                >
                  <Text style={[
                    screenStyles.filterText,
                    activeFilter === f && screenStyles.filterTextActive,
                  ]}>
                    {f === "all" ? "All" : f === "M" ? t.meccan : t.medinan}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        contentContainerStyle={screenStyles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={screenStyles.separator} />}
        ListEmptyComponent={() => (
          <View style={screenStyles.empty}>
            <Ionicons name="book-outline" size={44} color={colors.mutedForeground} />
            <Text style={screenStyles.emptyText}>No surahs found</Text>
          </View>
        )}
        removeClippedSubviews
        maxToRenderPerBatch={15}
        windowSize={10}
        initialNumToRender={20}
        getItemLayout={(_, index) => ({ length: 74, offset: 74 * index, index })}
      />
    </View>
  );
}

function makeStyles(colors: any, topPad: number, bottomPad: number) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: 16,
      paddingHorizontal: 20,
      paddingBottom: 12,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    titleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
    },
    title: {
      fontFamily: "Inter_700Bold",
      fontSize: 28,
      color: colors.foreground,
    },
    surahCount: {
      fontFamily: "Inter_700Bold",
      fontSize: 18,
      color: colors.gold,
      backgroundColor: colors.gold + "18",
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 4,
      overflow: "hidden",
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 11,
      gap: 9,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    searchInput: {
      flex: 1,
      fontFamily: "Inter_400Regular",
      fontSize: 15,
      color: colors.foreground,
    },
    filterRow: {
      flexDirection: "row",
      gap: 8,
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterText: {
      fontFamily: "Inter_500Medium",
      fontSize: 13,
      color: colors.mutedForeground,
    },
    filterTextActive: {
      color: colors.primaryForeground,
      fontFamily: "Inter_600SemiBold",
    },
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 0,
      paddingBottom: bottomPad + 100,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 4,
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
