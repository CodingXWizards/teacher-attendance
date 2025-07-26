import { attendanceApi, handleApiError } from "@/lib/api";

export interface TeacherAttendance {
  id: string;
  teacherId: string;
  teacherName: string;
  date: string;
  isPresent: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentAttendance {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  date: string;
  isPresent: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeacherAttendanceRequest {
  teacherId: string;
  date: string;
  isPresent: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

export interface UpdateTeacherAttendanceRequest {
  isPresent?: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

export interface CreateStudentAttendanceRequest {
  studentId: string;
  classId: string;
  date: string;
  isPresent: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

export interface UpdateStudentAttendanceRequest {
  isPresent?: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

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
   * Get paginated list of teacher attendance
   */
  static async getTeacherAttendance(params?: AttendanceListParams): Promise<{
    attendance: TeacherAttendance[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      // Convert string IDs to numbers for API compatibility
      const apiParams = params ? {
        ...params,
        teacherId: params.teacherId ? parseInt(params.teacherId) : undefined
      } : undefined;
      
      const response = await attendanceApi.list(apiParams);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch teacher attendance");
      }

      return {
        attendance: response.data,
        pagination: response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get a single teacher attendance record
   */
  static async getTeacherAttendanceRecord(id: string): Promise<TeacherAttendance> {
    try {
      const response = await attendanceApi.get(id);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch attendance record");
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create a new teacher attendance record
   */
  static async createTeacherAttendance(attendanceData: CreateTeacherAttendanceRequest): Promise<TeacherAttendance> {
    try {
      // Convert string ID to number for API compatibility
      const apiData = {
        ...attendanceData,
        teacherId: parseInt(attendanceData.teacherId)
      };
      
      const response = await attendanceApi.create(apiData);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to create attendance record");
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update an existing teacher attendance record
   */
  static async updateTeacherAttendance(id: string, attendanceData: UpdateTeacherAttendanceRequest): Promise<TeacherAttendance> {
    try {
      const response = await attendanceApi.update(id, attendanceData);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to update attendance record");
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete a teacher attendance record
   */
  static async deleteTeacherAttendance(id: string): Promise<void> {
    try {
      const response = await attendanceApi.delete(id);
      
      if (!response.success) {
        throw new Error(response.message || "Failed to delete attendance record");
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get attendance by date
   */
  static async getAttendanceByDate(date: string): Promise<TeacherAttendance[]> {
    try {
      const response = await attendanceApi.byDate(date);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch attendance by date");
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get attendance by teacher
   */
  static async getAttendanceByTeacher(teacherId: string): Promise<TeacherAttendance[]> {
    try {
      const response = await attendanceApi.byTeacher(teacherId);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch attendance by teacher");
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Mark teacher present
   */
  static async markTeacherPresent(teacherId: string, date: string, checkInTime?: string): Promise<TeacherAttendance> {
    const attendanceData: CreateTeacherAttendanceRequest = {
      teacherId,
      date,
      isPresent: true,
      checkInTime
    };

    return this.createTeacherAttendance(attendanceData);
  }

  /**
   * Mark teacher absent
   */
  static async markTeacherAbsent(teacherId: string, date: string, notes?: string): Promise<TeacherAttendance> {
    const attendanceData: CreateTeacherAttendanceRequest = {
      teacherId,
      date,
      isPresent: false,
      notes
    };

    return this.createTeacherAttendance(attendanceData);
  }

  /**
   * Check out teacher
   */
  static async checkOutTeacher(attendanceId: string, checkOutTime: string): Promise<TeacherAttendance> {
    return this.updateTeacherAttendance(attendanceId, { checkOutTime });
  }

  /**
   * Get attendance summary for a date range
   */
  static async getAttendanceSummary(startDate: string, endDate: string): Promise<AttendanceSummary> {
    try {
      const response = await attendanceApi.list({ 
        date: startDate,
        // Note: This is a simplified approach. In a real app, you'd have a dedicated summary endpoint
      });
      
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch attendance summary");
      }

      const attendance = response.data;
      const total = attendance.length;
      const present = attendance.filter(a => a.isPresent).length;
      const absent = total - present;

      return {
        total,
        present,
        absent,
        presentPercentage: total > 0 ? (present / total) * 100 : 0,
        absentPercentage: total > 0 ? (absent / total) * 100 : 0
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Bulk mark attendance for multiple teachers
   */
  static async bulkMarkTeacherAttendance(attendanceData: CreateTeacherAttendanceRequest[]): Promise<TeacherAttendance[]> {
    try {
      const promises = attendanceData.map(data => this.createTeacherAttendance(data));
      return await Promise.all(promises);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default AttendanceService; 