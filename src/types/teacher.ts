import { User } from "./user";
import { Class } from "./class";

export interface Teacher {
  id: string;
  userId: string;
  employeeId: string;
  department: string;
  phone: string;
  address: string;
  hireDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface TeacherWithUser extends Teacher {
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
  userId: string;
  employeeId: string;
  department: string;
  phone: string;
  address: string;
  hireDate: string;
  isActive?: boolean;
}

export interface UpdateTeacherRequest {
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
