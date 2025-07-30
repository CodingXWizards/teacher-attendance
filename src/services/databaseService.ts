import { db } from "../db/drizzle";
import {
  users,
  classes,
  students,
  teacherClass,
  teacherAttendance,
  studentAttendance,
  subjects,
  type User,
  type Class,
  type Student,
  type TeacherClass,
  type TeacherAttendance,
  type StudentAttendance,
  type Subject,
} from "../db/schema";
import { eq, and, inArray, desc, asc, like, or } from "drizzle-orm";

class DatabaseService {
  // User/Teacher methods
  async getCurrentUser(userId: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return result[0] || null;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date().toISOString(),
        isDirty: true,
      })
      .where(eq(users.id, userId));
  }

  // Class methods
  async getTeacherClasses(teacherId: string): Promise<Class[]> {
    const teacherClassRecords = await db
      .select()
      .from(teacherClass)
      .where(
        and(
          eq(teacherClass.teacherId, teacherId),
          eq(teacherClass.isActive, true),
        ),
      );

    if (teacherClassRecords.length === 0) return [];

    const classIds = teacherClassRecords.map((tc: TeacherClass) => tc.classId);

    return await db
      .select()
      .from(classes)
      .where(and(inArray(classes.id, classIds), eq(classes.isActive, true)))
      .orderBy(asc(classes.name));
  }

  async getClassById(classId: string): Promise<Class | null> {
    const result = await db
      .select()
      .from(classes)
      .where(eq(classes.id, classId))
      .limit(1);

    return result[0] || null;
  }

  async searchClasses(query: string, teacherId?: string): Promise<Class[]> {
    let baseQuery = db
      .select()
      .from(classes)
      .where(
        and(
          eq(classes.isActive, true),
          or(
            like(classes.name, `%${query}%`),
            like(classes.grade, `%${query}%`),
            like(classes.section, `%${query}%`),
          ),
        ),
      );

    if (teacherId) {
      const teacherClassRecords = await db
        .select()
        .from(teacherClass)
        .where(
          and(
            eq(teacherClass.teacherId, teacherId),
            eq(teacherClass.isActive, true),
          ),
        );

      if (teacherClassRecords.length > 0) {
        const classIds = teacherClassRecords.map(
          (tc: TeacherClass) => tc.classId,
        );
        baseQuery = baseQuery.where(inArray(classes.id, classIds));
      } else {
        return []; // Teacher has no classes
      }
    }

    return await baseQuery.orderBy(asc(classes.name));
  }

  // Student methods
  async getClassStudents(classId: string): Promise<Student[]> {
    return await db
      .select()
      .from(students)
      .where(and(eq(students.classId, classId), eq(students.isActive, true)))
      .orderBy(asc(students.firstName), asc(students.lastName));
  }

  async getStudentById(studentId: string): Promise<Student | null> {
    const result = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);

    return result[0] || null;
  }

  async searchStudents(query: string, classId?: string): Promise<Student[]> {
    let baseQuery = db
      .select()
      .from(students)
      .where(
        and(
          eq(students.isActive, true),
          or(
            like(students.firstName, `%${query}%`),
            like(students.lastName, `%${query}%`),
            like(students.studentId, `%${query}%`),
            like(students.email, `%${query}%`),
          ),
        ),
      );

    if (classId) {
      baseQuery = baseQuery.where(eq(students.classId, classId));
    }

    return await baseQuery.orderBy(
      asc(students.firstName),
      asc(students.lastName),
    );
  }

  // Attendance methods
  async getClassAttendance(
    classId: string,
    date: string,
  ): Promise<StudentAttendance[]> {
    return await db
      .select()
      .from(studentAttendance)
      .where(
        and(
          eq(studentAttendance.classId, classId),
          eq(studentAttendance.date, date),
        ),
      )
      .orderBy(asc(studentAttendance.createdAt));
  }

  async getStudentAttendance(
    studentId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<StudentAttendance[]> {
    let query = db
      .select()
      .from(studentAttendance)
      .where(eq(studentAttendance.studentId, studentId));

    if (startDate && endDate) {
      query = query.where(
        and(
          eq(studentAttendance.date, startDate),
          eq(studentAttendance.date, endDate),
        ),
      );
    }

    return await query.orderBy(desc(studentAttendance.date));
  }

  async markStudentAttendance(data: {
    studentId: string;
    classId: string;
    date: string;
    status: "present" | "absent";
    notes?: string;
    markedBy: string;
  }): Promise<string> {
    const localId = `local_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    await db.insert(studentAttendance).values({
      id: localId,
      studentId: data.studentId,
      classId: data.classId,
      date: data.date,
      status: data.status,
      notes: data.notes,
      markedBy: data.markedBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastSyncedAt: null,
      isDirty: true,
    });

    return localId;
  }

  async updateStudentAttendance(
    attendanceId: string,
    updates: {
      status?: "present" | "absent";
      notes?: string;
    },
  ): Promise<void> {
    await db
      .update(studentAttendance)
      .set({
        ...updates,
        updatedAt: new Date().toISOString(),
        isDirty: true,
      })
      .where(eq(studentAttendance.id, attendanceId));
  }

  async getTeacherAttendance(
    teacherId: string,
    date?: string,
  ): Promise<TeacherAttendance[]> {
    let query = db
      .select()
      .from(teacherAttendance)
      .where(eq(teacherAttendance.teacherId, teacherId));

    if (date) {
      query = query.where(eq(teacherAttendance.date, date));
    }

    return await query.orderBy(desc(teacherAttendance.date));
  }

  async markTeacherAttendance(data: {
    teacherId: string;
    date: string;
    checkIn?: string;
    checkOut?: string;
    status: "present" | "absent";
    notes?: string;
  }): Promise<string> {
    const localId = `local_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    await db.insert(teacherAttendance).values({
      id: localId,
      teacherId: data.teacherId,
      date: data.date,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      status: data.status,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastSyncedAt: null,
      isDirty: true,
    });

    return localId;
  }

  async updateTeacherAttendance(
    attendanceId: string,
    updates: {
      checkIn?: string;
      checkOut?: string;
      status?: "present" | "absent";
      notes?: string;
    },
  ): Promise<void> {
    await db
      .update(teacherAttendance)
      .set({
        ...updates,
        updatedAt: new Date().toISOString(),
        isDirty: true,
      })
      .where(eq(teacherAttendance.id, attendanceId));
  }

  // Subject methods
  async getAllSubjects(): Promise<Subject[]> {
    return await db
      .select()
      .from(subjects)
      .where(eq(subjects.isActive, true))
      .orderBy(asc(subjects.name));
  }

  async getSubjectById(subjectId: string): Promise<Subject | null> {
    const result = await db
      .select()
      .from(subjects)
      .where(eq(subjects.id, subjectId))
      .limit(1);

    return result[0] || null;
  }

  // Statistics methods
  async getClassStats(classId: string): Promise<{
    totalStudents: number;
    presentToday: number;
    absentToday: number;
  }> {
    const today = new Date().toISOString().split("T")[0];

    const [totalStudents, todayAttendance] = await Promise.all([
      db
        .select({ count: db.fn.count() })
        .from(students)
        .where(and(eq(students.classId, classId), eq(students.isActive, true))),
      db
        .select()
        .from(studentAttendance)
        .where(
          and(
            eq(studentAttendance.classId, classId),
            eq(studentAttendance.date, today),
          ),
        ),
    ]);

    const presentToday = todayAttendance.filter(
      (a: StudentAttendance) => a.status === "present",
    ).length;
    const absentToday = todayAttendance.filter(
      (a: StudentAttendance) => a.status === "absent",
    ).length;

    return {
      totalStudents: totalStudents[0]?.count || 0,
      presentToday,
      absentToday,
    };
  }

  async getTeacherStats(teacherId: string): Promise<{
    totalClasses: number;
    totalStudents: number;
    attendanceThisMonth: number;
  }> {
    const teacherClasses = await this.getTeacherClasses(teacherId);
    const totalClasses = teacherClasses.length;

    let totalStudents = 0;
    for (const cls of teacherClasses) {
      const students = await this.getClassStudents(cls.id);
      totalStudents += students.length;
    }

    // Get attendance count for current month
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    const monthAttendance = await db
      .select({ count: db.fn.count() })
      .from(teacherAttendance)
      .where(
        and(
          eq(teacherAttendance.teacherId, teacherId),
          like(teacherAttendance.date, `${currentMonth}%`),
        ),
      );

    return {
      totalClasses,
      totalStudents,
      attendanceThisMonth: monthAttendance[0]?.count || 0,
    };
  }

  // Utility methods
  async getUnsyncedRecordsCount(): Promise<{
    teacherAttendance: number;
    studentAttendance: number;
  }> {
    const [teacherAttendanceRecords, studentAttendanceRecords] =
      await Promise.all([
        db
          .select({ count: db.fn.count() })
          .from(teacherAttendance)
          .where(eq(teacherAttendance.isDirty, true)),
        db
          .select({ count: db.fn.count() })
          .from(studentAttendance)
          .where(eq(studentAttendance.isDirty, true)),
      ]);

    return {
      teacherAttendance: teacherAttendanceRecords[0]?.count || 0,
      studentAttendance: studentAttendanceRecords[0]?.count || 0,
    };
  }
}

export const databaseService = new DatabaseService();
