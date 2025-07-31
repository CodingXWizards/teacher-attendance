import { Student } from "./student";

export interface Class {
  id: string;
  name: string;
  grade: string;
  section: string;
  academicYear: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClassSummary {
  id: string;
  name: string;
  studentCount: number;
  presentToday: number;
  absentToday: number;
  attendanceRate: number;
  color: string;
}

export interface ClassWithDetails extends Class {
  students?: Student[];
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
