import { Class } from "./class";

export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  classId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  class?: Class;
}

export interface StudentWithClass extends Student {
  class: Class;
}

export interface CreateStudentRequest {
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  classId: string;
  isActive?: boolean;
}

export interface UpdateStudentRequest {
  studentId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  classId?: string;
  isActive?: boolean;
}

export interface StudentListParams {
  page?: number;
  limit?: number;
  search?: string;
  classId?: string;
  gender?: string;
  isActive?: boolean;
}
