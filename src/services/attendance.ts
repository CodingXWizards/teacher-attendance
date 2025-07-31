import type {
  AttendanceStatus,
  TeacherAttendance,
  StudentAttendance,
  CreateTeacherAttendanceRequest,
  UpdateTeacherAttendanceRequest,
  CreateStudentAttendanceRequest,
} from "@/types";

import { syncService } from "./syncService";
import { DatabaseService } from "./databaseService";

export interface AttendanceListParams {
  page?: number;
  limit?: number;
  date?: string;
  teacherId?: string;
  classId?: string;
  studentId?: string;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  presentPercentage: number;
  absentPercentage: number;
}

class AttendanceService {
  /**
   * Get teacher attendance records from local database
   */
  static async getTeacherAttendance(
    teacherId: string,
    params?: AttendanceListParams,
  ): Promise<TeacherAttendance[]> {
    try {
      const date = params?.date;
      const records = await DatabaseService.getTeacherAttendance(
        teacherId,
        date || "",
      );

      // Convert database types to API types
      return records.map(record => ({
        id: record.id,
        teacherId: record.teacherId,
        date: record.date,
        checkIn: record.checkIn || "",
        checkOut: record.checkOut || "",
        status: record.status as AttendanceStatus,
        createdAt: record.createdAt.toString(),
        updatedAt: record.updatedAt.toString(),
        teacher: undefined, // Will be populated if needed
      }));
    } catch (error) {
      console.error("Error getting teacher attendance:", error);
      throw new Error("Failed to get teacher attendance");
    }
  }

  /**
   * Get teacher attendance record by ID from local database
   */
  static async getTeacherAttendanceRecord(
    id: string,
  ): Promise<TeacherAttendance | null> {
    try {
      // This would need to be implemented in databaseService
      // For now, we'll get all records and filter
      const allRecords = await DatabaseService.getTeacherAttendance("", "");
      const record = allRecords.find(record => record.id === id);

      if (!record) return null;

      // Convert database type to API type
      return {
        id: record.id,
        teacherId: record.teacherId,
        date: record.date,
        checkIn: record.checkIn || undefined,
        checkOut: record.checkOut || undefined,
        status: record.status as AttendanceStatus,
        createdAt: record.createdAt.toString(),
        updatedAt: record.updatedAt.toString(),
        teacher: undefined, // Will be populated if needed
      };
    } catch (error) {
      console.error("Error getting teacher attendance record:", error);
      throw new Error("Failed to get teacher attendance record");
    }
  }

  /**
   * Create teacher attendance record in local database
   */
  static async createTeacherAttendance(
    attendanceData: CreateTeacherAttendanceRequest,
  ): Promise<string> {
    try {
      const attendance = await DatabaseService.markTeacherAttendance({
        teacherId: attendanceData.teacherId,
        date: attendanceData.date,
        checkIn: attendanceData.checkIn,
        checkOut: attendanceData.checkOut,
        status: attendanceData.status,
      });
      return attendance.id;
    } catch (error) {
      console.error("Error creating teacher attendance:", error);
      throw new Error("Failed to create teacher attendance");
    }
  }

  /**
   * Update teacher attendance record in local database
   */
  static async updateTeacherAttendance(
    id: string,
    attendanceData: UpdateTeacherAttendanceRequest,
  ): Promise<void> {
    try {
      await DatabaseService.updateTeacherAttendance(id, {
        checkIn: attendanceData.checkIn,
        checkOut: attendanceData.checkOut,
        status: attendanceData.status,
      });
    } catch (error) {
      console.error("Error updating teacher attendance:", error);
      throw new Error("Failed to update teacher attendance");
    }
  }

  /**
   * Delete teacher attendance record from local database
   */
  static async deleteTeacherAttendance(id: string): Promise<void> {
    try {
      // This would need to be implemented in DatabaseService
      // For now, we'll mark it as inactive or handle it differently
      console.warn("Delete functionality not implemented in local database");
    } catch (error) {
      console.error("Error deleting teacher attendance:", error);
      throw new Error("Failed to delete teacher attendance");
    }
  }

  /**
   * Get attendance by date from local database
   */
  static async getAttendanceByDate(
    date: string,
    teacherId?: string,
  ): Promise<TeacherAttendance[]> {
    try {
      if (teacherId) {
        const records = await DatabaseService.getTeacherAttendance(
          teacherId,
          date,
        );

        // Convert database types to API types
        return records.map(record => ({
          id: record.id,
          teacherId: record.teacherId,
          date: record.date,
          checkIn: record.checkIn || undefined,
          checkOut: record.checkOut || undefined,
          status: record.status as AttendanceStatus,
          createdAt: record.createdAt.toString(),
          updatedAt: record.updatedAt.toString(),
          teacher: undefined, // Will be populated if needed
        }));
      }
      // If no teacherId, get all attendance for the date
      // This would need to be implemented in DatabaseService
      return [];
    } catch (error) {
      console.error("Error getting attendance by date:", error);
      throw new Error("Failed to get attendance by date");
    }
  }

  /**
   * Get attendance by teacher from local database
   */
  static async getAttendanceByTeacher(
    teacherId: string,
  ): Promise<TeacherAttendance[]> {
    try {
      const records = await DatabaseService.getTeacherAttendance(teacherId, "");

      // Convert database types to API types
      return records.map(record => ({
        id: record.id,
        teacherId: record.teacherId,
        date: record.date,
        checkIn: record.checkIn || undefined,
        checkOut: record.checkOut || undefined,
        status: record.status as AttendanceStatus,
        createdAt: record.createdAt.toString(),
        updatedAt: record.updatedAt.toString(),
        teacher: undefined, // Will be populated if needed
      }));
    } catch (error) {
      console.error("Error getting attendance by teacher:", error);
      throw new Error("Failed to get attendance by teacher");
    }
  }

  /**
   * Get student attendance by class from local database
   */
  static async getStudentAttendanceByClass(
    classId: string,
  ): Promise<StudentAttendance[]> {
    try {
      // This would need to be implemented in DatabaseService
      // For now, return empty array
      return [];
    } catch (error) {
      console.error("Error getting student attendance by class:", error);
      throw new Error("Failed to get student attendance by class");
    }
  }

  /**
   * Get student attendance by class and date from local database
   */
  static async getStudentAttendanceByClassAndDate(
    id: string,
    date: string,
  ): Promise<StudentAttendance[]> {
    try {
      const records = await DatabaseService.getClassAttendance(id, date);

      // Convert database types to API types
      return records.map(record => ({
        id: record.id,
        studentId: record.studentId,
        classId: record.classId,
        date: record.date,
        status: record.status as AttendanceStatus,
        notes: record.notes || "",
        markedBy: record.markedBy || "",
        createdAt: record.createdAt.toString(),
        updatedAt: record.updatedAt.toString(),
        student: undefined, // Will be populated if needed
        markedByUser: undefined, // Will be populated if needed
      }));
    } catch (error) {
      console.error(
        "Error getting student attendance by class and date:",
        error,
      );
      throw new Error("Failed to get student attendance by class and date");
    }
  }

  /**
   * Create student attendance record in local database
   */
  static async createStudentAttendance(
    attendanceData: CreateStudentAttendanceRequest,
  ): Promise<string> {
    try {
      const attendance = await DatabaseService.markStudentAttendance({
        studentId: attendanceData.studentId,
        classId: attendanceData.classId,
        date: attendanceData.date,
        status: attendanceData.status,
        notes: attendanceData.notes || "",
        markedBy: attendanceData.markedBy || "",
      });
      return attendance.id;
    } catch (error) {
      console.error("Error creating student attendance:", error);
      throw new Error("Failed to create student attendance");
    }
  }

  /**
   * Bulk create or update student attendance records in local database
   * This will update existing records if they exist, or create new ones if they don't
   */
  static async bulkCreateOrUpdateStudentAttendance(
    attendanceData: CreateStudentAttendanceRequest[],
  ): Promise<void> {
    try {
      await DatabaseService.bulkCreateOrUpdateStudentAttendance(attendanceData);
    } catch (error) {
      console.error("Error bulk creating/updating student attendance:", error);
      throw new Error("Failed to bulk create/update student attendance");
    }
  }

  /**
   * Bulk create student attendance records in local database
   */
  static async bulkCreateStudentAttendance(
    attendanceData: CreateStudentAttendanceRequest[],
  ): Promise<string[]> {
    try {
      const localIds: string[] = [];
      for (const data of attendanceData) {
        const attendance = await DatabaseService.markStudentAttendance({
          studentId: data.studentId,
          classId: data.classId,
          date: data.date,
          status: data.status,
          notes: data.notes,
          markedBy: data.markedBy,
        });
        localIds.push(attendance.id);
      }
      return localIds;
    } catch (error) {
      console.error("Error bulk creating student attendance:", error);
      throw new Error("Failed to bulk create student attendance");
    }
  }

  /**
   * Mark teacher as present in local database
   */
  static async markTeacherPresent(
    teacherId: string,
    date: string,
    checkInTime?: string,
  ): Promise<string> {
    try {
      const attendance = await DatabaseService.markTeacherAttendance({
        teacherId,
        date,
        checkIn: checkInTime,
        status: "present",
      });
      return attendance.id;
    } catch (error) {
      console.error("Error marking teacher present:", error);
      throw new Error("Failed to mark teacher present");
    }
  }

  /**
   * Mark teacher as absent in local database
   */
  static async markTeacherAbsent(
    teacherId: string,
    date: string,
    notes?: string,
  ): Promise<string> {
    try {
      const attendance = await DatabaseService.markTeacherAttendance({
        teacherId,
        date,
        status: "absent",
      });
      return attendance.id;
    } catch (error) {
      console.error("Error marking teacher absent:", error);
      throw new Error("Failed to mark teacher absent");
    }
  }

  /**
   * Check out teacher in local database
   */
  static async checkOutTeacher(
    attendanceId: string,
    checkOutTime: string,
  ): Promise<void> {
    try {
      await DatabaseService.updateTeacherAttendance(attendanceId, {
        checkOut: checkOutTime,
      });
    } catch (error) {
      console.error("Error checking out teacher:", error);
      throw new Error("Failed to check out teacher");
    }
  }

  /**
   * Get attendance summary from local database
   */
  static async getAttendanceSummary(
    startDate: string,
    endDate: string,
    classId?: string,
  ): Promise<AttendanceSummary> {
    try {
      // This would need to be implemented in DatabaseService
      // For now, return default values
      return {
        total: 0,
        present: 0,
        absent: 0,
        presentPercentage: 0,
        absentPercentage: 0,
      };
    } catch (error) {
      console.error("Error getting attendance summary:", error);
      throw new Error("Failed to get attendance summary");
    }
  }

  /**
   * Bulk mark teacher attendance in local database
   */
  static async bulkMarkTeacherAttendance(
    attendanceData: CreateTeacherAttendanceRequest[],
  ): Promise<string[]> {
    try {
      const localIds: string[] = [];
      for (const data of attendanceData) {
        const attendance = await DatabaseService.markTeacherAttendance({
          teacherId: data.teacherId,
          date: data.date,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          status: data.status,
        });
        localIds.push(attendance.id);
      }
      return localIds;
    } catch (error) {
      console.error("Error bulk marking teacher attendance:", error);
      throw new Error("Failed to bulk mark teacher attendance");
    }
  }

  /**
   * Sync all attendance data to backend
   */
  static async syncAttendanceData(): Promise<void> {
    try {
      await syncService.syncDirtyRecords();
    } catch (error) {
      console.error("Error syncing attendance data:", error);
      throw new Error("Failed to sync attendance data");
    }
  }

  /**
   * Get unsynced attendance count
   */
  static async getUnsyncedAttendanceCount(): Promise<{
    teacherAttendance: number;
    studentAttendance: number;
  }> {
    try {
      return await DatabaseService.getUnsyncedRecordsCount();
    } catch (error) {
      console.error("Error getting unsynced attendance count:", error);
      throw new Error("Failed to get unsynced attendance count");
    }
  }
}

export default AttendanceService;
