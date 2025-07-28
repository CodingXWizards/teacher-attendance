import {
  Student,
  StudentWithClass,
  StudentListParams,
  StudentAttendance,
  PaginatedResponse,
  CreateStudentRequest,
  UpdateStudentRequest,
} from "@/types";
import { studentsApi, handleApiError } from "@/lib/api";

class StudentsService {
  /**
   * Get all students with pagination and filtering
   */
  static async getStudents(
    params?: StudentListParams
  ): Promise<PaginatedResponse<StudentWithClass>> {
    try {
      const response = await studentsApi.list(params);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get active students only
   */
  static async getActiveStudents(): Promise<StudentWithClass[]> {
    try {
      const response = await studentsApi.active();
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get student by ID
   */
  static async getStudentById(id: string): Promise<StudentWithClass> {
    try {
      const response = await studentsApi.get(id);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get student by student ID
   */
  static async getStudentByStudentId(
    studentId: string
  ): Promise<StudentWithClass> {
    try {
      const response = await studentsApi.byStudentId(studentId);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get students by class
   */
  static async getStudentsByClass(classId: string): Promise<Student[]> {
    try {
      const response = await studentsApi.byClass(classId);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get students by gender
   */
  static async getStudentsByGender(
    gender: string
  ): Promise<StudentWithClass[]> {
    try {
      const response = await studentsApi.byGender(gender);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get student's attendance records
   */
  static async getStudentAttendance(
    studentId: string,
    params?: {
      startDate?: string;
      endDate?: string;
      classId?: string;
    }
  ): Promise<StudentAttendance[]> {
    try {
      const response = await studentsApi.attendance(studentId, params);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create new student
   */
  static async createStudent(
    studentData: CreateStudentRequest
  ): Promise<Student> {
    try {
      const response = await studentsApi.create(studentData);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update student
   */
  static async updateStudent(
    id: string,
    studentData: UpdateStudentRequest
  ): Promise<Student> {
    try {
      const response = await studentsApi.update(id, studentData);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete student
   */
  static async deleteStudent(id: string): Promise<void> {
    try {
      await studentsApi.delete(id);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Search students by name
   */
  static async searchStudents(searchTerm: string): Promise<StudentWithClass[]> {
    try {
      const response = await this.getStudents({ search: searchTerm });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get students with attendance for a specific date
   */
  static async getStudentsWithAttendance(
    classId: string,
    date: string,
    subjectId: string
  ): Promise<Student[]> {
    try {
      const students = await this.getStudentsByClass(classId);

      // For now, return students without attendance data
      // In the future, this could be enhanced to include attendance status
      return students;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default StudentsService;
