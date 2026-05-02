import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ─── Videos / Shorts ─────────────────────────────────────────────────────────
export const videosTable = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  titleFr: text("title_fr"),
  description: text("description"),
  youtubeUrl: text("youtube_url"),
  embedUrl: text("embed_url"),
  thumbnailUrl: text("thumbnail_url"),
  category: text("category").notNull().default("general"),
  ageGroup: text("age_group").notNull().default("all"),
  language: text("language").notNull().default("fr"),
  isPublished: boolean("is_published").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertVideoSchema = createInsertSchema(videosTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videosTable.$inferSelect;

// ─── Islamic Events ───────────────────────────────────────────────────────────
export const islamicEventsTable = pgTable("islamic_events", {
  id: serial("id").primaryKey(),
  titleEn: text("title_en").notNull(),
  titleAr: text("title_ar").notNull(),
  titleFr: text("title_fr").notNull(),
  titleTr: text("title_tr"),
  descriptionEn: text("description_en"),
  descriptionFr: text("description_fr"),
  descriptionAr: text("description_ar"),
  hijriMonth: integer("hijri_month").notNull(),
  hijriDay: integer("hijri_day").notNull(),
  hijriDayEnd: integer("hijri_day_end"),
  eventType: text("event_type").notNull().default("celebration"),
  isRecurring: boolean("is_recurring").notNull().default(true),
  color: text("color").notNull().default("#C9A065"),
  icon: text("icon").notNull().default("star"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertIslamicEventSchema = createInsertSchema(islamicEventsTable).omit({ id: true, createdAt: true });
export type InsertIslamicEvent = z.infer<typeof insertIslamicEventSchema>;
export type IslamicEvent = typeof islamicEventsTable.$inferSelect;

// ─── AI Conversations ─────────────────────────────────────────────────────────
export const aiConversationsTable = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  mode: text("mode").notNull().default("general"),
  ageGroup: text("age_group").notNull().default("adult"),
  language: text("language").notNull().default("fr"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const aiMessagesTable = pgTable("ai_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAiConversationSchema = createInsertSchema(aiConversationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAiConversation = z.infer<typeof insertAiConversationSchema>;
export type AiConversation = typeof aiConversationsTable.$inferSelect;

// ─── Admin Users ──────────────────────────────────────────────────────────────
export const adminUsersTable = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAdminUserSchema = createInsertSchema(adminUsersTable).omit({ id: true, createdAt: true });
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsersTable.$inferSelect;

// ─── App Settings ─────────────────────────────────────────────────────────────
export const appSettingsTable = pgTable("app_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AppSetting = typeof appSettingsTable.$inferSelect;
