import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "./schema";
import { eq, and, desc, sql } from "drizzle-orm";

// Export all schema tables
export const { User, Teacher, Attendance, Subject } = schema;

// Helper function to create database helpers with a database instance
export const createDbHelpers = (db: any) => ({
  // Teacher operations
  async getAllTeachers() {
    return await db.select().from(schema.Teacher).all();
  },

  async addTeacher(teacher: {
    name: string;
    subject: string;
    email?: string;
    phone?: string;
  }) {
    return await db.insert(schema.Teacher).values(teacher).returning();
  },

  async updateTeacher(
    id: number,
    teacher: Partial<typeof schema.Teacher.$inferInsert>
  ) {
    return await db
      .update(schema.Teacher)
      .set(teacher)
      .where(eq(schema.Teacher.id, id))
      .returning();
  },

  async deleteTeacher(id: number) {
    return await db.delete(schema.Teacher).where(eq(schema.Teacher.id, id));
  },

  // Attendance operations
  async getAttendanceByDate(date: string) {
    return await db
      .select({
        id: schema.Attendance.id,
        teacherId: schema.Attendance.teacherId,
        teacherName: schema.Teacher.name,
        teacherSubject: schema.Teacher.subject,
        date: schema.Attendance.date,
        isPresent: schema.Attendance.isPresent,
      })
      .from(schema.Attendance)
      .innerJoin(
        schema.Teacher,
        eq(schema.Attendance.teacherId, schema.Teacher.id)
      )
      .where(eq(schema.Attendance.date, date))
      .all();
  },

  async saveAttendance(attendance: {
    teacherId: number;
    date: string;
    isPresent: number;
  }) {
    // Check if attendance already exists for this teacher and date
    const existing = await db
      .select()
      .from(schema.Attendance)
      .where(
        and(
          eq(schema.Attendance.teacherId, attendance.teacherId),
          eq(schema.Attendance.date, attendance.date)
        )
      )
      .get();

    if (existing) {
      // Update existing attendance
      return await db
        .update(schema.Attendance)
        .set({ isPresent: attendance.isPresent })
        .where(eq(schema.Attendance.id, existing.id))
        .returning();
    } else {
      // Insert new attendance
      return await db.insert(schema.Attendance).values(attendance).returning();
    }
  },

  async getAttendanceHistory(limit = 30) {
    return await db
      .select({
        date: schema.Attendance.date,
        present:
          sql`SUM(CASE WHEN ${schema.Attendance.isPresent} = 1 THEN 1 ELSE 0 END)`.as(
            "present"
          ),
        absent:
          sql`SUM(CASE WHEN ${schema.Attendance.isPresent} = 0 THEN 1 ELSE 0 END)`.as(
            "absent"
          ),
        total: sql`COUNT(*)`.as("total"),
      })
      .from(schema.Attendance)
      .groupBy(schema.Attendance.date)
      .orderBy(desc(schema.Attendance.date))
      .limit(limit)
      .all();
  },
});
