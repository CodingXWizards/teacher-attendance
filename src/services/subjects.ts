import {
  Subject,
  SubjectListParams,
  PaginatedResponse,
  CreateSubjectRequest,
  UpdateSubjectRequest,
} from "@/types";
import { subjectsApi, handleApiError } from "@/lib/api";

class SubjectsService {
  /**
   * Get all subjects with pagination and filtering
   */
  static async getSubjects(
    params?: SubjectListParams
  ): Promise<PaginatedResponse<Subject>> {
    try {
      const response = await subjectsApi.list(params);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get active subjects only
   */
  static async getActiveSubjects(): Promise<Subject[]> {
    try {
      const response = await subjectsApi.active();
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get subject by ID
   */
  static async getSubjectById(id: string): Promise<Subject> {
    try {
      const response = await subjectsApi.get(id);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get subject by code
   */
  static async getSubjectByCode(code: string): Promise<Subject> {
    try {
      const response = await subjectsApi.byCode(code);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get subjects by field
   */
  static async getSubjectsByField(
    field: string,
    value: string
  ): Promise<Subject[]> {
    try {
      const response = await subjectsApi.byField(field);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create new subject
   */
  static async createSubject(
    subjectData: CreateSubjectRequest
  ): Promise<Subject> {
    try {
      const response = await subjectsApi.create(subjectData);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update subject
   */
  static async updateSubject(
    id: string,
    subjectData: UpdateSubjectRequest
  ): Promise<Subject> {
    try {
      const response = await subjectsApi.update(id, subjectData);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete subject (soft delete)
   */
  static async deleteSubject(id: string): Promise<void> {
    try {
      await subjectsApi.delete(id);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Hard delete subject
   */
  static async hardDeleteSubject(id: string): Promise<void> {
    try {
      await subjectsApi.hardDelete(id);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Search subjects by name or code
   */
  static async searchSubjects(searchTerm: string): Promise<Subject[]> {
    try {
      const response = await this.getSubjects({ search: searchTerm });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get subjects for a specific class
   */
  static async getSubjectsForClass(classId: string): Promise<Subject[]> {
    try {
      // This would need to be implemented in the backend
      // For now, return all active subjects
      return await this.getActiveSubjects();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get subjects taught by a specific teacher
   */
  static async getSubjectsByTeacher(teacherId: string): Promise<Subject[]> {
    try {
      // This would need to be implemented in the backend
      // For now, return all active subjects
      return await this.getActiveSubjects();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default SubjectsService;
