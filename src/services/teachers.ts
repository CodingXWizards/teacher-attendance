import { teachersApi, handleApiError } from "@/lib/api";

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeacherRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
}

export interface UpdateTeacherRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  subject?: string;
  isActive?: boolean;
}

export interface TeachersListParams {
  page?: number;
  limit?: number;
  search?: string;
  subject?: string;
  isActive?: boolean;
}

class TeachersService {
  /**
   * Get paginated list of teachers
   */
  static async getTeachers(params?: TeachersListParams): Promise<{
    teachers: Teacher[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const response = await teachersApi.list(params);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch teachers");
      }

      return {
        teachers: response.data,
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
   * Get a single teacher by ID
   */
  static async getTeacher(id: string): Promise<Teacher> {
    try {
      const response = await teachersApi.get(id);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch teacher");
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create a new teacher
   */
  static async createTeacher(teacherData: CreateTeacherRequest): Promise<Teacher> {
    try {
      // Convert to API expected format
      const apiData = {
        name: `${teacherData.firstName} ${teacherData.lastName}`,
        subject: teacherData.subject,
        email: teacherData.email,
        phone: teacherData.phone
      };
      
      const response = await teachersApi.create(apiData);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to create teacher");
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update an existing teacher
   */
  static async updateTeacher(id: string, teacherData: UpdateTeacherRequest): Promise<Teacher> {
    try {
      const response = await teachersApi.update(id, teacherData);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to update teacher");
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete a teacher
   */
  static async deleteTeacher(id: string): Promise<void> {
    try {
      const response = await teachersApi.delete(id);
      
      if (!response.success) {
        throw new Error(response.message || "Failed to delete teacher");
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Search teachers by name or subject
   */
  static async searchTeachers(query: string): Promise<Teacher[]> {
    try {
      const response = await teachersApi.list({ search: query });
      
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to search teachers");
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get teachers by subject
   */
  static async getTeachersBySubject(subject: string): Promise<Teacher[]> {
    try {
      const response = await teachersApi.list({ search: subject });
      
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch teachers by subject");
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get active teachers only
   */
  static async getActiveTeachers(): Promise<Teacher[]> {
    try {
      const response = await teachersApi.list();
      
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch active teachers");
      }

      // Filter active teachers on client side
      return response.data.filter(teacher => teacher.isActive);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default TeachersService; 