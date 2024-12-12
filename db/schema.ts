import { pgTable, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enum for subscription plan types
export const PlanType = {
  FREE: 'free',
  PREMIUM: 'premium',
  AI: 'ai'
} as const;

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: text("email").unique().notNull(),
  password_hash: text("password_hash").notNull(),
  name: text("name").notNull(),
  points: integer("points").default(0).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  is_verified: boolean("is_verified").default(false).notNull(),
  plan_type: text("plan_type").default(PlanType.FREE).notNull(),
  subscription_start: timestamp("subscription_start"),
  subscription_end: timestamp("subscription_end"),
  avatar_url: text("avatar_url"),
  subscription_plan: text("subscription_plan").default(PlanType.FREE).notNull(),
  billing_cycle: text("billing_cycle").default('monthly').notNull(),
});

// Diary entries table
export const diaryEntries = pgTable("diary_entries", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  concentration: text("concentration", { enum: ['good', 'normal', 'bad'] }).notNull(),
  achievements: text("achievements"),
  failures: text("failures"),
  challenges: text("challenges"),
  completed_sets: integer("completed_sets").notNull(),
  focus_time: integer("focus_time").notNull(),
  break_time: integer("break_time").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertDiaryEntrySchema = createInsertSchema(diaryEntries);
export const selectDiaryEntrySchema = createSelectSchema(diaryEntries);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;
export type InsertDiaryEntry = z.infer<typeof insertDiaryEntrySchema>;
export type DiaryEntry = z.infer<typeof selectDiaryEntrySchema>;
