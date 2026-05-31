import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";
import { useTranslations } from "@/data/translations";
import { useColors } from "@/hooks/useColors";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

const COMPASS_SIZE = 280;

export default function QiblaScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { language } = useApp();
  const t = useTranslations(language);
  const { qiblaDirection, loading, city, latitude, longitude, permissionDenied, refreshLocation } = usePrayerTimes();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  const [deviceHeading, setDeviceHeading] = useState(0);
  const [hasCompass, setHasCompass] = useState(false);
  const needleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Pulse the Kaaba icon
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
    Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, [pulseAnim, fadeAnim]);

  // Device compass (native only) — permission already granted by PrayerTimesContext
  useEffect(() => {
    if (Platform.OS === "web" || permissionDenied) return;
    let sub: any = null;
    (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const Location = require("expo-location");
        sub = await Location.watchHeadingAsync((heading: any) => {
          const h = heading.trueHeading > 0 ? heading.trueHeading : heading.magHeading;
          setDeviceHeading(h || 0);
          setHasCompass(true);
        });
      } catch {}
    })();
    return () => { if (sub) sub.remove(); };
  }, [permissionDenied]);

  // Animate needle
  useEffect(() => {
    const qiblaAngle = qiblaDirection - deviceHeading;
    Animated.spring(needleAnim, {
      toValue: qiblaAngle,
      useNativeDriver: true,
      tension: 40,
      friction: 8,
    }).start();
  }, [qiblaDirection, deviceHeading, needleAnim]);

  const needleRotation = needleAnim.interpolate({
    inputRange: [-360, 360],
    outputRange: ["-360deg", "360deg"],
  });

  const accuracy = Math.abs((qiblaDirection - deviceHeading) % 10);
  const isAligned = hasCompass && accuracy < 5;

  const styles = makeStyles(colors, topPad);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Direction Qibla</Text>
        <View style={{ width: 36 }} />
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

        {/* Permission denied banner */}
        {permissionDenied && (
          <View style={styles.permissionCard}>
            <Ionicons name="location-off-outline" size={20} color={colors.gold} />
            <View style={{ flex: 1 }}>
              <Text style={styles.permissionTitle}>Localisation désactivée</Text>
              <Text style={styles.permissionSub}>
                La direction est calculée depuis Makkah par défaut.
              </Text>
            </View>
            <TouchableOpacity style={styles.permissionBtn} onPress={refreshLocation}>
              <Text style={styles.permissionBtnText}>Activer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* City info */}
        <View style={styles.cityRow}>
          <Ionicons name="location" size={16} color={permissionDenied ? colors.mutedForeground : colors.primary} />
          <Text style={[styles.cityText, permissionDenied && { opacity: 0.5 }]}>{city}</Text>
        </View>

        {/* Compass */}
        <View style={styles.compassOuter}>
          {/* Background circles */}
          <View style={[styles.compassRing, { width: COMPASS_SIZE + 40, height: COMPASS_SIZE + 40, borderRadius: (COMPASS_SIZE + 40) / 2, borderColor: colors.primary + "20" }]} />
          <View style={[styles.compassRing, { width: COMPASS_SIZE + 20, height: COMPASS_SIZE + 20, borderRadius: (COMPASS_SIZE + 20) / 2, borderColor: colors.primary + "30" }]} />

          <LinearGradient
            colors={["#0D3021", "#1A5C3A", "#0D3021"]}
            style={[styles.compassFace, { width: COMPASS_SIZE, height: COMPASS_SIZE, borderRadius: COMPASS_SIZE / 2 }]}
          >
            {/* Cardinal directions */}
            {[
              { label: "N", angle: 0, top: 8, left: "50%", marginLeft: -8 },
              { label: "S", angle: 180, bottom: 8, left: "50%", marginLeft: -6 },
              { label: "E", angle: 90, right: 8, top: "50%", marginTop: -10 },
              { label: "W", angle: 270, left: 8, top: "50%", marginTop: -10 },
            ].map(({ label, ...pos }) => (
              <Text key={label} style={[styles.cardinal, pos as any]}>{label}</Text>
            ))}

            {/* Degree ticks */}
            {Array.from({ length: 72 }).map((_, i) => {
              const angle = (i * 5 * Math.PI) / 180;
              const isMajor = i % 9 === 0;
              const r = COMPASS_SIZE / 2 - (isMajor ? 22 : 16);
              const x = COMPASS_SIZE / 2 + r * Math.sin(angle);
              const y = COMPASS_SIZE / 2 - r * Math.cos(angle);
              return (
                <View
                  key={i}
                  style={{
                    position: "absolute",
                    width: isMajor ? 2 : 1,
                    height: isMajor ? 10 : 6,
                    backgroundColor: isMajor ? colors.gold + "80" : colors.primaryForeground + "30",
                    left: x - (isMajor ? 1 : 0.5),
                    top: y - (isMajor ? 5 : 3),
                    transform: [{ rotate: `${i * 5}deg` }],
                  }}
                />
              );
            })}

            {/* Animated needle */}
            <Animated.View style={[styles.needleWrap, { transform: [{ rotate: needleRotation }] }]}>
              {/* North needle (red) */}
              <View style={[styles.needleHalf, styles.needleNorth]} />
              {/* Kaaba icon at tip */}
              <Animated.View style={[styles.kaabaIcon, { transform: [{ scale: pulseAnim }] }]}>
                <Text style={styles.kaabaEmoji}>🕋</Text>
              </Animated.View>
              {/* South needle */}
              <View style={[styles.needleHalf, styles.needleSouth]} />
            </Animated.View>

            {/* Center dot */}
            <View style={styles.centerDot} />
          </LinearGradient>
        </View>

        {/* Direction info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoValue}>{qiblaDirection}°</Text>
              <Text style={styles.infoLabel}>Direction Qibla</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoValue}>{Math.round(deviceHeading)}°</Text>
              <Text style={styles.infoLabel}>Cap appareil</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Text style={[styles.infoValue, { color: isAligned ? "#4CAF50" : colors.gold }]}>
                {isAligned ? "✓" : hasCompass ? `${Math.round(accuracy)}°` : "—"}
              </Text>
              <Text style={styles.infoLabel}>{isAligned ? "Aligné" : "Écart"}</Text>
            </View>
          </View>
        </View>

        {/* Status */}
        {!hasCompass && !isWeb && (
          <View style={styles.warningCard}>
            <Ionicons name="information-circle" size={18} color={colors.gold} />
            <Text style={styles.warningText}>
              Boussole non disponible. Direction calculée depuis votre position GPS.
            </Text>
          </View>
        )}

        {isAligned && (
          <View style={styles.alignedCard}>
            <Text style={styles.alignedText}>🕋 Vous faites face à la Qibla !</Text>
          </View>
        )}

        {/* Coordinates */}
        <Text style={styles.coordsText}>
          {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E → La Mecque 21.4225°N, 39.8262°E
        </Text>
      </Animated.View>
    </View>
  );
}

function makeStyles(colors: any, topPad: number) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: topPad + 12,
      paddingHorizontal: 20,
      paddingBottom: 12,
    },
    backBtn: {
      width: 36, height: 36, borderRadius: 12,
      backgroundColor: colors.card,
      alignItems: "center", justifyContent: "center",
    },
    headerTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 18,
      color: colors.foreground,
    },
    content: { flex: 1, alignItems: "center", paddingHorizontal: 20, gap: 20 },
    cityRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    cityText: { fontFamily: "Inter_500Medium", fontSize: 14, color: colors.mutedForeground },
    compassOuter: { alignItems: "center", justifyContent: "center" },
    compassRing: { position: "absolute", borderWidth: 1 },
    compassFace: { overflow: "hidden", alignItems: "center", justifyContent: "center" },
    cardinal: {
      position: "absolute",
      fontFamily: "Inter_700Bold",
      fontSize: 12,
      color: colors.gold,
    },
    needleWrap: {
      position: "absolute",
      width: 4,
      height: COMPASS_SIZE - 60,
      alignItems: "center",
    },
    needleHalf: { flex: 1, width: 3, borderRadius: 2 },
    needleNorth: { backgroundColor: colors.gold },
    needleSouth: { backgroundColor: colors.primaryForeground + "40" },
    kaabaIcon: { position: "absolute", top: -20, alignItems: "center" },
    kaabaEmoji: { fontSize: 22 },
    centerDot: {
      position: "absolute",
      width: 14, height: 14, borderRadius: 7,
      backgroundColor: colors.gold,
      borderWidth: 2,
      borderColor: colors.background,
    },
    infoCard: {
      width: "100%",
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around" },
    infoItem: { alignItems: "center", gap: 4 },
    infoValue: { fontFamily: "Inter_700Bold", fontSize: 22, color: colors.foreground },
    infoLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: colors.mutedForeground },
    infoDivider: { width: 1, height: 40, backgroundColor: colors.border },
    warningCard: {
      flexDirection: "row", gap: 8, alignItems: "flex-start",
      backgroundColor: colors.gold + "15",
      borderRadius: 14, padding: 14,
      borderWidth: 1, borderColor: colors.gold + "30",
    },
    warningText: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground, flex: 1 },
    alignedCard: {
      backgroundColor: "#4CAF5015",
      borderRadius: 14, padding: 14,
      borderWidth: 1, borderColor: "#4CAF5040",
    },
    alignedText: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#4CAF50", textAlign: "center" },
    coordsText: {
      fontFamily: "Inter_400Regular", fontSize: 10,
      color: colors.mutedForeground, textAlign: "center", opacity: 0.6,
    },
    permissionCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: colors.gold + "15",
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.gold + "35",
      width: "100%",
    },
    permissionTitle: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 13,
      color: colors.foreground,
    },
    permissionSub: {
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      color: colors.mutedForeground,
      marginTop: 2,
    },
    permissionBtn: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
    permissionBtnText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 12,
      color: colors.primaryForeground,
    },
  });
}
