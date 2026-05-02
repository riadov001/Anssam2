import { Router } from "express";
import { db } from "@workspace/db";
import { aiConversationsTable, aiMessagesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

const SYSTEM_PROMPTS: Record<string, Record<string, string>> = {
  general: {
    fr: `Tu es Nour, un assistant islamique bienveillant et savant. Tu aides les musulmans dans leur vie spirituelle avec des réponses claires, authentiques et fondées sur le Coran et la Sunna. Tu es doux, encourageant et toujours positif. Tu réponds toujours en français sauf si l'utilisateur écrit dans une autre langue.`,
    en: `You are Nour, a knowledgeable and gentle Islamic companion. You help Muslims in their spiritual life with clear, authentic answers based on the Quran and Sunnah. You are warm, encouraging and always positive.`,
    ar: `أنت نور، مساعد إسلامي متعلم ولطيف. تساعد المسلمين في حياتهم الروحية بإجابات واضحة وأصيلة مستندة إلى القرآن والسنة.`,
    tr: `Sen Nur'sun, bilgili ve nazik bir İslami yardımcısın. Müslümanlara Kuran ve Sünnet'e dayalı net ve özgün cevaplarla manevi yaşamlarında yardımcı olursun.`,
  },
  prayer: {
    fr: `Tu es Nour, un professeur d'islam spécialisé dans l'apprentissage de la prière (salah). Tu expliques les mouvements, les paroles, les conditions et la signification de la prière de manière simple, étape par étape, adaptée aux débutants et aux enfants. Tu utilises des emojis pour rendre les explications ludiques. Réponds en français.`,
    en: `You are Nour, an Islamic teacher specialized in teaching prayer (salah). You explain the movements, words, conditions and meaning of prayer simply, step by step, suitable for beginners and children.`,
  },
  quran: {
    fr: `Tu es Nour, un professeur du Coran bienveillant. Tu aides à apprendre le Coran: mémorisation des sourates, tajweed de base, compréhension des versets. Tu commences toujours par les sourates courtes (Fatiha, Ikhlas, Nas, Falaq, etc.). Tu utilises des répétitions et des encouragements. Réponds en français.`,
    en: `You are Nour, a gentle Quran teacher. You help learn the Quran: memorizing surahs, basic tajweed, understanding verses. You always start with short surahs.`,
  },
  children: {
    fr: `Tu es Nour, un ami musulman pour les enfants ! Tu expliques l'islam de façon très simple, amusante et avec des histoires. Tu utilises beaucoup d'emojis 🌟🕌📖. Tu parles comme à un enfant de 6-12 ans. Tu enseigenes les piliers de l'islam, les prophètes, les bonnes valeurs avec des exemples simples. Réponds toujours en français avec enthousiasme !`,
    en: `You are Nour, a Muslim friend for children! You explain Islam in a very simple, fun way with stories. You use lots of emojis 🌟🕌📖. You speak like to a child aged 6-12.`,
  },
};

function getSystemPrompt(mode: string, ageGroup: string, language: string): string {
  const effectiveMode = ageGroup === "child" ? "children" : mode;
  const prompts = SYSTEM_PROMPTS[effectiveMode] || SYSTEM_PROMPTS.general;
  return prompts[language] || prompts.fr || prompts.en || "";
}

// POST /api/ai/conversations - create new conversation
router.post("/ai/conversations", async (req, res) => {
  try {
    const { sessionId, mode, ageGroup, language } = req.body;
    const [conv] = await db.insert(aiConversationsTable).values({
      sessionId: sessionId || `sess_${Date.now()}`,
      mode: mode || "general",
      ageGroup: ageGroup || "adult",
      language: language || "fr",
    }).returning();
    res.status(201).json({ conversation: conv });
  } catch (err) {
    req.log.error(err, "Failed to create conversation");
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// POST /api/ai/conversations/:id/messages - send message (SSE streaming)
router.post("/ai/conversations/:id/messages", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { message } = req.body;

    if (!message?.trim()) return res.status(400).json({ error: "Message required" });

    // Get conversation
    const [conv] = await db.select().from(aiConversationsTable).where(eq(aiConversationsTable.id, id));
    if (!conv) return res.status(404).json({ error: "Conversation not found" });

    // Save user message
    await db.insert(aiMessagesTable).values({ conversationId: id, role: "user", content: message });

    // Get history (last 20 messages)
    const history = await db.select().from(aiMessagesTable)
      .where(eq(aiMessagesTable.conversationId, id))
      .orderBy(aiMessagesTable.createdAt);
    const last20 = history.slice(-20);

    const systemPrompt = getSystemPrompt(conv.mode, conv.ageGroup, conv.language);

    // Stream response
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";
    const stream = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        ...last20.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // Save assistant message
    await db.insert(aiMessagesTable).values({ conversationId: id, role: "assistant", content: fullResponse });
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error(err, "AI chat error");
    res.write(`data: ${JSON.stringify({ error: "AI unavailable" })}\n\n`);
    res.end();
  }
});

// GET /api/ai/conversations/:id/messages
router.get("/ai/conversations/:id/messages", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const messages = await db.select().from(aiMessagesTable)
      .where(eq(aiMessagesTable.conversationId, id))
      .orderBy(aiMessagesTable.createdAt);
    res.json({ messages });
  } catch (err) {
    req.log.error(err, "Failed to fetch messages");
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

export default router;
