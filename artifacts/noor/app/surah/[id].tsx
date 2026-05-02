import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";
import { SURAHS } from "@/data/surahs";
import { useTranslations } from "@/data/translations";
import { useColors } from "@/hooks/useColors";

interface Verse {
  number: number;
  arabic: string;
  translation: string;
}

const EDITION_MAP: Record<string, string> = {
  en: "en.asad",
  fr: "fr.hamidullah",
  tr: "tr.ates",
  ar: "ar.alafasy",
};

export default function SurahScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const t = useTranslations(language);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const isWeb = Platform.OS === "web";
  const bottomPad = isWeb ? 34 : insets.bottom;

  const surahId = Number(id);
  const surah = SURAHS.find((s) => s.id === surahId);

  const loadSurah = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const edition = language === "ar" ? "ar.alafasy" : EDITION_MAP[language] || "en.asad";

      // Fetch Arabic + translation in parallel
      const [arabicRes, transRes] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${surahId}`),
        language !== "ar"
          ? fetch(`https://api.alquran.cloud/v1/surah/${surahId}/${edition}`)
          : Promise.resolve(null),
      ]);

      const arabicData = await arabicRes.json();
      const arabicAyahs = arabicData?.data?.ayahs || [];

      let transAyahs: any[] = [];
      if (transRes) {
        const transData = await transRes.json();
        transAyahs = transData?.data?.ayahs || [];
      }

      const combined: Verse[] = arabicAyahs.map((ay: any, idx: number) => ({
        number: ay.numberInSurah,
        arabic: ay.text,
        translation:
          language === "ar"
            ? ""
            : transAyahs[idx]?.text || "",
      }));

      setVerses(combined);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [surahId, language]);

  useEffect(() => {
    loadSurah();
  }, [loadSurah]);

  const styles = makeStyles(colors, bottomPad);

  const renderVerse = ({ item }: { item: Verse }) => (
    <View style={styles.verseCard}>
      <View style={styles.verseHeader}>
        <View style={styles.verseBadge}>
          <Text style={styles.verseNum}>{item.number}</Text>
        </View>
      </View>
      <Text style={styles.arabicText}>{item.arabic}</Text>
      {item.translation ? (
        <Text style={styles.translationText}>{item.translation}</Text>
      ) : null}
    </View>
  );

  if (!surah) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Surah not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Surah Header */}
      <View style={styles.surahHeader}>
        <Text style={styles.surahArabic}>{surah.arabic}</Text>
        <Text style={styles.surahName}>{surah.name}</Text>
        <Text style={styles.surahMeta}>
          {surah.meaning} · {surah.verses} {t.verses} ·{" "}
          {surah.type === "M" ? t.meccan : t.medinan}
        </Text>
        {surahId !== 1 && surahId !== 9 && (
          <Text style={styles.bismillah}>
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </Text>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>{t.loading}</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="wifi-outline" size={40} color={colors.mutedForeground} />
          <Text style={styles.errorText}>{t.errorLoading}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadSurah}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={verses}
          keyExtractor={(item) => String(item.number)}
          renderItem={renderVerse}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: bottomPad + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

function makeStyles(colors: any, bottomPad: number) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    surahHeader: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 20,
      alignItems: "center",
    },
    surahArabic: {
      fontFamily: "Inter_700Bold",
      fontSize: 28,
      color: colors.primaryForeground,
      marginBottom: 4,
    },
    surahName: {
      fontFamily: "Inter_700Bold",
      fontSize: 18,
      color: colors.primaryForeground,
    },
    surahMeta: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.primaryForeground,
      opacity: 0.7,
      marginTop: 4,
    },
    bismillah: {
      fontFamily: "Inter_700Bold",
      fontSize: 18,
      color: colors.gold,
      marginTop: 16,
      textAlign: "center",
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      padding: 24,
    },
    loadingText: {
      fontFamily: "Inter_400Regular",
      fontSize: 15,
      color: colors.mutedForeground,
    },
    errorText: {
      fontFamily: "Inter_400Regular",
      fontSize: 15,
      color: colors.mutedForeground,
      textAlign: "center",
    },
    retryBtn: {
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: colors.primary,
    },
    retryText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
      color: colors.primaryForeground,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 12,
      gap: 12,
    },
    verseCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    verseHeader: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginBottom: 12,
    },
    verseBadge: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.gold + "20",
      alignItems: "center",
      justifyContent: "center",
    },
    verseNum: {
      fontFamily: "Inter_700Bold",
      fontSize: 12,
      color: colors.gold,
    },
    arabicText: {
      fontFamily: "Inter_700Bold",
      fontSize: 22,
      color: colors.foreground,
      textAlign: "right",
      lineHeight: 40,
      writingDirection: "rtl",
    },
    translationText: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: colors.mutedForeground,
      marginTop: 12,
      lineHeight: 22,
    },
  });
}
