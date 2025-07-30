import { User } from "./user";
import { Class } from "./class";

// Teacher is now a User with teacher-specific fields
export interface Teacher extends User {
  employeeId: string;
  department: string;
  phone: string;
  address: string;
  hireDate: string;
}

export interface TeacherWithUser extends Teacher {
  // For backward compatibility, but Teacher now includes all user fields
  user: User;
}

export interface TeacherClass {
  id: string;
  teacherId: string;
  classId: string;
  isPrimaryTeacher: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  teacher?: Teacher;
  class?: Class;
}

export interface TeacherClassWithDetails extends TeacherClass {
  teacher: Teacher;
  class: Class;
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

export interface AssignTeacherToClassRequest {
  teacherId: string;
  classId: string;
  isPrimaryTeacher?: boolean;
}

export interface RemoveTeacherFromClassRequest {
  teacherId: string;
  classId: string;
}
