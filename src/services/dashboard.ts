import {
  ClassesService,
  StudentsService,
  TeachersService,
  SubjectsService,
} from "@/services";
import {
  DashboardStats,
  ClassWithDetails,
  TeacherDashboardData,
} from "@/types";

class DashboardService {
  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [classes, students, teachers, subjects] = await Promise.all([
        ClassesService.getActiveClasses(),
        StudentsService.getActiveStudents(),
        TeachersService.getActiveTeachers(),
        SubjectsService.getActiveSubjects(),
      ]);

      // Calculate today's sessions (for now, just count classes)
      // In the future, this could be based on actual attendance records
      const todaySessions = classes.length;

      return {
        totalClasses: classes.length,
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalSubjects: subjects.length,
        todaySessions,
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard stats: ${error}`);
    }
  }

  /**
   * Get teacher-specific dashboard stats (only data teacher has access to)
   */
  static async getTeacherStats(teacherId: string): Promise<DashboardStats> {
    try {
      const assignments =
        await TeachersService.getTeacherAssignments(teacherId);

      // For teachers, we can only show what they have access to
      const todaySessions = assignments.length;

      // Count unique classes the teacher teaches
      const uniqueClasses = new Set(assignments.map((a) => a.classId)).size;

      // Calculate total students from all assigned classes
      let totalStudents = 0;
      for (const assignment of assignments) {
        try {
          const classDetails = await ClassesService.getClassWithDetails(
            assignment.classId
          );
          totalStudents += classDetails.students?.length || 0;
        } catch (error) {
          console.warn(
            `Failed to get student count for class ${assignment.classId}:`,
            error
          );
        }
      }

      return {
        totalClasses: assignments.length,
        totalStudents,
        totalTeachers: 1, // Teacher only sees themselves
        totalSubjects: uniqueClasses, // Now represents unique classes
        todaySessions,
      };
    } catch (error) {
      throw new Error(`Failed to get teacher stats: ${error}`);
    }
  }

  /**
   * Get teacher dashboard data (assignments with class details)
   */
  static async getTeacherDashboard(
    teacherId: string
  ): Promise<TeacherDashboardData> {
    try {
      const [assignments, stats] = await Promise.all([
        TeachersService.getTeacherAssignments(teacherId),
        this.getTeacherStats(teacherId),
      ]);

      // Get class details for each assignment
      const classesWithDetails: ClassWithDetails[] = [];

      for (const assignment of assignments) {
        try {
          const classDetails = await ClassesService.getClassWithDetails(
            assignment.classId
          );
          classesWithDetails.push(classDetails);
        } catch (error) {
          console.warn(
            `Failed to get details for class ${assignment.classId}:`,
            error
          );
        }
      }

      return {
        classes: classesWithDetails,
        assignments,
        stats,
      };
    } catch (error) {
      throw new Error(`Failed to get teacher dashboard: ${error}`);
    }
  }

  /**
   * Get classes for a teacher with student counts
   */
  static async getTeacherClasses(
    teacherId: string
  ): Promise<ClassWithDetails[]> {
    try {
      const assignments =
        await TeachersService.getTeacherAssignments(teacherId);
      const classesWithDetails: ClassWithDetails[] = [];

      for (const assignment of assignments) {
        try {
          const classDetails = await ClassesService.getClassWithDetails(
            assignment.classId
          );
          classesWithDetails.push(classDetails);
        } catch (error) {
          console.warn(
            `Failed to get details for class ${assignment.classId}:`,
            error
          );
        }
      }

      return classesWithDetails;
    } catch (error) {
      throw new Error(`Failed to get teacher classes: ${error}`);
    }
  }

  /**
   * Get class summary for dashboard cards
   */
  static async getClassSummary(classId: string) {
    try {
      const [classData, students, teachers] = await Promise.all([
        ClassesService.getClassById(classId),
        ClassesService.getClassStudents(classId),
        ClassesService.getClassTeachers(classId),
      ]);

      return {
        id: classData.id,
        name: classData.name,
        grade: classData.grade,
        section: classData.section,
        academicYear: classData.academicYear,
        studentCount: students.length,
        teacherCount: teachers.length,
        // Generate a color based on class name for consistency
        color: this.generateColorFromString(classData.name),
      };
    } catch (error) {
      throw new Error(`Failed to get class summary: ${error}`);
    }
  }

  /**
   * Get all classes with summaries for dashboard
   */
  static async getAllClassSummaries() {
    try {
      const classes = await ClassesService.getActiveClasses();
      const summaries = [];

      for (const classData of classes) {
        try {
          const summary = await this.getClassSummary(classData.id);
          summaries.push(summary);
        } catch (error) {
          console.warn(
            `Failed to get summary for class ${classData.id}:`,
            error
          );
        }
      }

      return summaries;
    } catch (error) {
      throw new Error(`Failed to get class summaries: ${error}`);
    }
  }

  /**
   * Generate a consistent color from a string
   */
  private static generateColorFromString(str: string): string {
    const colors = [
      "#8b5cf6", // Purple
      "#06b6d4", // Cyan
      "#10b981", // Emerald
      "#f59e0b", // Amber
      "#ef4444", // Red
      "#3b82f6", // Blue
      "#84cc16", // Lime
      "#f97316", // Orange
      "#8b5cf6", // Violet
      "#06b6d4", // Sky
    ];

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return colors[Math.abs(hash) % colors.length];
  }

  /**
   * Get recent activity (placeholder for future implementation)
   */
  static async getRecentActivity() {
    try {
      // This would typically fetch recent attendance records, updates, etc.
      // For now, return empty array
      return [];
    } catch (error) {
      throw new Error(`Failed to get recent activity: ${error}`);
    }
  }

  /**
   * Get quick stats for admin dashboard
   */
  static async getAdminQuickStats() {
    try {
      const [classes, students, teachers, subjects] = await Promise.all([
        ClassesService.getActiveClasses(),
        StudentsService.getActiveStudents(),
        TeachersService.getActiveTeachers(),
        SubjectsService.getActiveSubjects(),
      ]);

      return {
        totalClasses: classes.length,
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalSubjects: subjects.length,
        activeClasses: classes.filter((c) => c.isActive).length,
        activeStudents: students.filter((s) => s.isActive).length,
        activeTeachers: teachers.filter((t) => t.isActive).length,
        activeSubjects: subjects.filter((s) => s.isActive).length,
      };
    } catch (error) {
      throw new Error(`Failed to get admin quick stats: ${error}`);
    }
  }
}

export default DashboardService;
