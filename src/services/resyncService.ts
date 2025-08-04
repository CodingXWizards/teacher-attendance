import { DatabaseService } from "./databaseService";
import { api, resyncApi } from "@/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { syncLogsService } from "./syncLogsService";
import {
  TeacherAttendance,
  StudentAttendance,
  AttendanceStatus,
} from "@/types";

interface SyncResult {
  success: boolean;
  syncedRecords: number;
  errors: string[];
}

interface SyncFrequency {
  type: "daily" | "weekly" | "monthly";
  label: string;
  description: string;
}

export const SYNC_FREQUENCIES: SyncFrequency[] = [
  {
    type: "daily",
    label: "Daily",
    description: "Sync data every day at 9:00 AM",
  },
  {
    type: "weekly",
    label: "Weekly",
    description: "Sync data every Sunday at 9:00 AM",
  },
  {
    type: "monthly",
    label: "Monthly",
    description: "Sync data on the 1st of each month at 9:00 AM",
  },
];

class ResyncService {
  /**
   * Check if device has internet connectivity
   */
  private async checkInternetConnectivity(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected === true;
    } catch (error) {
      console.error("Error checking internet connectivity:", error);
      return false;
    }
  }

  /**
   * Get teacher attendance records that need to be synced based on last sync time
   */
  private async getTeacherAttendanceForSync(
    teacherId: string,
  ): Promise<TeacherAttendance[]> {
    try {
      // Get the last sync time for teacher attendance
      const syncStatus = await DatabaseService.getSyncStatus(
        "teacher_attendance",
      );
      const lastSyncTime = syncStatus?.lastSync || 0;

      // Get all teacher attendance records
      const allRecords = await DatabaseService.getTeacherAttendance(teacherId);

      // Filter records that were created or updated after the last sync
      const recordsToSync = allRecords.filter(record => {
        // Include if record was created or updated after last sync
        return (
          record.createdAt > lastSyncTime || record.updatedAt > lastSyncTime
        );
      });

      return recordsToSync.map(record => ({
        id: record.id,
        teacherId: record.teacherId,
        latitude: record.latitude,
        longitude: record.longitude,
        checkIn: record.checkIn,
        status: record.status as AttendanceStatus,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      }));
    } catch (error) {
      console.error("Error getting teacher attendance for sync:", error);
      throw error;
    }
  }

  /**
   * Get student attendance records that need to be synced based on last sync time
   */
  private async getStudentAttendanceForSync(): Promise<
    Omit<StudentAttendance, "id">[]
  > {
    try {
      // Get the last sync time for student attendance
      const syncStatus = await DatabaseService.getSyncStatus(
        "student_attendance",
      );
      const lastSyncTime = syncStatus?.lastSync || 0;

      // Get all classes first
      const classes = await DatabaseService.getAllClasses();
      const allStudentAttendance: Omit<StudentAttendance, "id">[] = [];

      for (const cls of classes) {
        // Get attendance for each class
        const records = await DatabaseService.getClassAttendance(cls.classId);
        allStudentAttendance.push(
          ...records.map(record => ({
            studentId: record.studentId,
            classId: record.classId,
            date: record.date,
            status: record.status as any,
            markedBy: record.markedBy || "",
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
          })),
        );
      }

      // Filter records that were created or updated after the last sync
      const recordsToSync = allStudentAttendance.filter(
        (record: Omit<StudentAttendance, "id">) => {
          return (
            record.createdAt > lastSyncTime || record.updatedAt > lastSyncTime
          );
        },
      );

      return recordsToSync.map(record => ({
        studentId: record.studentId,
        classId: record.classId,
        date: record.date,
        status: record.status as any,
        notes: record.notes || "",
        markedBy: record.markedBy || "",
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      }));
    } catch (error) {
      console.error("Error getting student attendance for sync:", error);
      throw error;
    }
  }

  /**
   * Sync teacher attendance data to backend
   */
  async syncTeacherAttendance(teacherId: string): Promise<SyncResult> {
    const startTime = Date.now();

    try {
      // Check internet connectivity first
      const isConnected = await this.checkInternetConnectivity();
      if (!isConnected) {
        const result = {
          success: false,
          syncedRecords: 0,
          errors: ["No internet connection available"],
        };

        // Log the failed sync
        await syncLogsService.addSyncLog({
          timestamp: Date.now(),
          type: "teacher",
          status: "failed",
          syncedRecords: 0,
          errors: result.errors,
          duration: Date.now() - startTime,
        });

        return result;
      }

      const teacherAttendance = await this.getTeacherAttendanceForSync(
        teacherId,
      );

      if (teacherAttendance.length === 0) {
        const result = { success: true, syncedRecords: 0, errors: [] };

        // Log the successful sync with no records
        await syncLogsService.addSyncLog({
          timestamp: Date.now(),
          type: "teacher",
          status: "success",
          syncedRecords: 0,
          errors: [],
          duration: Date.now() - startTime,
        });

        return result;
      }

      // Prepare data for bulk upload
      const bulkData = teacherAttendance.map(att => ({
        teacherId: att.teacherId,
        latitude: att.latitude,
        longitude: att.longitude,
        checkIn: att.checkIn,
        status: att.status,
      }));

      // Send to backend
      await resyncApi.teacher(bulkData);

      // Update sync status after successful sync
      await DatabaseService.updateSyncStatus("teacher_attendance", Date.now());

      const result = {
        success: true,
        syncedRecords: teacherAttendance.length,
        errors: [],
      };

      // Log the successful sync
      await syncLogsService.addSyncLog({
        timestamp: Date.now(),
        type: "teacher",
        status: "success",
        syncedRecords: teacherAttendance.length,
        errors: [],
        duration: Date.now() - startTime,
      });

      return result;
    } catch (error) {
      console.error("Error syncing teacher attendance:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      const result = {
        success: false,
        syncedRecords: 0,
        errors: [errorMessage],
      };

      // Log the failed sync
      await syncLogsService.addSyncLog({
        timestamp: Date.now(),
        type: "teacher",
        status: "failed",
        syncedRecords: 0,
        errors: [errorMessage],
        duration: Date.now() - startTime,
      });

      return result;
    }
  }

  /**
   * Sync student attendance data to backend
   */
  async syncStudentAttendance(): Promise<SyncResult> {
    const startTime = Date.now();

    try {
      // Check internet connectivity first
      const isConnected = await this.checkInternetConnectivity();
      if (!isConnected) {
        const result = {
          success: false,
          syncedRecords: 0,
          errors: ["No internet connection available"],
        };

        // Log the failed sync
        await syncLogsService.addSyncLog({
          timestamp: Date.now(),
          type: "student",
          status: "failed",
          syncedRecords: 0,
          errors: result.errors,
          duration: Date.now() - startTime,
        });

        return result;
      }

      const studentAttendance = await this.getStudentAttendanceForSync();

      if (studentAttendance.length === 0) {
        const result = { success: true, syncedRecords: 0, errors: [] };

        // Log the successful sync with no records
        await syncLogsService.addSyncLog({
          timestamp: Date.now(),
          type: "student",
          status: "success",
          syncedRecords: 0,
          errors: [],
          duration: Date.now() - startTime,
        });

        return result;
      }
      // Prepare data for bulk upload
      const bulkData = studentAttendance.map(att => ({
        studentId: att.studentId,
        classId: att.classId,
        date: att.date,
        status: att.status,
        notes: att.notes,
        markedBy: att.markedBy,
      }));

      // Send to backend
      await resyncApi.student(bulkData);

      // Update sync status after successful sync
      await DatabaseService.updateSyncStatus("student_attendance", Date.now());

      const result = {
        success: true,
        syncedRecords: studentAttendance.length,
        errors: [],
      };

      // Log the successful sync
      await syncLogsService.addSyncLog({
        timestamp: Date.now(),
        type: "student",
        status: "success",
        syncedRecords: studentAttendance.length,
        errors: [],
        duration: Date.now() - startTime,
      });

      return result;
    } catch (error) {
      console.error("Error syncing student attendance:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      const result = {
        success: false,
        syncedRecords: 0,
        errors: [errorMessage],
      };

      // Log the failed sync
      await syncLogsService.addSyncLog({
        timestamp: Date.now(),
        type: "student",
        status: "failed",
        syncedRecords: 0,
        errors: [errorMessage],
        duration: Date.now() - startTime,
      });

      return result;
    }
  }

  /**
   * Sync all attendance data (both teacher and student)
   */
  async syncAllAttendance(teacherId: string): Promise<{
    teacherResult: SyncResult;
    studentResult: SyncResult;
    totalSynced: number;
    totalErrors: string[];
  }> {
    try {
      const teacherResult = await this.syncTeacherAttendance(teacherId);
      const studentResult = await this.syncStudentAttendance();

      const totalSynced =
        teacherResult.syncedRecords + studentResult.syncedRecords;
      const totalErrors = [...teacherResult.errors, ...studentResult.errors];

      return {
        teacherResult,
        studentResult,
        totalSynced,
        totalErrors,
      };
    } catch (error) {
      console.error("Error in full attendance sync:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        teacherResult: {
          success: false,
          syncedRecords: 0,
          errors: [errorMessage],
        },
        studentResult: {
          success: false,
          syncedRecords: 0,
          errors: [errorMessage],
        },
        totalSynced: 0,
        totalErrors: [errorMessage],
      };
    }
  }

  /**
   * Get sync statistics
   */
  async getSyncStats(teacherId: string): Promise<{
    teacherAttendanceCount: number;
    studentAttendanceCount: number;
    lastSyncDate?: string;
  }> {
    try {
      // Get all records for statistics (not just unsynced ones)
      const allTeacherRecords = await DatabaseService.getTeacherAttendance(
        teacherId,
      );

      const classes = await DatabaseService.getAllClasses();
      const allStudentRecords: Omit<StudentAttendance, "id">[] = [];

      for (const cls of classes) {
        const records = await DatabaseService.getClassAttendance(cls.classId);
        allStudentRecords.push(
          ...records.map(record => ({
            studentId: record.studentId,
            classId: record.classId,
            date: record.date,
            status: record.status as AttendanceStatus,
            notes: record.notes || "",
            markedBy: record.markedBy || "",
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
          })),
        );
      }

      // Get last sync date from sync status
      const teacherSyncStatus = await DatabaseService.getSyncStatus(
        "teacherAttendance",
      );
      const studentSyncStatus = await DatabaseService.getSyncStatus(
        "studentAttendance",
      );

      const lastSyncDate =
        teacherSyncStatus?.lastSync || studentSyncStatus?.lastSync;

      return {
        teacherAttendanceCount: allTeacherRecords.length,
        studentAttendanceCount: allStudentRecords.length,
        lastSyncDate: lastSyncDate
          ? new Date(lastSyncDate).toISOString()
          : undefined,
      };
    } catch (error) {
      console.error("Error getting sync stats:", error);
      return {
        teacherAttendanceCount: 0,
        studentAttendanceCount: 0,
      };
    }
  }

  /**
   * Get records that need to be synced
   */
  async getPendingSyncCount(teacherId: string): Promise<{
    teacherAttendancePending: number;
    studentAttendancePending: number;
    totalPending: number;
  }> {
    try {
      // Get teacher attendance records that need sync
      const teacherAttendance = await this.getTeacherAttendanceForSync(
        teacherId,
      );
      // Get student attendance records that need sync
      const studentAttendance = await this.getStudentAttendanceForSync();

      const totalPending = teacherAttendance.length + studentAttendance.length;

      return {
        teacherAttendancePending: teacherAttendance.length,
        studentAttendancePending: studentAttendance.length,
        totalPending,
      };
    } catch (error) {
      console.error("Error getting pending sync count:", error);
      return {
        teacherAttendancePending: 0,
        studentAttendancePending: 0,
        totalPending: 0,
      };
    }
  }

  /**
   * Save sync frequency preference
   */
  async saveSyncFrequency(frequency: SyncFrequency["type"]): Promise<void> {
    try {
      await AsyncStorage.setItem("syncFrequency", frequency);
    } catch (error) {
      console.error("Error saving sync frequency:", error);
      throw error;
    }
  }

  /**
   * Get saved sync frequency preference
   */
  async getSyncFrequency(): Promise<SyncFrequency["type"] | null> {
    try {
      return (await AsyncStorage.getItem("syncFrequency")) as
        | SyncFrequency["type"]
        | null;
    } catch (error) {
      console.error("Error getting sync frequency:", error);
      return null;
    }
  }

  /**
   * Clear all local attendance data after successful sync
   */
  async clearAttendanceData(): Promise<void> {
    try {
      await DatabaseService.clearAllData();
    } catch (error) {
      console.error("Error clearing attendance data:", error);
      throw error;
    }
  }
}

export const resyncService = new ResyncService();
