import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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

import { NAMES_OF_ALLAH } from "@/data/names";
import { SURAHS } from "@/data/surahs";
import { useColors } from "@/hooks/useColors";

type ResultKind = "surah" | "name" | "screen";

interface SearchResult {
  kind: ResultKind;
  title: string;
  subtitle: string;
  arabic?: string;
  icon: string;
  color: string;
  route: string;
}

const SCREENS: Omit<SearchResult, "color">[] = [
  { kind: "screen", title: "Heures de prière", subtitle: "Salat, Qibla & calcul",        icon: "time-outline",      route: "/(tabs)/" },
  { kind: "screen", title: "Coran",            subtitle: "114 sourates",                  icon: "book-outline",      route: "/(tabs)/quran" },
  { kind: "screen", title: "Nour IA",          subtitle: "Assistant islamique",           icon: "sparkles-outline",  route: "/(tabs)/ai" },
  { kind: "screen", title: "Vidéos",           subtitle: "Apprendre en regardant",        icon: "play-circle-outline", route: "/(tabs)/videos" },
  { kind: "screen", title: "Tasbih / Dhikr",   subtitle: "Compteur & invocations",        icon: "infinite-outline",  route: "/(tabs)/dhikr" },
  { kind: "screen", title: "Douâs",            subtitle: "Invocations du quotidien",      icon: "hand-left-outline", route: "/(tabs)/duas" },
  { kind: "screen", title: "Qibla",            subtitle: "Direction de La Mecque",        icon: "compass-outline",   route: "/qibla" },
  { kind: "screen", title: "Agenda islamique", subtitle: "Événements du calendrier hijri",icon: "calendar-outline",  route: "/agenda" },
  { kind: "screen", title: "Mosquées",         subtitle: "À proximité de vous",           icon: "location-outline",  route: "/mosques" },
  { kind: "screen", title: "Halal",            subtitle: "Commerces certifiés",           icon: "restaurant-outline",route: "/halal" },
  { kind: "screen", title: "99 Beaux Noms",    subtitle: "Asma' al-Husna",                icon: "star-outline",      route: "/names" },
  { kind: "screen", title: "Paramètres",       subtitle: "Langue, méthode de calcul",     icon: "settings-outline",  route: "/settings" },
];

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 16 : insets.top + 8;

  const results = useMemo<SearchResult[]>(() => {
    const q = normalize(query.trim());

    const screenResults: SearchResult[] = SCREENS.map((s) => ({ ...s, color: colors.primary }));

    if (!q) return screenResults;

    const out: SearchResult[] = [];

    // Screens
    for (const s of screenResults) {
      if (normalize(s.title).includes(q) || normalize(s.subtitle).includes(q)) {
        out.push(s);
      }
    }

    // Surahs
    for (const sr of SURAHS) {
      const hay = `${sr.name} ${sr.meaning} ${sr.arabic} ${sr.id}`;
      if (normalize(hay).includes(q)) {
        out.push({
          kind: "surah",
          title: `${sr.id}. ${sr.name}`,
          subtitle: sr.meaning,
          arabic: sr.arabic,
          icon: "book",
          color: colors.primary,
          route: `/surah/${sr.id}`,
        });
      }
      if (out.length > 60) break;
    }

    // Names of Allah
    for (const n of NAMES_OF_ALLAH) {
      const hay = `${n.transliteration} ${n.en} ${n.fr} ${n.tr} ${n.arabic}`;
      if (normalize(hay).includes(q)) {
        out.push({
          kind: "name",
          title: n.transliteration,
          subtitle: n.fr,
          arabic: n.arabic,
          icon: "star",
          color: colors.gold,
          route: "/names",
        });
      }
      if (out.length > 100) break;
    }

    return out;
  }, [query, colors.primary, colors.gold]);

  const styles = makeStyles(colors, topPad);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.searchField}>
          <Ionicons name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Sourates, douâs, écrans, noms…"
            placeholderTextColor={colors.mutedForeground}
            style={styles.input}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item, i) => `${item.kind}-${item.route}-${i}`}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListHeaderComponent={
          <Text style={styles.sectionLabel}>
            {query ? `${results.length} résultat${results.length > 1 ? "s" : ""}` : "Naviguer"}
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search" size={40} color={colors.mutedForeground} />
            <Text style={styles.emptyText}>Aucun résultat pour « {query} »</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}, ${item.subtitle}`}
          >
            <View style={[styles.itemIcon, { backgroundColor: item.color + "1A" }]}>
              <Ionicons name={item.icon as any} size={18} color={item.color} />
            </View>
            <View style={styles.itemText}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemSub} numberOfLines={1}>{item.subtitle}</Text>
            </View>
            {item.arabic && (
              <Text style={[styles.itemArabic, { color: item.color }]}>{item.arabic}</Text>
            )}
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function makeStyles(colors: any, topPad: number) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row", alignItems: "center", gap: 10,
      paddingTop: topPad, paddingHorizontal: 12, paddingBottom: 10,
      borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
    },
    backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
    searchField: {
      flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
      paddingHorizontal: 12, height: 40, borderRadius: 12,
      backgroundColor: colors.muted, borderWidth: 1, borderColor: colors.border,
    },
    input: {
      flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, color: colors.foreground,
      paddingVertical: 0,
    },
    list: { padding: 16, paddingBottom: 80 },
    sectionLabel: {
      fontFamily: "Inter_600SemiBold", fontSize: 11, color: colors.mutedForeground,
      textTransform: "uppercase", letterSpacing: 1, marginBottom: 10,
    },
    sep: { height: 6 },
    item: {
      flexDirection: "row", alignItems: "center", gap: 12,
      backgroundColor: colors.card, borderRadius: 12, padding: 12,
      borderWidth: 1, borderColor: colors.border,
    },
    itemIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    itemText: { flex: 1, gap: 2 },
    itemTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.foreground },
    itemSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground },
    itemArabic: { fontFamily: "Inter_700Bold", fontSize: 16 },
    empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
    emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, color: colors.mutedForeground, textAlign: "center", paddingHorizontal: 32 },
  });
}
