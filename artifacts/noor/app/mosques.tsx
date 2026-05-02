import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : "";

interface Place {
  id: string;
  name: string;
  address: string;
  rating?: number;
  userRatingsTotal?: number;
  isOpen?: boolean;
  location?: { lat: number; lng: number };
  photoUrl?: string;
  types?: string[];
}

export default function MosquesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState(5000);

  const fetchMosques = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/places/mosques?lat=${lat}&lng=${lng}&radius=${radius}`);
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();
      setPlaces(data.places || []);
    } catch (e) {
      setError("Impossible de charger les mosquées. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    setLoading(true);
    if (Platform.OS === "web") {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => fetchMosques(pos.coords.latitude, pos.coords.longitude),
          () => { setError("Localisation refusée."); setLoading(false); },
          { timeout: 10000 }
        );
      } else {
        setError("Géolocalisation non disponible.");
        setLoading(false);
      }
    } else {
      (async () => {
        try {
          const Location = require("expo-location");
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") { setError("Permission refusée."); setLoading(false); return; }
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          fetchMosques(loc.coords.latitude, loc.coords.longitude);
        } catch {
          setError("Erreur de localisation."); setLoading(false);
        }
      })();
    }
  };

  useEffect(() => { getLocation(); }, [radius]);

  const openMaps = (place: Place) => {
    if (!place.location) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.id}`;
    Linking.openURL(url);
  };

  const styles = makeStyles(colors, topPad);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mosquées à proximité</Text>
        <TouchableOpacity onPress={getLocation} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Radius selector */}
      <View style={styles.radiusRow}>
        {[1000, 2000, 5000, 10000].map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.radiusChip, radius === r && { backgroundColor: colors.primary }]}
            onPress={() => setRadius(r)}
          >
            <Text style={[styles.radiusText, radius === r && { color: "#fff" }]}>
              {r >= 1000 ? `${r / 1000} km` : `${r} m`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.stateText}>Recherche des mosquées…</Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.centerState}>
          <Text style={styles.stateEmoji}>🕌</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={getLocation}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {places.length === 0 && (
            <View style={styles.centerState}>
              <Text style={styles.stateEmoji}>🕌</Text>
              <Text style={styles.stateText}>Aucune mosquée trouvée dans ce rayon.</Text>
            </View>
          )}
          {places.map((place) => (
            <TouchableOpacity key={place.id} style={styles.card} onPress={() => openMaps(place)} activeOpacity={0.75}>
              {place.photoUrl ? (
                <Image source={{ uri: place.photoUrl }} style={styles.cardImage} />
              ) : (
                <View style={[styles.cardImagePlaceholder, { backgroundColor: colors.primary + "20" }]}>
                  <Text style={{ fontSize: 32 }}>🕌</Text>
                </View>
              )}
              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardName} numberOfLines={1}>{place.name}</Text>
                  {place.isOpen !== undefined && (
                    <View style={[styles.openBadge, { backgroundColor: place.isOpen ? "#4CAF5020" : "#F4433620" }]}>
                      <Text style={[styles.openText, { color: place.isOpen ? "#4CAF50" : "#F44336" }]}>
                        {place.isOpen ? "Ouvert" : "Fermé"}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardAddress} numberOfLines={2}>{place.address}</Text>
                {place.rating && (
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color={colors.gold} />
                    <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
                    {place.userRatingsTotal && (
                      <Text style={styles.ratingCount}>({place.userRatingsTotal})</Text>
                    )}
                  </View>
                )}
              </View>
              <Ionicons name="navigate" size={20} color={colors.primary} style={styles.navIcon} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
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
      backgroundColor: colors.card, alignItems: "center", justifyContent: "center",
    },
    headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: colors.foreground },
    refreshBtn: {
      width: 36, height: 36, borderRadius: 12,
      backgroundColor: colors.card, alignItems: "center", justifyContent: "center",
    },
    radiusRow: { flexDirection: "row", gap: 8, paddingHorizontal: 20, paddingBottom: 12 },
    radiusChip: {
      paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    },
    radiusText: { fontFamily: "Inter_500Medium", fontSize: 12, color: colors.mutedForeground },
    list: { padding: 20, gap: 12, paddingBottom: 100 },
    centerState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 40 },
    stateEmoji: { fontSize: 48 },
    stateText: { fontFamily: "Inter_400Regular", fontSize: 14, color: colors.mutedForeground, textAlign: "center" },
    errorText: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#F44336", textAlign: "center" },
    retryBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
    retryText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#fff" },
    card: {
      backgroundColor: colors.card, borderRadius: 16,
      borderWidth: 1, borderColor: colors.border,
      overflow: "hidden", flexDirection: "row", alignItems: "center",
    },
    cardImage: { width: 80, height: 80 },
    cardImagePlaceholder: { width: 80, height: 80, alignItems: "center", justifyContent: "center" },
    cardContent: { flex: 1, padding: 12, gap: 4 },
    cardTop: { flexDirection: "row", alignItems: "center", gap: 8 },
    cardName: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.foreground, flex: 1 },
    openBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
    openText: { fontFamily: "Inter_500Medium", fontSize: 10 },
    cardAddress: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground },
    ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
    ratingText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: colors.gold },
    ratingCount: { fontFamily: "Inter_400Regular", fontSize: 11, color: colors.mutedForeground },
    navIcon: { marginRight: 14 },
  });
}
