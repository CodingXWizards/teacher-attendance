import { db } from "../db/drizzle";
import {
  users,
  classes,
  students,
  teacherClass,
  teacherAttendance,
  studentAttendance,
  subjects,
  syncStatus,
  type User,
  type Class,
  type Student,
  type TeacherClass,
  type TeacherAttendance,
  type StudentAttendance,
  type Subject,
} from "../db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { api } from "../lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SyncResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface TeacherData {
  user: User;
  classes: Class[];
  students: Student[];
  teacherClasses: TeacherClass[];
  subjects: Subject[];
}

class SyncService {
  private isSyncing = false;

  /**
   * Load teacher's data after login
   * This fetches all necessary data for the logged-in teacher
   */
  async loadTeacherData(teacherId: string): Promise<SyncResult> {
    try {
      console.log("Loading teacher data for:", teacherId);

      // Check if we have recent data (within last hour)
      const lastSync = await this.getLastSyncTime("users");
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      if (lastSync && new Date(lastSync) > oneHourAgo) {
        console.log("Using cached data, last sync:", lastSync);
        return { success: true, message: "Using cached data" };
      }

      // Fetch teacher's assigned classes
      const teacherClassesResponse = await api.get(
        `/teacher-class?teacherId=${teacherId}`,
      );
      const teacherClasses: TeacherClass[] =
        teacherClassesResponse.data.data || [];

      if (!teacherClasses.length) {
        return { success: true, message: "No classes assigned to teacher" };
      }

      const classIds = teacherClasses.map(tc => tc.classId);

      // Fetch all related data in parallel
      const [classesResponse, studentsResponse, subjectsResponse] =
        await Promise.all([
          api.get(`/classes?ids=${classIds.join(",")}`),
          api.get(`/students?classIds=${classIds.join(",")}`),
          api.get("/subjects"),
        ]);

      const classes: Class[] = classesResponse.data.data || [];
      const students: Student[] = studentsResponse.data.data || [];
      const subjects: Subject[] = subjectsResponse.data.data || [];

      // Store data in local database
      await this.storeTeacherData({
        user: teacherClassesResponse.data.teacher,
        classes,
        students,
        teacherClasses,
        subjects,
      });

      // Update sync status
      await this.updateSyncStatus("users", new Date().toISOString());

      console.log(
        `Loaded ${classes.length} classes, ${students.length} students, ${subjects.length} subjects`,
      );

      return {
        success: true,
        message: `Loaded ${classes.length} classes, ${students.length} students`,
        data: {
          classes: classes.length,
          students: students.length,
          subjects: subjects.length,
        },
      };
    } catch (error) {
      console.error("Error loading teacher data:", error);
      return {
        success: false,
        message: "Failed to load teacher data",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Store teacher data in local database
   */
  private async storeTeacherData(data: TeacherData): Promise<void> {
    const { user, classes, students, teacherClasses, subjects } = data;

    // Store user data
    await db
      .insert(users)
      .values(user)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          employeeId: user.employeeId,
          department: user.department,
          phone: user.phone,
          address: user.address,
          hireDate: user.hireDate,
          isActive: user.isActive,
          updatedAt: new Date().toISOString(),
          lastSyncedAt: new Date().toISOString(),
          isDirty: false,
        },
      });

    // Store classes
    if (classes.length > 0) {
      await db
        .insert(classes)
        .values(
          classes.map(c => ({
            ...c,
            lastSyncedAt: new Date().toISOString(),
            isDirty: false,
          })),
        )
        .onConflictDoUpdate({
          target: classes.id,
          set: {
            name: classes[0].name,
            grade: classes[0].grade,
            section: classes[0].section,
            academicYear: classes[0].academicYear,
            isActive: classes[0].isActive,
            updatedAt: new Date().toISOString(),
            lastSyncedAt: new Date().toISOString(),
            isDirty: false,
          },
        });
    }

    // Store students
    if (students.length > 0) {
      await db
        .insert(students)
        .values(
          students.map(s => ({
            ...s,
            lastSyncedAt: new Date().toISOString(),
            isDirty: false,
          })),
        )
        .onConflictDoUpdate({
          target: students.id,
          set: {
            studentId: students[0].studentId,
            firstName: students[0].firstName,
            lastName: students[0].lastName,
            email: students[0].email,
            phone: students[0].phone,
            address: students[0].address,
            dateOfBirth: students[0].dateOfBirth,
            gender: students[0].gender,
            classId: students[0].classId,
            isActive: students[0].isActive,
            updatedAt: new Date().toISOString(),
            lastSyncedAt: new Date().toISOString(),
            isDirty: false,
          },
        });
    }

    // Store teacher-class assignments
    if (teacherClasses.length > 0) {
      await db
        .insert(teacherClass)
        .values(
          teacherClasses.map(tc => ({
            ...tc,
            lastSyncedAt: new Date().toISOString(),
            isDirty: false,
          })),
        )
        .onConflictDoUpdate({
          target: teacherClass.id,
          set: {
            teacherId: teacherClasses[0].teacherId,
            classId: teacherClasses[0].classId,
            isPrimaryTeacher: teacherClasses[0].isPrimaryTeacher,
            isActive: teacherClasses[0].isActive,
            updatedAt: new Date().toISOString(),
            lastSyncedAt: new Date().toISOString(),
            isDirty: false,
          },
        });
    }

    // Store subjects
    if (subjects.length > 0) {
      await db
        .insert(subjects)
        .values(
          subjects.map(s => ({
            ...s,
            lastSyncedAt: new Date().toISOString(),
            isDirty: false,
          })),
        )
        .onConflictDoUpdate({
          target: subjects.id,
          set: {
            name: subjects[0].name,
            code: subjects[0].code,
            description: subjects[0].description,
            isActive: subjects[0].isActive,
            updatedAt: new Date().toISOString(),
            lastSyncedAt: new Date().toISOString(),
            isDirty: false,
          },
        });
    }
  }

  /**
   * Sync dirty records to backend
   */
  async syncDirtyRecords(): Promise<SyncResult> {
    if (this.isSyncing) {
      return { success: false, message: "Sync already in progress" };
    }

    this.isSyncing = true;

    try {
      console.log("Starting sync of dirty records...");

      // Get all dirty records
      const [dirtyTeacherAttendance, dirtyStudentAttendance] =
        await Promise.all([
          db
            .select()
            .from(teacherAttendance)
            .where(eq(teacherAttendance.isDirty, true)),
          db
            .select()
            .from(studentAttendance)
            .where(eq(studentAttendance.isDirty, true)),
        ]);

      let syncedCount = 0;
      let errorCount = 0;

      // Sync teacher attendance
      for (const record of dirtyTeacherAttendance) {
        try {
          if (!record.id.startsWith("local_")) {
            // Update existing record
            await api.put(`/teacher-attendance/${record.id}`, {
              checkIn: record.checkIn,
              checkOut: record.checkOut,
              status: record.status,
              notes: record.notes,
            });
          } else {
            // Create new record
            const response = await api.post("/teacher-attendance", {
              teacherId: record.teacherId,
              date: record.date,
              checkIn: record.checkIn,
              checkOut: record.checkOut,
              status: record.status,
              notes: record.notes,
            });

            // Update local record with server ID
            await db
              .update(teacherAttendance)
              .set({
                id: response.data.id,
                lastSyncedAt: new Date().toISOString(),
                isDirty: false,
              })
              .where(eq(teacherAttendance.id, record.id));
          }
          syncedCount++;
        } catch (error) {
          console.error("Error syncing teacher attendance:", error);
          errorCount++;
        }
      }

      // Sync student attendance
      for (const record of dirtyStudentAttendance) {
        try {
          if (!record.id.startsWith("local_")) {
            // Update existing record
            await api.put(`/student-attendance/${record.id}`, {
              status: record.status,
              notes: record.notes,
            });
          } else {
            // Create new record
            const response = await api.post("/student-attendance", {
              studentId: record.studentId,
              classId: record.classId,
              date: record.date,
              status: record.status,
              notes: record.notes,
              markedBy: record.markedBy,
            });

            // Update local record with server ID
            await db
              .update(studentAttendance)
              .set({
                id: response.data.id,
                lastSyncedAt: new Date().toISOString(),
                isDirty: false,
              })
              .where(eq(studentAttendance.id, record.id));
          }
          syncedCount++;
        } catch (error) {
          console.error("Error syncing student attendance:", error);
          errorCount++;
        }
      }

      this.isSyncing = false;

      return {
        success: true,
        message: `Synced ${syncedCount} records${
          errorCount > 0 ? `, ${errorCount} errors` : ""
        }`,
        data: { syncedCount, errorCount },
      };
    } catch (error) {
      this.isSyncing = false;
      console.error("Error during sync:", error);
      return {
        success: false,
        message: "Failed to sync records",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get teacher's classes from local database
   */
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

    const classIds = teacherClassRecords.map(tc => tc.classId);

    return await db
      .select()
      .from(classes)
      .where(and(inArray(classes.id, classIds), eq(classes.isActive, true)));
  }

  /**
   * Get students for a specific class
   */
  async getClassStudents(classId: string): Promise<Student[]> {
    return await db
      .select()
      .from(students)
      .where(and(eq(students.classId, classId), eq(students.isActive, true)));
  }

  /**
   * Get attendance records for a class on a specific date
   */
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
      );
  }

  /**
   * Mark student attendance (creates local record)
   */
  async markStudentAttendance(data: {
    studentId: string;
    classId: string;
    date: string;
    status: "present" | "absent";
    notes?: string;
    markedBy: string;
  }): Promise<SyncResult> {
    try {
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

      return { success: true, message: "Attendance marked successfully" };
    } catch (error) {
      console.error("Error marking attendance:", error);
      return {
        success: false,
        message: "Failed to mark attendance",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get sync status for a table
   */
  private async getLastSyncTime(tableName: string): Promise<string | null> {
    const result = await db
      .select()
      .from(syncStatus)
      .where(eq(syncStatus.tableName, tableName))
      .limit(1);

    return result[0]?.lastSyncedAt || null;
  }

  /**
   * Update sync status for a table
   */
  private async updateSyncStatus(
    tableName: string,
    lastSyncedAt: string,
  ): Promise<void> {
    await db
      .insert(syncStatus)
      .values({
        tableName,
        lastSyncedAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: syncStatus.tableName,
        set: {
          lastSyncedAt,
          updatedAt: new Date().toISOString(),
        },
      });
  }

  /**
   * Clear all local data (useful for logout)
   */
  async clearLocalData(): Promise<void> {
    await db.delete(users);
    await db.delete(classes);
    await db.delete(students);
    await db.delete(teacherClass);
    await db.delete(teacherAttendance);
    await db.delete(studentAttendance);
    await db.delete(subjects);
    await db.delete(syncStatus);

    // Clear AsyncStorage
    await AsyncStorage.multiRemove(["user", "token", "refreshToken"]);
  }

  /**
   * Check if there are any unsynced records
   */
  async hasUnsyncedRecords(): Promise<boolean> {
    const [dirtyTeacherAttendance, dirtyStudentAttendance] = await Promise.all([
      db
        .select()
        .from(teacherAttendance)
        .where(eq(teacherAttendance.isDirty, true))
        .limit(1),
      db
        .select()
        .from(studentAttendance)
        .where(eq(studentAttendance.isDirty, true))
        .limit(1),
    ]);

    return (
      dirtyTeacherAttendance.length > 0 || dirtyStudentAttendance.length > 0
    );
  }
}

export const syncService = new SyncService();
