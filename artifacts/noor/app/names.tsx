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
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "@/contexts/AppContext";
import { NAMES_OF_ALLAH, Name } from "@/data/names";
import { useTranslations } from "@/data/translations";
import { useColors } from "@/hooks/useColors";

export default function NamesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const t = useTranslations(language);
  const [search, setSearch] = useState("");
  const isWeb = Platform.OS === "web";
  const bottomPad = isWeb ? 34 : insets.bottom;

  const filtered = useMemo(() => {
    if (!search.trim()) return NAMES_OF_ALLAH;
    const q = search.toLowerCase();
    return NAMES_OF_ALLAH.filter(
      (n) =>
        n.transliteration.toLowerCase().includes(q) ||
        n.en.toLowerCase().includes(q) ||
        n.arabic.includes(search) ||
        String(n.number).includes(q)
    );
  }, [search]);

  const getMeaning = (name: Name): string => {
    if (language === "fr") return name.fr;
    if (language === "tr") return name.tr;
    if (language === "ar") return name.transliteration;
    return name.en;
  };

  const styles = makeStyles(colors, bottomPad);

  const renderItem = ({ item }: { item: Name }) => (
    <View style={styles.nameCard}>
      <View style={styles.numberBadge}>
        <Text style={styles.number}>{item.number}</Text>
      </View>
      <View style={styles.nameContent}>
        <Text style={styles.arabic}>{item.arabic}</Text>
        <Text style={styles.transliteration}>{item.transliteration}</Text>
        <Text style={styles.meaning}>{getMeaning(item)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>{t.asmaUlHusna}</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search names..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.number)}
        renderItem={renderItem}
        numColumns={1}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function makeStyles(colors: any, bottomPad: number) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    subtitle: {
      fontFamily: "Inter_500Medium",
      fontSize: 13,
      color: colors.gold,
      marginBottom: 12,
      letterSpacing: 1,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: colors.foreground,
    },
    list: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: bottomPad + 24,
      gap: 10,
    },
    nameCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 14,
    },
    numberBadge: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor: colors.gold + "20",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    number: {
      fontFamily: "Inter_700Bold",
      fontSize: 14,
      color: colors.gold,
    },
    nameContent: { flex: 1 },
    arabic: {
      fontFamily: "Inter_700Bold",
      fontSize: 20,
      color: colors.primary,
      textAlign: "right",
    },
    transliteration: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 15,
      color: colors.foreground,
      marginTop: 2,
    },
    meaning: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.mutedForeground,
      marginTop: 2,
    },
  });
}
