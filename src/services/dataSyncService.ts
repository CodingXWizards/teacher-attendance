import { attendanceApi, studentsApi, subjectsApi, usersApi } from "../lib/api";
import { Student, StudentAttendance } from "../types";
import { DatabaseService } from "./databaseService";

class DataSyncService {
  /**
   * Check if there's existing data for a different user
   */
  static async hasExistingDataForDifferentUser(currentUserId: string): Promise<{
    hasData: boolean;
    existingUserId?: string;
    existingUserName?: string;
  }> {
    try {
      // Check if there's any teacher data at all
      const teachers = await DatabaseService.getTeacherByUserId(currentUserId);

      if (teachers.length === 0) {
        // Check if there's any teacher data for other users
        const allTeachers = await DatabaseService.getAllTeachers();

        if (allTeachers.length > 0) {
          const otherTeacher = allTeachers[0];
          return {
            hasData: true,
            existingUserId: otherTeacher.id,
            existingUserName: `${otherTeacher.firstName} ${otherTeacher.lastName}`,
          };
        }
      }

      return { hasData: false };
    } catch (error) {
      console.error("Error checking existing data:", error);
      return { hasData: false };
    }
  }

  /**
   * Check if there's any existing data in the database
   */
  static async hasAnyExistingData(): Promise<boolean> {
    try {
      const [teachers, classes, students] = await Promise.all([
        DatabaseService.getAllTeachers(),
        DatabaseService.getAllClasses(),
        DatabaseService.getAllStudents(),
      ]);

      return teachers.length > 0 || classes.length > 0 || students.length > 0;
    } catch (error) {
      console.error("Error checking for existing data:", error);
      return false;
    }
  }

  /**
   * Clear all existing data
   */
  static async clearExistingData(): Promise<void> {
    try {
      await DatabaseService.clearAllData();
    } catch (error) {
      console.error("Error clearing existing data:", error);
      throw new Error("Failed to clear existing data");
    }
  }

  /**
   * Load teacher data from server
   */
  static async loadTeacherData(): Promise<void> {
    try {
      const classes = await usersApi.teacherClasses();

      const studentsData: Student[] = [];

      for (const cls of classes) {
        const students = await studentsApi.byClass(cls.id);
        studentsData.push(...students);
      }

      const teacherAssignments = await usersApi.getTeacherAssignments();

      await DatabaseService.syncTeacherAssignments(teacherAssignments);

      await DatabaseService.createClasses(classes);
      await DatabaseService.createStudents(studentsData);
      await DatabaseService.updateSyncStatus("classes", Date.now());
      await DatabaseService.updateSyncStatus("students", Date.now());
    } catch (error) {
      console.error("Error loading teacher data:", error);
      throw new Error("Failed to load teacher data");
    }
  }

  static async loadAttendanceData(teacherId: string): Promise<void> {
    try {
      const teacherAttendance = await attendanceApi.teacher.byTeacher(
        teacherId,
      );
      await DatabaseService.syncTeacherAttendance(teacherAttendance);
      const classes = await DatabaseService.getAllClasses();
      const studentAttendanceData: StudentAttendance[] = [];

      for (const cls of classes) {
        const studentAttendance = await attendanceApi.student.byClass(
          cls.classId,
        );
        studentAttendanceData.push(...studentAttendance);
      }
      await DatabaseService.syncStudentAttendance(studentAttendanceData);
      await DatabaseService.updateSyncStatus("teacher_attendance", Date.now());
      await DatabaseService.updateSyncStatus("student_attendance", Date.now());
    } catch (error) {
      console.error("Error loading attendance data:", error);
      throw new Error("Failed to load attendance data");
    }
  }

  static async loadSubjectMarksData(teacherId: string): Promise<void> {
    try {
      const subjects = await usersApi.teacherSubjects(teacherId);

      await DatabaseService.syncSubjects(subjects);
      for (const subject of subjects) {
        try {
          const subjectMarks = await subjectsApi.getMarks(subject.id);

          await DatabaseService.syncSubjectMarks(subjectMarks);
          await DatabaseService.updateSyncStatus("marks", Date.now());
        } catch (error) {
          console.error("Error loading subject marks data:", error);
        }
      }
    } catch (error) {
      console.error("Error loading subject marks data:", error);
      throw new Error("Failed to load subject marks data");
    }
  }

  /**
   * Get sync progress for UI feedback
   */
  static async getSyncProgress(): Promise<{
    isLoading: boolean;
    progress: number;
    message: string;
  }> {
    try {
      // For now, return a simple progress indicator
      return {
        isLoading: false,
        progress: 100,
        message: "Data sync completed",
      };
    } catch (error) {
      console.error("Error getting sync progress:", error);
      return {
        isLoading: false,
        progress: 0,
        message: "Error getting sync status",
      };
    }
  }
}

export default DataSyncService;
