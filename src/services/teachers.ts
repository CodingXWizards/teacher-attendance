import {
  Teacher,
  TeacherWithUser,
  TeacherListParams,
  PaginatedResponse,
  TeacherClass,
  CreateTeacherRequest,
  UpdateTeacherRequest,
  AssignTeacherToClassRequest,
  RemoveTeacherFromClassRequest,
} from "@/types";
import { teachersApi, handleApiError } from "@/lib/api";

class TeachersService {
  /**
   * Get all teachers with pagination and filtering
   */
  static async getTeachers(
    params?: TeacherListParams
  ): Promise<PaginatedResponse<TeacherWithUser>> {
    try {
      const response = await teachersApi.list(params);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get teacher by ID
   */
  static async getTeacherById(id: string): Promise<TeacherWithUser> {
    try {
      const response = await teachersApi.get(id);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get teacher by employee ID
   */
  static async getTeacherByEmployeeId(
    employeeId: string
  ): Promise<TeacherWithUser> {
    try {
      const response = await teachersApi.byEmployeeId(employeeId);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get teachers by department
   */
  static async getTeachersByDepartment(
    department: string
  ): Promise<TeacherWithUser[]> {
    try {
      const response = await teachersApi.byDepartment(department);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get teacher's assignments (subjects and classes)
   */
  static async getTeacherAssignments(
    teacherId: string
  ): Promise<TeacherClass[]> {
    try {
      const response = await teachersApi.assignments(teacherId);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get current teacher profile
   */
  static async getTeacherProfile(): Promise<TeacherWithUser> {
    try {
      const response = await teachersApi.profile();
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create new teacher
   */
  static async createTeacher(
    teacherData: CreateTeacherRequest
  ): Promise<Teacher> {
    try {
      const response = await teachersApi.create(teacherData);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update teacher
   */
  static async updateTeacher(
    id: string,
    teacherData: UpdateTeacherRequest
  ): Promise<Teacher> {
    try {
      const response = await teachersApi.update(id, teacherData);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete teacher
   */
  static async deleteTeacher(id: string): Promise<void> {
    try {
      await teachersApi.delete(id);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Assign teacher to class
   */
  static async assignToClass(
    assignmentData: AssignTeacherToClassRequest
  ): Promise<TeacherClass> {
    try {
      const response = await teachersApi.assignToClass(assignmentData);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Remove teacher from class assignment
   */
  static async removeFromClass(
    assignmentData: RemoveTeacherFromClassRequest
  ): Promise<void> {
    try {
      await teachersApi.removeFromClass(assignmentData);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Search teachers by name or employee ID
   */
  static async searchTeachers(searchTerm: string): Promise<TeacherWithUser[]> {
    try {
      const response = await this.getTeachers({ search: searchTerm });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get teachers for a specific class
   */
  static async getTeachersForClass(
    classId: string
  ): Promise<TeacherClass[]> {
    try {
      // This would need to be implemented in the backend
      // For now, we'll get all teachers and filter by assignments
      const teachers = await this.getTeachers();
      const classTeachers: TeacherClass[] = [];

      for (const teacher of teachers.data) {
        const assignments = await this.getTeacherAssignments(teacher.id);
        const classAssignment = assignments.find(
          (assignment) => assignment.classId === classId
        );
        if (classAssignment) {
          classTeachers.push(classAssignment);
        }
      }

      return classTeachers;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get active teachers only
   */
  static async getActiveTeachers(): Promise<TeacherWithUser[]> {
    try {
      const response = await this.getTeachers({ isActive: true });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default TeachersService;
