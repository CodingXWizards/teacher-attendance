export enum UserRole {
  TEACHER = "teacher",
  ADMIN = "admin",
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  // Teacher-specific fields (nullable for non-teachers)
  employeeId?: string;
  department?: string;
  phone?: string;
  address?: string;
  hireDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalUsers: number;
  adminCount: number;
  teacherCount: number;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  // Teacher-specific fields (required when role is teacher)
  employeeId?: string;
  department?: string;
  phone?: string;
  address?: string;
  hireDate?: string;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  // Teacher-specific fields
  employeeId?: string;
  department?: string;
  phone?: string;
  address?: string;
  hireDate?: string;
  isActive?: boolean;
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
  department?: string;
  isActive?: boolean;
}

// Teacher-specific interfaces for backward compatibility
export interface Teacher extends User {
  employeeId: string;
  department: string;
  phone: string;
  address: string;
  hireDate: string;
}

export interface CreateTeacherRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  department: string;
  phone: string;
  address: string;
  hireDate: string;
  isActive?: boolean;
}

export interface UpdateTeacherRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  employeeId?: string;
  department?: string;
  phone?: string;
  address?: string;
  hireDate?: string;
  isActive?: boolean;
}

export interface TeacherListParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  isActive?: boolean;
}
