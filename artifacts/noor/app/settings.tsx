import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  CalculationMethodName,
  Language,
  Madhab,
  useApp,
} from "@/contexts/AppContext";
import { useTranslations } from "@/data/translations";
import { useColors } from "@/hooks/useColors";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { language, setLanguage, calculationMethod, setCalculationMethod, madhab, setMadhab } =
    useApp();
  const t = useTranslations(language);
  const isWeb = Platform.OS === "web";
  const bottomPad = isWeb ? 34 : insets.bottom;
  const styles = makeStyles(colors, bottomPad);

  const LANGUAGES: Language[] = ["en", "ar", "fr", "tr"];
  const METHODS: CalculationMethodName[] = [
    "MWL", "ISNA", "Egypt", "Makkah", "Karachi",
    "Gulf", "Kuwait", "Qatar", "Singapore", "France", "Turkey",
  ];
  const MADHABS: Madhab[] = ["shafi", "hanafi"];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Language */}
      <Text style={styles.sectionTitle}>{t.language}</Text>
      <View style={styles.card}>
        {LANGUAGES.map((lang, idx) => {
          const active = language === lang;
          return (
            <React.Fragment key={lang}>
              <TouchableOpacity
                style={styles.row}
                onPress={() => setLanguage(lang)}
              >
                <Text style={styles.rowLabel}>
                  {t.languages[lang]}
                </Text>
                {active && (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
              {idx < LANGUAGES.length - 1 && (
                <View style={styles.separator} />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Madhab */}
      <Text style={styles.sectionTitle}>{t.madhabSetting}</Text>
      <View style={styles.card}>
        {MADHABS.map((m, idx) => {
          const active = madhab === m;
          return (
            <React.Fragment key={m}>
              <TouchableOpacity
                style={styles.row}
                onPress={() => setMadhab(m)}
              >
                <Text style={styles.rowLabel}>
                  {m === "shafi" ? t.shafi : t.hanafi}
                </Text>
                {active && (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
              {idx < MADHABS.length - 1 && (
                <View style={styles.separator} />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Calculation Method */}
      <Text style={styles.sectionTitle}>{t.calculationMethod}</Text>
      <View style={styles.card}>
        {METHODS.map((method, idx) => {
          const active = calculationMethod === method;
          return (
            <React.Fragment key={method}>
              <TouchableOpacity
                style={styles.row}
                onPress={() => setCalculationMethod(method)}
              >
                <Text style={[styles.rowLabel, { flex: 1 }]}>
                  {t.methods[method]}
                </Text>
                {active && (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
              {idx < METHODS.length - 1 && (
                <View style={styles.separator} />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Privacy */}
      <View style={styles.privacyCard}>
        <Ionicons name="lock-closed-outline" size={18} color={colors.primary} />
        <Text style={styles.privacyText}>{t.noDataCollection}</Text>
      </View>
    </ScrollView>
  );
}

function makeStyles(colors: any, bottomPad: number) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: bottomPad + 40,
      gap: 12,
    },
    sectionTitle: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 12,
      color: colors.mutedForeground,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 4,
      marginTop: 8,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    rowLabel: {
      fontFamily: "Inter_500Medium",
      fontSize: 15,
      color: colors.foreground,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
    },
    privacyCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 8,
    },
    privacyText: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.mutedForeground,
      flex: 1,
    },
  });
}
