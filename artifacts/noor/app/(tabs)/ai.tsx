import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : "";

const MODES = [
  { key: "general", label: "Général", emoji: "🌟", desc: "Questions islamiques" },
  { key: "prayer", label: "Prière", emoji: "🕌", desc: "Apprendre la Salah" },
  { key: "quran", label: "Coran", emoji: "📖", desc: "Mémoriser & comprendre" },
  { key: "children", label: "Enfants", emoji: "🌱", desc: "Pour les 6-12 ans" },
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGES: Record<string, string> = {
  general: "Assalam alaykoum ! Je suis Nour, votre assistant islamique. Comment puis-je vous aider aujourd'hui ? 🌙",
  prayer: "Assalam alaykoum ! Je vais vous aider à apprendre la prière pas à pas. Par quoi voulez-vous commencer ? Les conditions ? La Fatiha ? Les mouvements ? 🕌",
  quran: "Assalam alaykoum ! Je suis votre professeur de Coran. Voulez-vous commencer par Al-Fatiha, ou avez-vous une sourate en tête ? 📖",
  children: "Salam ! Moi c'est Nour, ton ami musulman ! 🌟 Tu veux qu'on apprenne ensemble ? On peut parler des prophètes, des 5 piliers, ou des bonnes valeurs ! 😊🕌",
};

export default function AiScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const [mode, setMode] = useState("general");
  const [ageGroup, setAgeGroup] = useState<"adult" | "child">("adult");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showModes, setShowModes] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  const startConversation = async (selectedMode: string) => {
    setMode(selectedMode);
    const effectiveAgeGroup = selectedMode === "children" ? "child" : ageGroup;
    setAgeGroup(effectiveAgeGroup);
    setShowModes(false);

    const welcome: Message = { role: "assistant", content: WELCOME_MESSAGES[selectedMode] || WELCOME_MESSAGES.general };
    setMessages([welcome]);

    try {
      const res = await fetch(`${API_BASE}/api/ai/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: `mobile_${Date.now()}`, mode: selectedMode, ageGroup: effectiveAgeGroup, language: language || "fr" }),
      });
      if (res.ok) {
        const data = await res.json();
        setConversationId(data.conversation.id);
      }
    } catch {}
  };

  const sendMessage = async () => {
    if (!input.trim() || sending || !conversationId) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch(`${API_BASE}/api/ai/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content }),
      });
      if (!res.ok || !res.body) throw new Error("Stream unavailable");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const evt = JSON.parse(line.slice(6));
            if (evt.content) {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: (updated[updated.length - 1].content || "") + evt.content };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "Désolé, une erreur s'est produite. Réessayez. 🙏" };
        return updated;
      });
    } finally {
      setSending(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const styles = makeStyles(colors, topPad, bottomPad);

  if (showModes) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[colors.primary + "30", "transparent"]} style={styles.modeBg} />
        <Text style={styles.modeTitle}>Nour — IA Islamique</Text>
        <Text style={styles.modeSubtitle}>
          Votre assistant intelligent pour apprendre et pratiquer l'islam
        </Text>
        <Text style={styles.nourAr}>نـور</Text>
        <View style={styles.modeGrid}>
          {MODES.map((m) => (
            <TouchableOpacity key={m.key} style={styles.modeCard} onPress={() => startConversation(m.key)} activeOpacity={0.8}>
              <LinearGradient colors={[colors.primary + "25", colors.primary + "08"]} style={StyleSheet.absoluteFill} />
              <Text style={styles.modeEmoji}>{m.emoji}</Text>
              <Text style={styles.modeLabel}>{m.label}</Text>
              <Text style={styles.modeDesc}>{m.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.disclaimer}>
          Propulsé par IA · Les réponses sont basées sur le Coran et la Sunna
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={() => { setShowModes(true); setMessages([]); setConversationId(null); }} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.chatHeaderCenter}>
          <Text style={styles.chatHeaderTitle}>Nour</Text>
          <Text style={styles.chatHeaderSub}>{MODES.find((m) => m.key === mode)?.label} · IA Islamique</Text>
        </View>
        <View style={styles.nourDot} />
      </View>

      {/* Messages */}
      <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={styles.messagesContent} showsVerticalScrollIndicator={false}>
        {messages.map((msg, i) => (
          <View key={i} style={[styles.bubble, msg.role === "user" ? styles.userBubble : styles.aiBubble]}>
            {msg.role === "assistant" && (
              <View style={styles.aiAvatar}>
                <Text style={{ fontSize: 14 }}>✨</Text>
              </View>
            )}
            <View style={[styles.bubbleContent, msg.role === "user" ? styles.userBubbleContent : styles.aiBubbleContent]}>
              <Text style={[styles.bubbleText, msg.role === "user" ? styles.userBubbleText : styles.aiBubbleText]}>
                {msg.content || (sending && i === messages.length - 1 ? "…" : "")}
              </Text>
            </View>
          </View>
        ))}
        {sending && messages[messages.length - 1]?.content === "" && (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.typingText}>Nour réfléchit…</Text>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={[styles.inputRow, { paddingBottom: bottomPad + 8 }]}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Posez votre question…"
          placeholderTextColor={colors.mutedForeground}
          multiline
          maxLength={500}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || sending) && { opacity: 0.4 }]}
          onPress={sendMessage}
          disabled={!input.trim() || sending}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: any, topPad: number, bottomPad: number) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingTop: topPad },
    modeBg: { position: "absolute", top: 0, left: 0, right: 0, height: 300 },
    modeTitle: { fontFamily: "Inter_700Bold", fontSize: 26, color: colors.foreground, textAlign: "center", marginTop: 24, paddingHorizontal: 20 },
    modeSubtitle: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.mutedForeground, textAlign: "center", paddingHorizontal: 30, marginTop: 6 },
    nourAr: { fontFamily: "Inter_700Bold", fontSize: 48, color: colors.gold, textAlign: "center", marginTop: 8 },
    modeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, padding: 20, justifyContent: "center", marginTop: 8 },
    modeCard: {
      width: "45%", borderRadius: 20, padding: 20, gap: 8,
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
      alignItems: "center", overflow: "hidden",
    },
    modeEmoji: { fontSize: 32 },
    modeLabel: { fontFamily: "Inter_700Bold", fontSize: 15, color: colors.foreground },
    modeDesc: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground, textAlign: "center" },
    disclaimer: { fontFamily: "Inter_400Regular", fontSize: 11, color: colors.mutedForeground, textAlign: "center", paddingHorizontal: 30, opacity: 0.6 },
    chatHeader: {
      flexDirection: "row", alignItems: "center", gap: 12,
      paddingHorizontal: 16, paddingVertical: 12,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    backBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.card, alignItems: "center", justifyContent: "center" },
    chatHeaderCenter: { flex: 1 },
    chatHeaderTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: colors.foreground },
    chatHeaderSub: { fontFamily: "Inter_400Regular", fontSize: 11, color: colors.primary },
    nourDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#4CAF50" },
    messages: { flex: 1 },
    messagesContent: { padding: 16, gap: 12, paddingBottom: 20 },
    bubble: { flexDirection: "row", gap: 8, alignItems: "flex-end" },
    userBubble: { flexDirection: "row-reverse" },
    aiBubble: {},
    aiAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary + "30", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    bubbleContent: { maxWidth: "80%", borderRadius: 18, padding: 12 },
    userBubbleContent: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
    aiBubbleContent: { backgroundColor: colors.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
    bubbleText: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21 },
    userBubbleText: { color: "#fff" },
    aiBubbleText: { color: colors.foreground },
    typingIndicator: { flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 36 },
    typingText: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground },
    inputRow: {
      flexDirection: "row", gap: 10, alignItems: "flex-end",
      padding: 12, borderTopWidth: 1, borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    input: {
      flex: 1, backgroundColor: colors.card,
      borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10,
      fontFamily: "Inter_400Regular", fontSize: 14, color: colors.foreground,
      borderWidth: 1, borderColor: colors.border,
      maxHeight: 100,
    },
    sendBtn: {
      width: 42, height: 42, borderRadius: 21,
      backgroundColor: colors.primary,
      alignItems: "center", justifyContent: "center",
    },
  });
}
