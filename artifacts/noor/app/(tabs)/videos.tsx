import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : "";

const AGE_GROUPS = [
  { key: "all", label: "Tous", emoji: "🎬" },
  { key: "children", label: "Enfants", emoji: "🌱" },
  { key: "youth", label: "Jeunes", emoji: "⭐" },
  { key: "adult", label: "Adultes", emoji: "📚" },
];

const CATEGORIES = [
  { key: "all", label: "Tout" },
  { key: "quran", label: "Coran" },
  { key: "prayer", label: "Prière" },
  { key: "stories", label: "Histoires" },
  { key: "nasheeds", label: "Nasheeds" },
  { key: "general", label: "Général" },
];

// Demo videos shown when no backend data
const DEMO_VIDEOS = [
  {
    id: "demo1",
    title: "Comment faire la prière",
    titleFr: "Comment faire la prière — Guide complet",
    description: "Apprenez les étapes de la salah étape par étape.",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    embedUrl: "",
    thumbnailUrl: null,
    category: "prayer",
    ageGroup: "all",
    isPlaceholder: true,
  },
];

export default function VideosScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ageGroup, setAgeGroup] = useState("all");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/videos`);
        if (res.ok) {
          const data = await res.json();
          setVideos(data.videos?.length > 0 ? data.videos : DEMO_VIDEOS);
        } else {
          setVideos(DEMO_VIDEOS);
        }
      } catch {
        setVideos(DEMO_VIDEOS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = videos.filter((v) => {
    if (ageGroup !== "all" && v.ageGroup !== "all" && v.ageGroup !== ageGroup) return false;
    if (category !== "all" && v.category !== category) return false;
    return true;
  });

  const openVideo = (video: any) => {
    const url = video.youtubeUrl || video.embedUrl;
    if (url) Linking.openURL(url);
  };

  const styles = makeStyles(colors, topPad, bottomPad);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vidéos Islamiques</Text>

      {/* Age group tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filterRow}>
          {AGE_GROUPS.map((ag) => (
            <TouchableOpacity
              key={ag.key}
              style={[styles.filterChip, ageGroup === ag.key && { backgroundColor: colors.primary }]}
              onPress={() => setAgeGroup(ag.key)}
            >
              <Text style={styles.filterEmoji}>{ag.emoji}</Text>
              <Text style={[styles.filterText, ageGroup === ag.key && { color: "#fff" }]}>{ag.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Category */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.filterScroll, { marginTop: -4 }]}>
        <View style={styles.filterRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.catChip, category === cat.key && { backgroundColor: colors.gold + "30", borderColor: colors.gold }]}
              onPress={() => setCategory(cat.key)}
            >
              <Text style={[styles.catText, category === cat.key && { color: colors.gold }]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {!loading && filtered.length === 0 && (
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>🎬</Text>
            <Text style={styles.emptyText}>Aucune vidéo disponible pour le moment.</Text>
            <Text style={styles.emptySubtext}>L'administrateur peut ajouter des vidéos via l'espace admin.</Text>
          </View>
        )}
        {filtered.map((video) => (
          <TouchableOpacity key={video.id} style={styles.card} onPress={() => openVideo(video)} activeOpacity={0.8}>
            <LinearGradient colors={[colors.primary + "15", colors.gold + "10"]} style={StyleSheet.absoluteFill} />
            <View style={styles.thumbWrap}>
              {video.thumbnailUrl ? (
                <Image source={{ uri: video.thumbnailUrl }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumbPlaceholder, { backgroundColor: colors.primary + "25" }]}>
                  <Ionicons name="play-circle" size={40} color={colors.primary} />
                </View>
              )}
              <View style={styles.playOverlay}>
                <Ionicons name="play" size={18} color="#fff" />
              </View>
            </View>
            <View style={styles.cardInfo}>
              <View style={styles.cardBadges}>
                <View style={[styles.badge, { backgroundColor: colors.primary + "20" }]}>
                  <Text style={[styles.badgeText, { color: colors.primary }]}>{video.category}</Text>
                </View>
                {video.ageGroup !== "all" && (
                  <View style={[styles.badge, { backgroundColor: colors.gold + "20" }]}>
                    <Text style={[styles.badgeText, { color: colors.gold }]}>{video.ageGroup}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardTitle} numberOfLines={2}>{video.titleFr || video.title}</Text>
              {video.description && (
                <Text style={styles.cardDesc} numberOfLines={2}>{video.description}</Text>
              )}
              <View style={styles.cardFooter}>
                <Ionicons name="logo-youtube" size={14} color="#FF0000" />
                <Text style={styles.cardFooterText}>Voir sur YouTube</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: any, topPad: number, bottomPad: number) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingTop: topPad + 16 },
    title: { fontFamily: "Inter_700Bold", fontSize: 26, color: colors.foreground, paddingHorizontal: 20, marginBottom: 14 },
    filterScroll: { paddingLeft: 20, marginBottom: 8 },
    filterRow: { flexDirection: "row", gap: 8, paddingRight: 20, paddingVertical: 4 },
    filterChip: {
      flexDirection: "row", alignItems: "center", gap: 5,
      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    },
    filterEmoji: { fontSize: 14 },
    filterText: { fontFamily: "Inter_500Medium", fontSize: 12, color: colors.mutedForeground },
    catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    catText: { fontFamily: "Inter_500Medium", fontSize: 12, color: colors.mutedForeground },
    list: { padding: 16, gap: 14, paddingBottom: bottomPad + 100 },
    empty: { alignItems: "center", gap: 12, paddingTop: 60 },
    emptyText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.mutedForeground, textAlign: "center" },
    emptySubtext: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground, textAlign: "center", opacity: 0.7, paddingHorizontal: 20 },
    card: {
      borderRadius: 20, backgroundColor: colors.card,
      borderWidth: 1, borderColor: colors.border,
      overflow: "hidden", flexDirection: "row", gap: 14, padding: 12,
    },
    thumbWrap: { width: 100, height: 100, borderRadius: 14, overflow: "hidden", position: "relative" },
    thumb: { width: 100, height: 100 },
    thumbPlaceholder: { width: 100, height: 100, alignItems: "center", justifyContent: "center" },
    playOverlay: {
      position: "absolute", bottom: 6, right: 6,
      width: 28, height: 28, borderRadius: 14,
      backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center",
    },
    cardInfo: { flex: 1, gap: 6 },
    cardBadges: { flexDirection: "row", gap: 6 },
    badge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
    badgeText: { fontFamily: "Inter_500Medium", fontSize: 10, textTransform: "capitalize" },
    cardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.foreground, lineHeight: 20 },
    cardDesc: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground, lineHeight: 17 },
    cardFooter: { flexDirection: "row", alignItems: "center", gap: 5 },
    cardFooterText: { fontFamily: "Inter_400Regular", fontSize: 11, color: colors.mutedForeground },
  });
}
