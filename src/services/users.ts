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
} from "@/types";
import { usersApi, handleApiError } from "@/lib/api";

class UsersService {
  /**
   * Get all users with pagination and filtering
   */
  static async getUsers(
    params?: UserListParams
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
   * Get users with teacher profiles
   */
  static async getTeachers(): Promise<User[]> {
    try {
      const response = await usersApi.teachers();
      return response;
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
   * Update user
   */
  static async updateUser(
    id: string,
    userData: UpdateUserRequest
  ): Promise<User> {
    try {
      const response = await usersApi.update(id, userData);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update user password (admin only)
   */
  static async updatePassword(
    id: string,
    passwordData: UpdatePasswordRequest
  ): Promise<void> {
    try {
      await usersApi.updatePassword(id, passwordData);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Change user password (with current password verification)
   */
  static async changePassword(
    id: string,
    passwordData: ChangePasswordRequest
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
