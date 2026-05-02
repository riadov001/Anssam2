import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

interface AppHeaderProps {
  /** Optional subtitle below the brand (e.g. screen name) */
  subtitle?: string;
  /** When true, hides the search button (rare) */
  hideSearch?: boolean;
}

export function AppHeader({ subtitle, hideSearch }: AppHeaderProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 14 : insets.top + 6;

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingTop: topPad,
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.row}>
        {/* Logo */}
        <View
          style={[
            styles.logoBox,
            { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" },
          ]}
        >
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logoImg}
            resizeMode="contain"
          />
        </View>

        {/* Brand block */}
        <View style={styles.brandCol}>
          <View style={styles.brandRow}>
            <Text style={[styles.brandFr, { color: colors.foreground }]}>Anssam</Text>
            <Text style={[styles.brandSep, { color: colors.mutedForeground }]}>·</Text>
            <Text style={[styles.brandAr, { color: colors.gold }]}>أنسام</Text>
          </View>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]} numberOfLines={1}>
            {subtitle ?? "Votre compagnon spirituel"}
          </Text>
        </View>

        {/* Search */}
        {!hideSearch && (
          <TouchableOpacity
            style={[
              styles.searchBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => router.push("/search" as any)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Ouvrir la recherche"
          >
            <Ionicons name="search" size={18} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Inline search field — visual hint, opens modal on tap */}
      {!hideSearch && (
        <TouchableOpacity
          style={[
            styles.searchBar,
            { backgroundColor: colors.muted, borderColor: colors.border },
          ]}
          onPress={() => router.push("/search" as any)}
          activeOpacity={0.75}
          accessibilityRole="search"
          accessibilityLabel="Rechercher dans toute l'application"
        >
          <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
          <Text style={[styles.searchPlaceholder, { color: colors.mutedForeground }]}>
            Rechercher dans toute l'application…
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    overflow: "hidden",
  },
  logoImg: { width: 36, height: 36 },
  brandCol: { flex: 1, gap: 2 },
  brandRow: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  brandFr: { fontFamily: "Inter_700Bold", fontSize: 19, letterSpacing: 0.2 },
  brandSep: { fontFamily: "Inter_400Regular", fontSize: 16, opacity: 0.5 },
  brandAr: { fontFamily: "Inter_700Bold", fontSize: 18, letterSpacing: 0.5 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 11, opacity: 0.85 },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  searchBar: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchPlaceholder: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 13 },
});
