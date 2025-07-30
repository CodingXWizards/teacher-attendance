import {
  User,
  UserStats,
  SearchParams,
  UserListParams,
  PaginatedResponse,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  UpdatePasswordRequest,
  Teacher,
  TeacherListParams,
  CreateTeacherRequest,
  UpdateTeacherRequest,
  TeacherClass,
} from "@/types";
import { usersApi, handleApiError } from "@/lib/api";
import { API_BASE_URL } from "../constants/api";

class UsersService {
  /**
   * Get all users with pagination and filtering
   */
  static async getUsers(
    params?: UserListParams,
  ): Promise<PaginatedResponse<User>> {
    try {
      const response = await usersApi.list(params);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get all users (no pagination)
   */
  static async getAllUsers(): Promise<User[]> {
    try {
      const response = await usersApi.all();
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(): Promise<UserStats> {
    try {
      const response = await usersApi.stats();
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Search users
   */
  static async searchUsers(params: SearchParams): Promise<User[]> {
    try {
      const response = await usersApi.search(params);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(): Promise<User> {
    try {
      const response = await usersApi.profile();
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get all teachers with pagination and filtering
   */
  static async getTeachers(
    params?: TeacherListParams,
  ): Promise<PaginatedResponse<Teacher>> {
    try {
      const response = await usersApi.teachers(params);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get teachers by department
   */
  static async getTeachersByDepartment(department: string): Promise<Teacher[]> {
    try {
      const response = await usersApi.teachersByDepartment(department);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get teacher by employee ID
   */
  static async getTeacherByEmployeeId(employeeId: string): Promise<Teacher> {
    try {
      const response = await usersApi.teacherByEmployeeId(employeeId);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get teacher assignments
   */
  static async getTeacherAssignments(
    teacherId: string,
  ): Promise<TeacherClass[]> {
    try {
      const response = await usersApi.teacherAssignments(teacherId);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Assign teacher to class
   */
  static async assignTeacherToClass(
    teacherId: string,
    classId: string,
    isPrimaryTeacher: boolean = false,
  ): Promise<any> {
    try {
      const response = await usersApi.assignTeacherToClass({
        teacherId,
        classId,
        isPrimaryTeacher,
      });
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Remove teacher from class
   */
  static async removeTeacherFromClass(
    teacherId: string,
    classId: string,
  ): Promise<void> {
    try {
      await usersApi.removeTeacherFromClass({
        teacherId,
        classId,
      });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(role: string): Promise<User[]> {
    try {
      const response = await usersApi.byRole(role);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User> {
    try {
      const response = await usersApi.byEmail(email);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<User> {
    try {
      const response = await usersApi.get(id);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create new user
   */
  static async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      const response = await usersApi.create(userData);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create new teacher
   */
  static async createTeacher(
    teacherData: CreateTeacherRequest,
  ): Promise<Teacher> {
    try {
      const response = await usersApi.createTeacher(teacherData);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update user
   */
  static async updateUser(
    id: string,
    userData: UpdateUserRequest,
  ): Promise<User> {
    try {
      const response = await usersApi.update(id, userData);
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
    teacherData: UpdateTeacherRequest,
  ): Promise<Teacher> {
    try {
      const response = await usersApi.updateTeacher(id, teacherData);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(
    id: string,
    passwordData: UpdatePasswordRequest,
  ): Promise<void> {
    try {
      await usersApi.updatePassword(id, passwordData);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Change user password
   */
  static async changePassword(
    id: string,
    passwordData: ChangePasswordRequest,
  ): Promise<void> {
    try {
      await usersApi.changePassword(id, passwordData);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(id: string): Promise<void> {
    try {
      await usersApi.delete(id);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default UsersService;
