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

interface Place {
  id: string;
  name: string;
  address: string;
  rating?: number | null;
  userRatingsTotal?: number | null;
  isOpen?: boolean | null;
  location?: { lat: number; lng: number };
  phone?: string | null;
  website?: string | null;
  types?: string[];
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function MosquesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  // Use shared GPS location from PrayerTimesContext — no redundant GPS request
  const { latitude, longitude, permissionDenied, locationLoading } = usePrayerTimes();

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState(5000);

  const fetchMosques = useCallback(
    async (lat: number, lng: number) => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `${API_BASE}/api/places/mosques?lat=${lat}&lng=${lng}&radius=${radius}`
        );
        if (!res.ok) throw new Error("Erreur serveur");
        const data = await res.json();
        setPlaces(data.places || []);
      } catch {
        setError("Impossible de charger les mosquées. Vérifiez votre connexion.");
      } finally {
        setLoading(false);
      }
    },
    [radius]
  );

  useEffect(() => {
    if (!locationLoading && latitude && longitude) {
      fetchMosques(latitude, longitude);
    }
  }, [latitude, longitude, locationLoading, fetchMosques]);

  const openMaps = (place: Place) => {
    if (!place.location) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`;
    Linking.openURL(url);
  };

  const styles = makeStyles(colors, topPad);

  const renderContent = () => {
    if (permissionDenied) {
      return (
        <View style={styles.centerState}>
          <Ionicons name="location-off-outline" size={44} color={colors.primary} />
          <Text style={styles.stateText}>
            Localisation refusée.{"\n"}Activez-la dans les Réglages pour trouver des mosquées près de vous.
          </Text>
        </View>
      );
    }
    if (locationLoading || loading) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.stateText}>Recherche des mosquées…</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.centerState}>
          <Text style={styles.stateEmoji}>🕌</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchMosques(latitude, longitude)}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        <Text style={styles.countText}>
          {places.length} mosquée{places.length > 1 ? "s" : ""} · {radius / 1000} km
        </Text>
        {places.length === 0 && (
          <View style={styles.centerState}>
            <Text style={styles.stateEmoji}>🕌</Text>
            <Text style={styles.stateText}>
              Aucune mosquée trouvée dans ce rayon.{"\n"}Essayez d'augmenter le rayon.
            </Text>
          </View>
        )}
        {places.map((place, index) => {
          const distKm =
            place.location?.lat && place.location?.lng
              ? haversineKm(latitude, longitude, place.location.lat, place.location.lng)
              : null;
          return (
            <Reanimated.View
              key={place.id}
              entering={FadeInDown.delay(index * 50).duration(340).springify()}
            >
              <TouchableOpacity
                style={styles.card}
                onPress={() => openMaps(place)}
                activeOpacity={0.75}
              >
                <View style={[styles.cardIconWrap, { backgroundColor: colors.primary + "20" }]}>
                  <Text style={{ fontSize: 28 }}>🕌</Text>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardName} numberOfLines={1}>
                      {place.name}
                    </Text>
                  </View>
                  {place.address ? (
                    <Text style={styles.cardAddress} numberOfLines={2}>
                      {place.address}
                    </Text>
                  ) : null}
                  <View style={styles.cardMeta}>
                    {distKm !== null && (
                      <View style={styles.metaChip}>
                        <Ionicons name="navigate-outline" size={11} color={colors.primary} />
                        <Text style={[styles.metaText, { color: colors.primary }]}>
                          {distKm < 1
                            ? `${Math.round(distKm * 1000)} m`
                            : `${distKm.toFixed(1)} km`}
                        </Text>
                      </View>
                    )}
                    {place.phone && (
                      <TouchableOpacity
                        style={styles.metaChip}
                        onPress={() => Linking.openURL(`tel:${place.phone}`)}
                      >
                        <Ionicons name="call-outline" size={11} color={colors.mutedForeground} />
                        <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                          {place.phone}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {place.website && (
                      <TouchableOpacity
                        style={styles.metaChip}
                        onPress={() => Linking.openURL(place.website!)}
                      >
                        <Ionicons name="globe-outline" size={11} color={colors.mutedForeground} />
                        <Text style={[styles.metaText, { color: colors.mutedForeground }]}>Site web</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <View style={styles.dirBtn}>
                  <Ionicons name="navigate" size={16} color={colors.primary} />
                </View>
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
        colors={[colors.primary + "20", colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.3 }}
        style={{ ...StyleSheet.absoluteFillObject }}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mosquées à proximité</Text>
        <TouchableOpacity
          onPress={() => fetchMosques(latitude, longitude)}
          style={styles.refreshBtn}
        >
          <Ionicons name="refresh" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Radius selector */}
      <View style={styles.radiusRow}>
        {[1000, 2000, 5000, 10000].map((r) => (
          <TouchableOpacity
            key={r}
            style={[
              styles.radiusChip,
              radius === r && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => setRadius(r)}
          >
            <Text style={[styles.radiusText, radius === r && { color: "#fff" }]}>
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
      paddingTop: topPad + 12, paddingHorizontal: 20, paddingBottom: 12,
    },
    backBtn: {
      width: 36, height: 36, borderRadius: 12,
      backgroundColor: colors.card + "AA", alignItems: "center", justifyContent: "center",
    },
    headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: colors.foreground },
    refreshBtn: {
      width: 36, height: 36, borderRadius: 12,
      backgroundColor: colors.card + "AA", alignItems: "center", justifyContent: "center",
    },
    radiusRow: { flexDirection: "row", gap: 8, paddingHorizontal: 20, paddingBottom: 12 },
    radiusChip: {
      paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    },
    radiusText: { fontFamily: "Inter_500Medium", fontSize: 12, color: colors.mutedForeground },
    list: { padding: 20, gap: 10, paddingBottom: 100 },
    countText: { fontFamily: "Inter_500Medium", fontSize: 13, color: colors.mutedForeground, marginBottom: 4 },
    centerState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 40 },
    stateEmoji: { fontSize: 48 },
    stateText: {
      fontFamily: "Inter_400Regular", fontSize: 14,
      color: colors.mutedForeground, textAlign: "center", lineHeight: 22,
    },
    errorText: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#F44336", textAlign: "center" },
    retryBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
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
    cardAddress: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground },
    cardMeta: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    metaChip: { flexDirection: "row", alignItems: "center", gap: 3 },
    metaText: { fontFamily: "Inter_400Regular", fontSize: 11 },
    dirBtn: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: colors.primary + "18",
      alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    },
  });
}
