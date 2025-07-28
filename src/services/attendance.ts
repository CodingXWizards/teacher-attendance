import { attendanceApi, handleApiError } from "@/lib/api";
import {
  TeacherAttendance,
  StudentAttendance,
  CreateTeacherAttendanceRequest,
  UpdateTeacherAttendanceRequest,
  CreateStudentAttendanceRequest,
  UpdateStudentAttendanceRequest,
  AttendanceStatus,
} from "@/types/attendance";

// Re-export the types for backward compatibility
export {
  TeacherAttendance,
  StudentAttendance,
  CreateTeacherAttendanceRequest,
  UpdateTeacherAttendanceRequest,
  CreateStudentAttendanceRequest,
  UpdateStudentAttendanceRequest,
};

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
      const response = await attendanceApi.teacher.list(params);

      return {
        attendance: response.data,
        pagination: response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get a single teacher attendance record
   */
  static async getTeacherAttendanceRecord(
    id: string
  ): Promise<TeacherAttendance> {
    try {
      const response = await attendanceApi.teacher.get(id);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create a new teacher attendance record
   */
  static async createTeacherAttendance(
    attendanceData: CreateTeacherAttendanceRequest
  ): Promise<TeacherAttendance> {
    try {
      const response = await attendanceApi.teacher.create(attendanceData);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update an existing teacher attendance record
   */
  static async updateTeacherAttendance(
    id: string,
    attendanceData: UpdateTeacherAttendanceRequest
  ): Promise<TeacherAttendance> {
    try {
      const response = await attendanceApi.teacher.update(id, attendanceData);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete a teacher attendance record
   */
  static async deleteTeacherAttendance(id: string): Promise<void> {
    try {
      await attendanceApi.teacher.delete(id);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get attendance by date
   */
  static async getAttendanceByDate(date: string): Promise<TeacherAttendance[]> {
    try {
      const response = await attendanceApi.teacher.byDate(date);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get attendance by teacher
   */
  static async getAttendanceByTeacher(
    teacherId: string
  ): Promise<TeacherAttendance[]> {
    try {
      const response = await attendanceApi.teacher.byTeacher(teacherId);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get student attendance by class
   */
  static async getStudentAttendanceByClass(
    classId: string
  ): Promise<StudentAttendance[]> {
    try {
      const response = await attendanceApi.student.byClass(classId);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get student attendance by class and date
   */
  static async getStudentAttendanceByClassAndDate(
    classId: string,
    date: string
  ): Promise<StudentAttendance[]> {
    try {
      const response = await attendanceApi.student.list({
        classId,
        date,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create student attendance record
   */
  static async createStudentAttendance(
    attendanceData: CreateStudentAttendanceRequest
  ): Promise<StudentAttendance> {
    try {
      const response = await attendanceApi.student.create(attendanceData);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Bulk create student attendance records
   */
  static async bulkCreateStudentAttendance(
    attendanceData: CreateStudentAttendanceRequest[]
  ): Promise<StudentAttendance[]> {
    try {
      const promises = attendanceData.map((data) =>
        this.createStudentAttendance(data)
      );
      return await Promise.all(promises);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Mark teacher present
   */
  static async markTeacherPresent(
    teacherId: string,
    date: string,
    checkInTime?: string
  ): Promise<TeacherAttendance> {
    const attendanceData: CreateTeacherAttendanceRequest = {
      teacherId,
      date,
      status: AttendanceStatus.PRESENT,
      checkIn: checkInTime,
    };

    return this.createTeacherAttendance(attendanceData);
  }

  /**
   * Mark teacher absent
   */
  static async markTeacherAbsent(
    teacherId: string,
    date: string,
    notes?: string
  ): Promise<TeacherAttendance> {
    const attendanceData: CreateTeacherAttendanceRequest = {
      teacherId,
      date,
      status: AttendanceStatus.ABSENT,
      notes,
    };

    return this.createTeacherAttendance(attendanceData);
  }

  /**
   * Check out teacher
   */
  static async checkOutTeacher(
    attendanceId: string,
    checkOutTime: string
  ): Promise<TeacherAttendance> {
    return this.updateTeacherAttendance(attendanceId, {
      checkOut: checkOutTime,
    });
  }

  /**
   * Get attendance summary for a date range
   */
  static async getAttendanceSummary(
    startDate: string,
    endDate: string
  ): Promise<AttendanceSummary> {
    try {
      // Get teacher attendance for the date range
      const response = await attendanceApi.teacher.list({
        date: startDate,
        // Note: This is a simplified approach. In a real app, you'd have a dedicated summary endpoint
      });

      const attendance = response.data;
      const total = attendance.length;
      const present = attendance.filter(
        (a: TeacherAttendance) => a.status === AttendanceStatus.PRESENT
      ).length;
      const absent = total - present;

      return {
        total,
        present,
        absent,
        presentPercentage: total > 0 ? (present / total) * 100 : 0,
        absentPercentage: total > 0 ? (absent / total) * 100 : 0,
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Bulk mark attendance for multiple teachers
   */
  static async bulkMarkTeacherAttendance(
    attendanceData: CreateTeacherAttendanceRequest[]
  ): Promise<TeacherAttendance[]> {
    try {
      const promises = attendanceData.map((data) =>
        this.createTeacherAttendance(data)
      );
      return await Promise.all(promises);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default AttendanceService;
