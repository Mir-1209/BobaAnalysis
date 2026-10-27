import { pgTable, text, timestamp, integer, jsonb, date, boolean, primaryKey, index } from "drizzle-orm/pg-core";
import type { Settings } from "../../shared/rules.js";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  xp: integer("xp").notNull().default(0),
  settings: jsonb("settings").$type<Partial<Settings>>().notNull().default({}),
  /** Secret part of the private calendar feed URL. Regenerating it revokes old links. */
  calendarKey: text("calendar_key").notNull().unique(),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Session id is the SHA-256 of the cookie token, so a DB leak can't be replayed. */
export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  userAgent: text("user_agent"),
  ip: text("ip"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("sessions_user_idx").on(t.userId)]);

export const rateLimitsTable = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
  count: integer("count").notNull().default(0),
});

export const lessonProgressTable = pgTable("lesson_progress", {
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull(),
}, (t) => [primaryKey({ columns: [t.userId, t.lessonId] })]);

/** One row per (student, question): powers mastery bars and spaced-repetition review. */
export const questionStatsTable = pgTable("question_stats", {
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  questionId: text("question_id").notNull(),
  attempts: integer("attempts").notNull().default(0),
  correct: integer("correct").notNull().default(0),
  box: integer("box").notNull().default(0),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  lastAt: timestamp("last_at", { withTimezone: true }).notNull(),
}, (t) => [primaryKey({ columns: [t.userId, t.questionId] })]);

/** The daily tracker: one row per student per day. */
export const dayLogsTable = pgTable("day_logs", {
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  day: date("day", { mode: "string" }).notNull(),
  minutes: integer("minutes").notNull().default(0),
  xp: integer("xp").notNull().default(0),
  answered: integer("answered").notNull().default(0),
  correct: integer("correct").notNull().default(0),
  lessons: integer("lessons").notNull().default(0),
  mood: integer("mood"),
  energy: integer("energy"),
  note: text("note").notNull().default(""),
  done: jsonb("done").$type<string[]>().notNull().default([]),
}, (t) => [primaryKey({ columns: [t.userId, t.day] })]);

export const assignmentsTable = pgTable("assignments", {
  id: text("id").notNull(),
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  course: text("course").notNull(),
  title: text("title").notNull(),
  due: text("due"),
  done: boolean("done").notNull().default(false),
  kind: text("kind").notNull().default("homework"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [primaryKey({ columns: [t.userId, t.id] })]);

export type User = typeof usersTable.$inferSelect;
