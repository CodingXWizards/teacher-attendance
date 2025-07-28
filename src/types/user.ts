export enum UserRole {
  TEACHER = "teacher",
  ADMIN = "admin",
  PRINCIPAL = "principal",
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalUsers: number;
  adminCount: number;
  principalCount: number;
  teacherCount: number;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePasswordRequest {
  newPassword: string;
}

export interface SearchParams {
  q: string;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}
