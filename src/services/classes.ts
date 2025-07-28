import {
  Class,
  TeacherClass,
  ClassListParams,
  ClassWithDetails,
  PaginatedResponse,
  CreateClassRequest,
  UpdateClassRequest,
} from "@/types";
import { classesApi, handleApiError } from "@/lib/api";

class ClassesService {
  /**
   * Get all classes with pagination and filtering
   */
  static async getClasses(
    params?: ClassListParams
  ): Promise<PaginatedResponse<Class>> {
    try {
      const response = await classesApi.list(params);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get active classes only
   */
  static async getActiveClasses(): Promise<Class[]> {
    try {
      const response = await classesApi.active();
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get class by ID
   */
  static async getClassById(id: string): Promise<Class> {
    try {
      const response = await classesApi.get(id);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get classes by grade
   */
  static async getClassesByGrade(grade: string): Promise<Class[]> {
    try {
      const response = await classesApi.byGrade(grade);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get classes by academic year
   */
  static async getClassesByAcademicYear(
    academicYear: string
  ): Promise<Class[]> {
    try {
      const response = await classesApi.byAcademicYear(academicYear);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get class by name and grade
   */
  static async getClassByNameAndGrade(
    name: string,
    grade: string
  ): Promise<Class> {
    try {
      const response = await classesApi.byNameAndGrade(name, grade);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get students in a class
   */
  static async getClassStudents(classId: string): Promise<any[]> {
    // Assuming Student type is not directly imported, using 'any' for now
    try {
      const response = await classesApi.students(classId);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get teachers assigned to a class
   */
  static async getClassTeachers(classId: string): Promise<TeacherClass[]> {
    try {
      const response = await classesApi.teachers(classId);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get class statistics
   */
  static async getClassStats(classId: string): Promise<any> {
    // Assuming ClassStats type is not directly imported, using 'any' for now
    try {
      const response = await classesApi.stats(classId);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create new class
   */
  static async createClass(classData: CreateClassRequest): Promise<Class> {
    try {
      const response = await classesApi.create(classData);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update class
   */
  static async updateClass(
    id: string,
    classData: UpdateClassRequest
  ): Promise<Class> {
    try {
      const response = await classesApi.update(id, classData);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete class
   */
  static async deleteClass(id: string): Promise<void> {
    try {
      await classesApi.delete(id);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get class with full details (students and teachers)
   */
  static async getClassWithDetails(id: string): Promise<ClassWithDetails> {
    try {
      const [classData, students, teachers] = await Promise.all([
        this.getClassById(id),
        this.getClassStudents(id),
        this.getClassTeachers(id),
      ]);

      return {
        ...classData,
        students,
        teachers,
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default ClassesService;
