import { Student } from "./student";
import { TeacherClass } from "./teacher";

export interface Class {
  id: string;
  name: string;
  grade: string;
  section: string;
  academicYear: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClassWithDetails extends Class {
  students?: Student[];
  teachers?: TeacherClass[];
}

export interface ClassStats {
  studentCount: number;
  teacherCount: number;
}

export interface CreateClassRequest {
  name: string;
  grade: string;
  section: string;
  academicYear: string;
  isActive?: boolean;
}

export interface UpdateClassRequest {
  name?: string;
  grade?: string;
  section?: string;
  academicYear?: string;
  isActive?: boolean;
}

export interface ClassListParams {
  page?: number;
  limit?: number;
  search?: string;
  grade?: string;
  academicYear?: string;
  isActive?: boolean;
}
