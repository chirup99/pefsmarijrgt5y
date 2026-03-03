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
  cards: text("cards").array(), // Array of JSON strings or just text descriptions
  createdAt: timestamp("created_at").defaultNow(),
});

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
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
