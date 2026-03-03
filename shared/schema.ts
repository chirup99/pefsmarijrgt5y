import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  role: text("role"),
  bio: text("bio"),
  instagram: text("instagram"),
  linkedin: text("linkedin"),
  whatsapp: text("whatsapp"),
  website: text("website"),
  uniqueSlug: varchar("unique_slug", { length: 5 }).unique(),
  cards: text("cards").array(), // Array of JSON strings representing different card types
  createdAt: timestamp("created_at").defaultNow(),
});

export const cardSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("pitch"),
    title: z.string(),
    content: z.string(),
  }),
  z.object({
    type: z.literal("reel"),
    title: z.string(),
    url: z.string(),
  }),
  z.object({
    type: z.literal("revenue"),
    title: z.string(),
    value: z.string(),
    imageUrl: z.string().optional(),
  }),
  z.object({
    type: z.literal("product"),
    title: z.string(),
    imageUrls: z.array(z.string()).max(2),
  }),
]);

export type CardData = z.infer<typeof cardSchema>;

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  name: true,
  role: true,
  bio: true,
  instagram: true,
  linkedin: true,
  whatsapp: true,
  website: true,
  cards: true,
}).extend({
  email: z.string().email().optional().or(z.string().length(0)),
  password: z.string().min(1).optional().or(z.string().length(0)),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
