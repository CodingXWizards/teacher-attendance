import { reportsApi, handleApiError } from "@/lib/api";

export interface AttendanceSummary {
  totalTeachers: number;
  presentTeachers: number;
  absentTeachers: number;
  presentPercentage: number;
  absentPercentage: number;
  date: string;
}

export interface TeacherAttendanceReport {
  teacherId: string;
  teacherName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  presentPercentage: number;
  averageCheckInTime?: string;
  averageCheckOutTime?: string;
  lastAttendanceDate?: string;
}

export interface DateRangeReport {
  startDate: string;
  endDate: string;
  totalDays: number;
  summary: AttendanceSummary;
  teacherReports: TeacherAttendanceReport[];
  dailyBreakdown: {
    date: string;
    present: number;
    absent: number;
    total: number;
  }[];
}

export interface MonthlyReport {
  month: string;
  year: number;
  summary: AttendanceSummary;
  teacherReports: TeacherAttendanceReport[];
  weeklyBreakdown: {
    week: string;
    present: number;
    absent: number;
    total: number;
  }[];
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  teacherId?: string;
  classId?: string;
  includeInactive?: boolean;
}

class ReportsService {
  /**
   * Get attendance summary for a specific date
   */
  static async getAttendanceSummary(date?: string): Promise<AttendanceSummary> {
    try {
      const params = date ? { startDate: date, endDate: date } : undefined;
      const response = await reportsApi.summary(params);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch attendance summary");
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get teacher-specific attendance report
   */
  static async getTeacherReport(
    teacherId: string,
    filters?: ReportFilters
  ): Promise<TeacherAttendanceReport> {
    try {
      const params = filters ? {
        startDate: filters.startDate,
        endDate: filters.endDate
      } : undefined;
      
      const response = await reportsApi.teacher(teacherId, params);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch teacher report");
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get date range report
   */
  static async getDateRangeReport(
    startDate: string,
    endDate: string,
    filters?: ReportFilters
  ): Promise<DateRangeReport> {
    try {
      const params = { startDate, endDate };
      const response = await reportsApi.dateRange(params);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch date range report");
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get monthly attendance report
   */
  static async getMonthlyReport(
    month: number,
    year: number,
    filters?: ReportFilters
  ): Promise<MonthlyReport> {
    try {
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month
      
      const response = await reportsApi.dateRange({ startDate, endDate });
      
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch monthly report");
      }

      // Transform the data to monthly format
      const data = response.data;
      return {
        month: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
        year,
        summary: data.summary,
        teacherReports: data.teacherReports,
        weeklyBreakdown: this.generateWeeklyBreakdown(data.dailyBreakdown)
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get attendance trends over time
   */
  static async getAttendanceTrends(
    days: number = 30,
    filters?: ReportFilters
  ): Promise<{
    dates: string[];
    presentCounts: number[];
    absentCounts: number[];
    totalCounts: number[];
  }> {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];
      
      const response = await reportsApi.dateRange({ startDate, endDate });
      
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch attendance trends");
      }

      const { dailyBreakdown } = response.data;
      
      return {
        dates: dailyBreakdown.map((d: any) => d.date),
        presentCounts: dailyBreakdown.map((d: any) => d.present),
        absentCounts: dailyBreakdown.map((d: any) => d.absent),
        totalCounts: dailyBreakdown.map((d: any) => d.total)
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get top performing teachers (highest attendance)
   */
  static async getTopPerformingTeachers(
    limit: number = 10,
    filters?: ReportFilters
  ): Promise<TeacherAttendanceReport[]> {
    try {
      const response = await reportsApi.summary(filters);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch top performing teachers");
      }

      // This would typically come from a dedicated endpoint
      // For now, we'll return an empty array as placeholder
      return [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get teachers with low attendance
   */
  static async getLowAttendanceTeachers(
    threshold: number = 80,
    filters?: ReportFilters
  ): Promise<TeacherAttendanceReport[]> {
    try {
      const response = await reportsApi.summary(filters);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch low attendance teachers");
      }

      // This would typically come from a dedicated endpoint
      // For now, we'll return an empty array as placeholder
      return [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Export report to CSV
   */
  static async exportReportToCSV(
    reportType: 'summary' | 'teacher' | 'dateRange' | 'monthly',
    params: any
  ): Promise<string> {
    try {
      // This would typically call a dedicated export endpoint
      // For now, we'll return a placeholder
      return "CSV export functionality would be implemented here";
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Generate weekly breakdown from daily data
   */
  private static generateWeeklyBreakdown(dailyBreakdown: any[]): any[] {
    const weeklyData: { [key: string]: any } = {};
    
    dailyBreakdown.forEach(day => {
      const date = new Date(day.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week: weekKey,
          present: 0,
          absent: 0,
          total: 0
        };
      }
      
      weeklyData[weekKey].present += day.present;
      weeklyData[weekKey].absent += day.absent;
      weeklyData[weekKey].total += day.total;
    });
    
    return Object.values(weeklyData);
  }
}

export default ReportsService; 