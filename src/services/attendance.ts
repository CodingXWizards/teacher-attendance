import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkInternetConnection } from 'react-native-offline';

// Storage keys for offline data
const OFFLINE_TEACHER_ATTENDANCE_KEY = 'offline_teacher_attendance';
const OFFLINE_STUDENT_ATTENDANCE_KEY = 'offline_student_attendance';
const PENDING_SYNC_KEY = 'pending_sync_operations';

interface PendingOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: number;
  retryCount: number;
}

interface OfflineAttendanceData {
  teacherAttendance: any[];
  studentAttendance: any[];
  lastSyncTimestamp: number;
}

// Define the interface for attendance list parameters
export interface AttendanceListParams {
  page?: number;
  limit?: number;
  date?: string;
  teacherId?: string;
  classId?: string;
  studentId?: string;
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED'
}

class AttendanceService {
  /**
   * Save data to local storage for offline access
   */
  private static async saveOfflineData(key: string, data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  }

  /**
   * Get data from local storage
   */
  private static async getOfflineData(key: string): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving offline data:', error);
      return null;
    }
  }

  /**
   * Add operation to pending sync queue - Made public
   */
  public static async addToPendingSync(operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    try {
      const pendingOps = await this.getOfflineData(PENDING_SYNC_KEY) || [];
      const newOperation: PendingOperation = {
        ...operation,
        id: Date.now().toString(),
        timestamp: Date.now(),
        retryCount: 0,
      };
      
      pendingOps.push(newOperation);
      await this.saveOfflineData(PENDING_SYNC_KEY, pendingOps);
    } catch (error) {
      console.error('Error adding to pending sync:', error);
    }
  }

  /**
   * Check if device is online
   */
  private static async isOnline(): Promise<boolean> {
    try {
      const isConnected = await checkInternetConnection();
      return isConnected ?? false; // Handle null case
    } catch (error) {
      return false;
    }
  }

  /**
   * Sync pending operations when online
   */
  static async syncPendingOperations(): Promise<void> {
    const isConnected = await this.isOnline();
    if (!isConnected) return;

    try {
      const pendingOps: PendingOperation[] = await this.getOfflineData(PENDING_SYNC_KEY) || [];
      const remainingOps: PendingOperation[] = [];

      for (const operation of pendingOps) {
        try {
          // Since you're using local SQLite, you might want to implement
          // server sync here if you have a backend API
          console.log(`Processing operation: ${operation.id}`, operation);
          
          // For now, we'll just mark as completed since you're using local SQLite
          // In a real implementation, you'd sync with your backend server here
          
        } catch (error) {
          operation.retryCount++;
          if (operation.retryCount < 3) {
            remainingOps.push(operation);
          }
          console.error(`Failed to sync operation ${operation.id}:`, error);
        }
      }

      await this.saveOfflineData(PENDING_SYNC_KEY, remainingOps);
    } catch (error) {
      console.error('Error during sync:', error);
    }
  }

  /**
   * Get teacher attendance with offline support
   */
  static async getTeacherAttendance(params?: AttendanceListParams): Promise<{
    attendance: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const isConnected = await this.isOnline();
    
    if (isConnected) {
      try {
        // If you have an API, call it here
        // For now, returning from offline data
        const offlineData = await this.getOfflineData(OFFLINE_TEACHER_ATTENDANCE_KEY);
        const data = offlineData?.data || [];
        
        return {
          attendance: data,
          pagination: {
            page: 1,
            limit: 10,
            total: data.length,
            totalPages: Math.ceil(data.length / 10),
          },
        };
      } catch (error) {
        // If online but API fails, fall back to offline data
        const offlineData = await this.getOfflineData(OFFLINE_TEACHER_ATTENDANCE_KEY);
        if (offlineData) {
          return {
            attendance: offlineData.data,
            pagination: {
              page: 1,
              limit: 10,
              total: offlineData.data.length,
              totalPages: Math.ceil(offlineData.data.length / 10),
            },
          };
        }
        throw new Error('Failed to load attendance data');
      }
    } else {
      // Offline mode - return cached data
      const offlineData = await this.getOfflineData(OFFLINE_TEACHER_ATTENDANCE_KEY);
      if (offlineData) {
        return {
          attendance: offlineData.data,
          pagination: {
            page: 1,
            limit: 10,
            total: offlineData.data.length,
            totalPages: Math.ceil(offlineData.data.length / 10),
          },
        };
      } else {
        return {
          attendance: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          },
        };
      }
    }
  }

  /**
   * Create teacher attendance with offline support
   */
  static async createTeacherAttendance(attendanceData: any): Promise<any> {
    const isConnected = await this.isOnline();
    
    if (isConnected) {
      try {
        // If you have an API, call it here
        // For now, we'll just create a temporary record
        const tempRecord = {
          id: `temp_${Date.now()}`,
          ...attendanceData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        return tempRecord;
      } catch (error) {
        // If online but fails, queue for later sync
        await this.addToPendingSync({
          type: 'CREATE',
          data: {
            type: 'teacher',
            payload: attendanceData,
          },
        });
        
        // Create temporary local record
        const tempRecord = {
          id: `temp_${Date.now()}`,
          ...attendanceData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        return tempRecord;
      }
    } else {
      // Offline mode - queue for sync and create temporary record
      await this.addToPendingSync({
        type: 'CREATE',
        data: {
          type: 'teacher',
          payload: attendanceData,
        },
      });
      
      const tempRecord = {
        id: `temp_${Date.now()}`,
        ...attendanceData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return tempRecord;
    }
  }

  /**
   * Mark teacher present with offline support
   */
  static async markTeacherPresent(
    teacherId: string,
    date: string,
    checkInTime?: string
  ): Promise<any> {
    const attendanceData = {
      teacherId,
      date,
      status: AttendanceStatus.PRESENT,
      checkIn: checkInTime,
    };

    return this.createTeacherAttendance(attendanceData);
  }

  /**
   * Mark teacher absent with offline support
   */
  static async markTeacherAbsent(
    teacherId: string,
    date: string,
    notes?: string
  ): Promise<any> {
    const attendanceData = {
      teacherId,
      date,
      status: AttendanceStatus.ABSENT,
      notes,
    };

    return this.createTeacherAttendance(attendanceData);
  }

  /**
   * Get pending sync operations count
   */
  static async getPendingSyncCount(): Promise<number> {
    const pendingOps = await this.getOfflineData(PENDING_SYNC_KEY) || [];
    return pendingOps.length;
  }

  /**
   * Clear all offline data (use with caution)
   */
  static async clearOfflineData(): Promise<void> {
    await AsyncStorage.multiRemove([
      OFFLINE_TEACHER_ATTENDANCE_KEY,
      OFFLINE_STUDENT_ATTENDANCE_KEY,
      PENDING_SYNC_KEY,
    ]);
  }
}

export default AttendanceService;
