import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Reanimated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : "";

const CATEGORIES = [
  { key: "all",        label: "Tous",         emoji: "🍽️" },
  { key: "halal",      label: "Halal",        emoji: "✅" },
  { key: "restaurant", label: "Restaurants",  emoji: "🥘" },
  { key: "butcher",    label: "Boucheries",   emoji: "🥩" },
  { key: "grocery",    label: "Épiceries",    emoji: "🛒" },
];

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function HalalScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  // Use shared GPS location from PrayerTimesContext — no redundant GPS request
  const { latitude, longitude, permissionDenied, locationLoading } = usePrayerTimes();

  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState(3000);
  const [category, setCategory] = useState("all");

  const fetchHalal = useCallback(
    async (lat: number, lng: number) => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `${API_BASE}/api/places/halal?lat=${lat}&lng=${lng}&radius=${radius}`
        );
        if (!res.ok) throw new Error("Erreur serveur");
        const data = await res.json();
        setPlaces(data.places || []);
      } catch {
        setError("Impossible de charger les commerces halal.");
      } finally {
        setLoading(false);
      }
    },
    [radius]
  );

  useEffect(() => {
    if (!locationLoading && latitude && longitude) {
      fetchHalal(latitude, longitude);
    }
  }, [latitude, longitude, locationLoading, fetchHalal]);

  const filteredPlaces =
    category === "all"
      ? places
      : places.filter((p) =>
          p.types?.some((t: string) => t.toLowerCase().includes(category))
        );

  const openMaps = (place: any) => {
    if (place.location?.lat && place.location?.lng) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.id}`;
      Linking.openURL(url);
    }
  };

  const styles = makeStyles(colors, topPad);

  const renderContent = () => {
    if (permissionDenied) {
      return (
        <View style={styles.centerState}>
          <Ionicons name="location-off-outline" size={44} color={colors.gold} />
          <Text style={styles.stateText}>
            Localisation refusée.{"\n"}Activez-la dans les Réglages pour trouver des commerces halal près de vous.
          </Text>
        </View>
      );
    }
    if (locationLoading || loading) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.stateText}>Recherche des commerces halal…</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.centerState}>
          <Text style={{ fontSize: 48 }}>🥩</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => fetchHalal(latitude, longitude)}
          >
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        <Text style={styles.countText}>
          {filteredPlaces.length} résultat{filteredPlaces.length > 1 ? "s" : ""} · {radius / 1000} km
        </Text>
        {filteredPlaces.length === 0 && (
          <View style={styles.centerState}>
            <Text style={{ fontSize: 48 }}>🔍</Text>
            <Text style={styles.stateText}>
              Aucun commerce halal trouvé dans ce rayon.{"\n"}Essayez d'augmenter le rayon.
            </Text>
          </View>
        )}
        {filteredPlaces.map((place, index) => {
          const distKm =
            place.location?.lat && place.location?.lng
              ? haversineKm(latitude, longitude, place.location.lat, place.location.lng)
              : null;
          return (
            <Reanimated.View
              key={place.id}
              entering={FadeInDown.delay(index * 45).duration(320).springify()}
            >
              <TouchableOpacity
                style={styles.card}
                onPress={() => openMaps(place)}
                activeOpacity={0.75}
              >
                <View style={[styles.cardIconWrap, { backgroundColor: colors.gold + "18" }]}>
                  <Text style={{ fontSize: 28 }}>🥩</Text>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardName} numberOfLines={1}>
                      {place.name}
                    </Text>
                    <View style={styles.halalBadge}>
                      <Text style={styles.halalText}>✓ Halal</Text>
                    </View>
                  </View>
                  {place.address ? (
                    <Text style={styles.cardAddress} numberOfLines={1}>
                      {place.address}
                    </Text>
                  ) : null}
                  <View style={styles.cardMeta}>
                    {distKm !== null && (
                      <View style={styles.metaChip}>
                        <Ionicons name="navigate-outline" size={11} color={colors.gold} />
                        <Text style={[styles.metaText, { color: colors.gold }]}>
                          {distKm < 1 ? `${Math.round(distKm * 1000)} m` : `${distKm.toFixed(1)} km`}
                        </Text>
                      </View>
                    )}
                    {place.phone && (
                      <View style={styles.metaChip}>
                        <Ionicons name="call-outline" size={11} color={colors.mutedForeground} />
                        <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                          {place.phone}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </Reanimated.View>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gold + "20", colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.3 }}
        style={{ ...StyleSheet.absoluteFillObject }}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Commerces Halal</Text>
        <TouchableOpacity
          onPress={() => fetchHalal(latitude, longitude)}
          style={styles.refreshBtn}
        >
          <Ionicons name="refresh" size={20} color={colors.gold} />
        </TouchableOpacity>
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
      >
        <View style={styles.catRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.catChip,
                category === cat.key && { backgroundColor: colors.gold, borderColor: colors.gold },
              ]}
              onPress={() => setCategory(cat.key)}
            >
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text
                style={[
                  styles.catText,
                  category === cat.key && { color: "#fff", fontFamily: "Inter_600SemiBold" },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Radius selector */}
      <View style={styles.radiusRow}>
        {[1000, 3000, 5000, 10000].map((r) => (
          <TouchableOpacity
            key={r}
            style={[
              styles.radiusChip,
              radius === r && { backgroundColor: colors.gold + "30", borderColor: colors.gold },
            ]}
            onPress={() => setRadius(r)}
          >
            <Text style={[styles.radiusText, radius === r && { color: colors.gold }]}>
              {r >= 1000 ? `${r / 1000} km` : `${r} m`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderContent()}
    </View>
  );
}

function makeStyles(colors: any, topPad: number) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingTop: topPad + 12, paddingHorizontal: 20, paddingBottom: 8,
    },
    backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.card + "AA", alignItems: "center", justifyContent: "center" },
    headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: colors.foreground },
    refreshBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.card + "AA", alignItems: "center", justifyContent: "center" },
    catScroll: { paddingLeft: 20, marginBottom: 4 },
    catRow: { flexDirection: "row", gap: 8, paddingRight: 20, paddingVertical: 6 },
    catChip: {
      flexDirection: "row", alignItems: "center", gap: 5,
      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    },
    catEmoji: { fontSize: 14 },
    catText: { fontFamily: "Inter_500Medium", fontSize: 12, color: colors.mutedForeground },
    radiusRow: { flexDirection: "row", gap: 8, paddingHorizontal: 20, paddingBottom: 8 },
    radiusChip: {
      paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    },
    radiusText: { fontFamily: "Inter_500Medium", fontSize: 11, color: colors.mutedForeground },
    list: { padding: 20, gap: 10, paddingBottom: 100 },
    countText: { fontFamily: "Inter_500Medium", fontSize: 13, color: colors.mutedForeground, marginBottom: 4 },
    centerState: { alignItems: "center", justifyContent: "center", gap: 12, padding: 40 },
    stateText: { fontFamily: "Inter_400Regular", fontSize: 14, color: colors.mutedForeground, textAlign: "center", lineHeight: 22 },
    errorText: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#F44336", textAlign: "center" },
    retryBtn: { backgroundColor: colors.gold, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
    retryText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#fff" },
    card: {
      backgroundColor: colors.card, borderRadius: 16,
      borderWidth: 1, borderColor: colors.border,
      overflow: "hidden", flexDirection: "row",
      alignItems: "center", padding: 12, gap: 12,
    },
    cardIconWrap: { width: 56, height: 56, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    cardContent: { flex: 1, gap: 4 },
    cardTop: { flexDirection: "row", alignItems: "center", gap: 8 },
    cardName: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.foreground, flex: 1 },
    halalBadge: { backgroundColor: colors.gold + "22", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
    halalText: { fontFamily: "Inter_600SemiBold", fontSize: 10, color: colors.gold },
    cardAddress: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground },
    cardMeta: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    metaChip: { flexDirection: "row", alignItems: "center", gap: 3 },
    metaText: { fontFamily: "Inter_400Regular", fontSize: 11 },
  });
}
