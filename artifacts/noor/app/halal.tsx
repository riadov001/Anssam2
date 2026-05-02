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

const CATEGORIES = [
  { key: "all", label: "Tous", emoji: "🍽️" },
  { key: "restaurant", label: "Restaurants", emoji: "🥘" },
  { key: "butcher", label: "Boucheries", emoji: "🥩" },
  { key: "grocery", label: "Épiceries", emoji: "🛒" },
  { key: "bakery", label: "Boulangeries", emoji: "🥖" },
];

export default function HalalScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState(3000);
  const [category, setCategory] = useState("all");

  const fetchHalal = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/places/halal?lat=${lat}&lng=${lng}&radius=${radius}`);
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();
      setPlaces(data.places || []);
    } catch {
      setError("Impossible de charger les commerces halal.");
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    setLoading(true);
    if (Platform.OS === "web") {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => fetchHalal(pos.coords.latitude, pos.coords.longitude),
          () => { setError("Localisation refusée."); setLoading(false); },
          { timeout: 10000 }
        );
      } else {
        setError("Géolocalisation non disponible."); setLoading(false);
      }
    } else {
      (async () => {
        try {
          const Location = require("expo-location");
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") { setError("Permission refusée."); setLoading(false); return; }
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          fetchHalal(loc.coords.latitude, loc.coords.longitude);
        } catch { setError("Erreur de localisation."); setLoading(false); }
      })();
    }
  };

  useEffect(() => { getLocation(); }, [radius]);

  const filteredPlaces = category === "all" ? places : places.filter((p) =>
    p.types?.some((t: string) => t.includes(category))
  );

  const openMaps = (place: any) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + " halal")}&query_place_id=${place.id}`;
    Linking.openURL(url);
  };

  const styles = makeStyles(colors, topPad);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Commerces Halal</Text>
        <TouchableOpacity onPress={getLocation} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        <View style={styles.catRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.catChip, category === cat.key && { backgroundColor: colors.primary }]}
              onPress={() => setCategory(cat.key)}
            >
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text style={[styles.catText, category === cat.key && { color: "#fff" }]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Radius selector */}
      <View style={styles.radiusRow}>
        {[1000, 3000, 5000, 10000].map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.radiusChip, radius === r && { backgroundColor: colors.gold + "30", borderColor: colors.gold }]}
            onPress={() => setRadius(r)}
          >
            <Text style={[styles.radiusText, radius === r && { color: colors.gold }]}>
              {r >= 1000 ? `${r / 1000} km` : `${r} m`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.stateText}>Recherche des commerces halal…</Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.centerState}>
          <Text style={{ fontSize: 48 }}>🥩</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={getLocation}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          <Text style={styles.countText}>{filteredPlaces.length} résultat{filteredPlaces.length > 1 ? "s" : ""}</Text>
          {filteredPlaces.length === 0 && (
            <View style={styles.centerState}>
              <Text style={{ fontSize: 48 }}>🔍</Text>
              <Text style={styles.stateText}>Aucun commerce halal trouvé dans ce rayon.</Text>
            </View>
          )}
          {filteredPlaces.map((place) => (
            <TouchableOpacity key={place.id} style={styles.card} onPress={() => openMaps(place)} activeOpacity={0.75}>
              {place.photoUrl ? (
                <Image source={{ uri: place.photoUrl }} style={styles.cardImage} />
              ) : (
                <View style={[styles.cardImagePlaceholder, { backgroundColor: colors.gold + "15" }]}>
                  <Text style={{ fontSize: 28 }}>🥩</Text>
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
                <View style={[styles.halalBadge]}>
                  <Text style={styles.halalText}>✓ Halal</Text>
                </View>
                <Text style={styles.cardAddress} numberOfLines={1}>{place.address}</Text>
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
              <Ionicons name="navigate" size={20} color={colors.gold} style={{ marginRight: 14 }} />
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
      paddingTop: topPad + 12, paddingHorizontal: 20, paddingBottom: 8,
    },
    backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.card, alignItems: "center", justifyContent: "center" },
    headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: colors.foreground },
    refreshBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.card, alignItems: "center", justifyContent: "center" },
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
    radiusChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    radiusText: { fontFamily: "Inter_500Medium", fontSize: 11, color: colors.mutedForeground },
    list: { padding: 20, gap: 10, paddingBottom: 100 },
    countText: { fontFamily: "Inter_500Medium", fontSize: 13, color: colors.mutedForeground, marginBottom: 4 },
    centerState: { alignItems: "center", justifyContent: "center", gap: 12, padding: 40 },
    stateText: { fontFamily: "Inter_400Regular", fontSize: 14, color: colors.mutedForeground, textAlign: "center" },
    errorText: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#F44336", textAlign: "center" },
    retryBtn: { backgroundColor: colors.gold, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
    retryText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#fff" },
    card: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, overflow: "hidden", flexDirection: "row", alignItems: "center" },
    cardImage: { width: 80, height: 80 },
    cardImagePlaceholder: { width: 80, height: 80, alignItems: "center", justifyContent: "center" },
    cardContent: { flex: 1, padding: 12, gap: 3 },
    cardTop: { flexDirection: "row", alignItems: "center", gap: 8 },
    cardName: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.foreground, flex: 1 },
    openBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
    openText: { fontFamily: "Inter_500Medium", fontSize: 10 },
    halalBadge: { backgroundColor: colors.gold + "20", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, alignSelf: "flex-start" },
    halalText: { fontFamily: "Inter_600SemiBold", fontSize: 10, color: colors.gold },
    cardAddress: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground },
    ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    ratingText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: colors.gold },
    ratingCount: { fontFamily: "Inter_400Regular", fontSize: 11, color: colors.mutedForeground },
  });
}
