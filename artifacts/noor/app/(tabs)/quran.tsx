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

import { useApp } from "@/contexts/AppContext";
import { SURAHS, Surah } from "@/data/surahs";
import { useTranslations } from "@/data/translations";
import { useColors } from "@/hooks/useColors";

const JUZ_STARTS: Record<number, number> = {
  1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10,
  11: 11, 12: 12, 13: 13, 14: 14, 15: 15, 16: 16, 17: 17, 18: 18,
  19: 19, 20: 20, 21: 21, 22: 22, 23: 23, 24: 24, 25: 25, 26: 26,
  27: 27, 28: 28, 29: 29, 30: 30,
};

function getSurahJuz(surahId: number): number {
  const thresholds = [
    [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8],
    [9, 9], [10, 10], [11, 11], [12, 12], [13, 13], [14, 14], [15, 15],
    [16, 16], [17, 17], [18, 18], [19, 19], [20, 20], [21, 21], [22, 22],
    [23, 23], [24, 24], [25, 25], [26, 26], [27, 27], [28, 28], [29, 29],
    [30, 30],
  ];
  let juz = 1;
  for (const [sid, j] of thresholds) {
    if (surahId >= sid) juz = j;
  }
  return juz;
}

const GOLD_STARTS = [1, 18, 36, 55, 67, 78, 99, 112];

interface SurahItemProps {
  item: Surah;
  onPress: (id: number) => void;
  colors: any;
  meccan: string;
  medinan: string;
  verses: string;
}

const SurahItem = memo(({ item, onPress, colors, meccan, medinan, verses }: SurahItemProps) => {
  const isSpecial = GOLD_STARTS.includes(item.id);
  return (
    <TouchableOpacity
      style={[styles.item, isSpecial && styles.itemSpecial]}
      onPress={() => onPress(item.id)}
      activeOpacity={0.7}
    >
      {isSpecial && (
        <LinearGradient
          colors={[colors.gold + "12", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
          borderRadius={16}
        />
      )}
      <View style={[styles.numberBadge, isSpecial && { backgroundColor: colors.gold + "28" }]}>
        <Text style={[styles.numberText, isSpecial && { color: colors.gold }]}>{item.id}</Text>
      </View>
      <View style={styles.itemCenter}>
        <View style={styles.nameRow}>
          <Text style={styles.surahName}>{item.name}</Text>
          <View style={[
            styles.typeBadge,
            { backgroundColor: item.type === "M" ? colors.primary + "20" : colors.gold + "20" }
          ]}>
            <Text style={[
              styles.typeBadgeText,
              { color: item.type === "M" ? colors.primary : colors.gold }
            ]}>
              {item.type === "M" ? meccan : medinan}
            </Text>
          </View>
        </View>
        <Text style={styles.surahMeta}>
          {item.meaning} · {item.verses} {verses}
        </Text>
      </View>
      <View style={styles.rightCol}>
        <Text style={[styles.arabicName, isSpecial && { color: colors.gold }]}>{item.arabic}</Text>
        <Text style={styles.juzLabel}>Juz {getSurahJuz(item.id)}</Text>
      </View>
    </TouchableOpacity>
  );
});

SurahItem.displayName = "SurahItem";

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 4,
    gap: 13,
    borderRadius: 16,
    overflow: "hidden",
  },
  itemSpecial: {},
  numberBadge: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  numberText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  itemCenter: { flex: 1, gap: 4 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
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
  rightCol: { alignItems: "flex-end", gap: 4 },
  arabicName: {
    fontFamily: "Inter_700Bold",
    fontSize: 19,
    textAlign: "right",
  },
  juzLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
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

  const handlePress = useCallback((id: number) => {
    router.push(`/surah/${id}` as any);
  }, [router]);

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
      />
    ),
    [handlePress, colors, t]
  );

  const ListHeader = useMemo(() => (
    <View style={screenStyles.header}>
      <View style={screenStyles.titleRow}>
        <Text style={screenStyles.title}>{t.quranTitle}</Text>
        <Text style={screenStyles.surahCount}>{filtered.length} Surahs</Text>
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
            style={[screenStyles.filterChip, activeFilter === f && screenStyles.filterChipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[screenStyles.filterText, activeFilter === f && screenStyles.filterTextActive]}>
              {f === "all" ? "All" : f === "M" ? t.meccan : t.medinan}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  ), [screenStyles, t, filtered.length, search, colors, activeFilter]);

  return (
    <View style={[screenStyles.container]}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
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
      paddingTop: topPad + 16,
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
      fontFamily: "Inter_500Medium",
      fontSize: 13,
      color: colors.mutedForeground,
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
      paddingTop: 8,
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
