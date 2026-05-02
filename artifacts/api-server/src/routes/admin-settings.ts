import { Router } from "express";
import { db } from "@workspace/db";
import { appSettingsTable, videosTable, islamicEventsTable, aiConversationsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

const router = Router();

// GET /api/admin/stats
router.get("/admin/stats", async (req, res) => {
  try {
    const [videoCount] = await db.select({ count: sql<number>`count(*)::int` }).from(videosTable);
    const [eventCount] = await db.select({ count: sql<number>`count(*)::int` }).from(islamicEventsTable);
    const [convCount] = await db.select({ count: sql<number>`count(*)::int` }).from(aiConversationsTable);
    const [publishedCount] = await db.select({ count: sql<number>`count(*)::int` }).from(videosTable).where(eq(videosTable.isPublished, true));

    res.json({
      stats: {
        totalVideos: videoCount.count,
        publishedVideos: publishedCount.count,
        islamicEvents: eventCount.count,
        aiConversations: convCount.count,
      }
    });
  } catch (err) {
    req.log.error(err, "Failed to fetch stats");
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// GET /api/admin/settings
router.get("/admin/settings", async (req, res) => {
  try {
    const settings = await db.select().from(appSettingsTable);
    const map: Record<string, any> = {};
    for (const s of settings) map[s.key] = s.value;
    res.json({ settings: map });
  } catch (err) {
    req.log.error(err, "Failed to fetch settings");
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// PUT /api/admin/settings/:key
router.put("/admin/settings/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    await db.insert(appSettingsTable)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({ target: appSettingsTable.key, set: { value, updatedAt: new Date() } });
    res.json({ success: true });
  } catch (err) {
    req.log.error(err, "Failed to update setting");
    res.status(500).json({ error: "Failed to update setting" });
  }
});

export default router;
