// src/db/schema.ts
import { int, sqliteTable, text, real } from "drizzle-orm/sqlite-core";

export const User = sqliteTable("user", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
});

export const Teacher = sqliteTable("teacher", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  subject: text().notNull(),
  email: text(),
  phone: text(),
  createdAt: text().notNull().default(new Date().toISOString()),
});

export const Attendance = sqliteTable("attendance", {
  id: int().primaryKey({ autoIncrement: true }),
  teacherId: int()
    .notNull()
    .references(() => Teacher.id),
  date: text().notNull(),
  isPresent: int().notNull(), // 1 for present, 0 for absent
  createdAt: text().notNull().default(new Date().toISOString()),
});

export const Subject = sqliteTable("subject", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  description: text(),
});
