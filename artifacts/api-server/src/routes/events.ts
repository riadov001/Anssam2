import { Router } from "express";
import { db } from "@workspace/db";
import { islamicEventsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/events - list active events
router.get("/events", async (req, res) => {
  try {
    const events = await db
      .select()
      .from(islamicEventsTable)
      .where(eq(islamicEventsTable.isActive, true))
      .orderBy(islamicEventsTable.hijriMonth, islamicEventsTable.hijriDay);
    res.json({ events });
  } catch (err) {
    req.log.error(err, "Failed to fetch events");
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// GET /api/admin/events - all events
router.get("/admin/events", async (req, res) => {
  try {
    const events = await db.select().from(islamicEventsTable)
      .orderBy(islamicEventsTable.hijriMonth, islamicEventsTable.hijriDay);
    res.json({ events });
  } catch (err) {
    req.log.error(err, "Failed to fetch events");
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// POST /api/admin/events
router.post("/admin/events", async (req, res) => {
  try {
    const [event] = await db.insert(islamicEventsTable).values(req.body).returning();
    res.status(201).json({ event });
  } catch (err) {
    req.log.error(err, "Failed to create event");
    res.status(500).json({ error: "Failed to create event" });
  }
});

// PUT /api/admin/events/:id
router.put("/admin/events/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [event] = await db.update(islamicEventsTable)
      .set(req.body)
      .where(eq(islamicEventsTable.id, id))
      .returning();
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json({ event });
  } catch (err) {
    req.log.error(err, "Failed to update event");
    res.status(500).json({ error: "Failed to update event" });
  }
});

// DELETE /api/admin/events/:id
router.delete("/admin/events/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(islamicEventsTable).where(eq(islamicEventsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error(err, "Failed to delete event");
    res.status(500).json({ error: "Failed to delete event" });
  }
});

export default router;
