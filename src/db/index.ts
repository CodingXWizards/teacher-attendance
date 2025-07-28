import { open } from "react-native-quick-sqlite";
import * as schema from "./schema";

// Database name
export const DATABASE_NAME = "teacher-attendance-v2";

// Initialize database
let database: any = null;

export const initDatabase = async (): Promise<any> => {
  if (database) {
    return database;
  }

  try {
    database = open({
      name: DATABASE_NAME,
      location: "default",
    });
    
    console.log("Database initialized successfully");
    return database;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

// Export all schema tables
export const { User, Teacher, Attendance, Subject } = schema;

// Helper function to create database helpers with a database instance
export const createDbHelpers = (db: any) => ({
  // Teacher operations
  async getAllTeachers() {
    const results = db.execute("SELECT * FROM Teacher");
    return results.rows;
  },

  async addTeacher(teacher: {
    name: string;
    subject: string;
    email?: string;
    phone?: string;
  }) {
    const result = db.execute(
      "INSERT INTO Teacher (name, subject, email, phone) VALUES (?, ?, ?, ?)",
      [
        teacher.name,
        teacher.subject,
        teacher.email || null,
        teacher.phone || null,
      ]
    );
    return result;
  },

  async updateTeacher(
    id: number,
    teacher: Partial<typeof schema.Teacher.$inferInsert>
  ) {
    const fields = Object.keys(teacher).filter(
      (key) => teacher[key as keyof typeof teacher] !== undefined
    );
    const values = fields.map(
      (field) => teacher[field as keyof typeof teacher]
    );
    const setClause = fields.map((field) => `${field} = ?`).join(", ");

    const result = db.execute(
      `UPDATE Teacher SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
    return result;
  },

  async deleteTeacher(id: number) {
    const result = db.execute("DELETE FROM Teacher WHERE id = ?", [id]);
    return result;
  },

  // Attendance operations
  async getAttendanceByDate(date: string) {
    const results = db.execute(
      `
        SELECT 
          a.id,
          a.teacherId,
          t.name as teacherName,
          t.subject as teacherSubject,
          a.date,
          a.isPresent
        FROM Attendance a
        INNER JOIN Teacher t ON a.teacherId = t.id
        WHERE a.date = ?
      `,
      [date]
    );
    return results.rows;
  },

  async saveAttendance(attendance: {
    teacherId: number;
    date: string;
    isPresent: number;
  }) {
    // Check if attendance already exists for this teacher and date
    const existing = db.execute(
      "SELECT id FROM Attendance WHERE teacherId = ? AND date = ?",
      [attendance.teacherId, attendance.date]
    );

    if (existing.rows.length > 0) {
      // Update existing attendance
      const result = db.execute(
        "UPDATE Attendance SET isPresent = ? WHERE id = ?",
        [attendance.isPresent, existing.rows[0].id]
      );
      return result;
    } else {
      // Insert new attendance
      const result = db.execute(
        "INSERT INTO Attendance (teacherId, date, isPresent) VALUES (?, ?, ?)",
        [attendance.teacherId, attendance.date, attendance.isPresent]
      );
      return result;
    }
  },

  async getAttendanceHistory(limit = 30) {
    const results = db.execute(
      `
        SELECT 
          date,
          SUM(CASE WHEN isPresent = 1 THEN 1 ELSE 0 END) as present,
          SUM(CASE WHEN isPresent = 0 THEN 1 ELSE 0 END) as absent,
          COUNT(*) as total
        FROM Attendance
        GROUP BY date
        ORDER BY date DESC
        LIMIT ?
      `,
      [limit]
    );
    return results.rows;
  },
});
