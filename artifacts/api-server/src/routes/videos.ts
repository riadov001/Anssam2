import { Router } from "express";
import { db } from "@workspace/db";
import { videosTable } from "@workspace/db/schema";
import { eq, asc, desc } from "drizzle-orm";

const router = Router();

// GET /api/videos - list published videos
router.get("/videos", async (req, res) => {
  try {
    const videos = await db
      .select()
      .from(videosTable)
      .where(eq(videosTable.isPublished, true))
      .orderBy(asc(videosTable.sortOrder), desc(videosTable.createdAt));
    res.json({ videos });
  } catch (err) {
    req.log.error(err, "Failed to fetch videos");
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

// GET /api/admin/videos - list all videos (admin)
router.get("/admin/videos", async (req, res) => {
  try {
    const videos = await db
      .select()
      .from(videosTable)
      .orderBy(asc(videosTable.sortOrder), desc(videosTable.createdAt));
    res.json({ videos });
  } catch (err) {
    req.log.error(err, "Failed to fetch videos");
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

// POST /api/admin/videos
router.post("/admin/videos", async (req, res) => {
  try {
    const { title, titleAr, titleFr, description, youtubeUrl, thumbnailUrl, category, ageGroup, language, isPublished, sortOrder } = req.body;
    // Build embed URL from youtube URL
    let embedUrl = "";
    if (youtubeUrl) {
      const match = youtubeUrl.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/);
      if (match) embedUrl = `https://www.youtube.com/embed/${match[1]}`;
    }
    const [video] = await db.insert(videosTable).values({
      title, titleAr, titleFr, description, youtubeUrl, embedUrl,
      thumbnailUrl, category: category || "general",
      ageGroup: ageGroup || "all", language: language || "fr",
      isPublished: isPublished ?? false, sortOrder: sortOrder ?? 0,
    }).returning();
    res.status(201).json({ video });
  } catch (err) {
    req.log.error(err, "Failed to create video");
    res.status(500).json({ error: "Failed to create video" });
  }
});

// PUT /api/admin/videos/:id
router.put("/admin/videos/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, titleAr, titleFr, description, youtubeUrl, thumbnailUrl, category, ageGroup, language, isPublished, sortOrder } = req.body;
    let embedUrl = req.body.embedUrl || "";
    if (youtubeUrl) {
      const match = youtubeUrl.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/);
      if (match) embedUrl = `https://www.youtube.com/embed/${match[1]}`;
    }
    const [video] = await db.update(videosTable)
      .set({ title, titleAr, titleFr, description, youtubeUrl, embedUrl, thumbnailUrl, category, ageGroup, language, isPublished, sortOrder, updatedAt: new Date() })
      .where(eq(videosTable.id, id))
      .returning();
    if (!video) return res.status(404).json({ error: "Video not found" });
    res.json({ video });
  } catch (err) {
    req.log.error(err, "Failed to update video");
    res.status(500).json({ error: "Failed to update video" });
  }
});

// DELETE /api/admin/videos/:id
router.delete("/admin/videos/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(videosTable).where(eq(videosTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error(err, "Failed to delete video");
    res.status(500).json({ error: "Failed to delete video" });
  }
});

export default router;
