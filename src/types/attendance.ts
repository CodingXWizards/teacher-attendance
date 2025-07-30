import { User } from "./user";
import { Teacher } from "./teacher";
import { Student } from "./student";
import { Subject } from "./subject";

export enum AttendanceStatus {
  PRESENT = "present",
  ABSENT = "absent",
}

export interface TeacherAttendance {
  id: string;
  teacherId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  teacher?: Teacher;
}

export interface StudentAttendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
  markedBy: string;
  createdAt: string;
  updatedAt: string;
  student?: Student;
  markedByUser?: User;
}

export interface CreateTeacherAttendanceRequest {
  teacherId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface UpdateTeacherAttendanceRequest {
  checkIn?: string;
  checkOut?: string;
  status?: AttendanceStatus;
  notes?: string;
}

export interface CreateStudentAttendanceRequest {
  studentId: string;
  classId: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
  markedBy: string;
}

export interface UpdateStudentAttendanceRequest {
  status?: AttendanceStatus;
  notes?: string;
}

export interface TeacherAttendanceListParams {
  page?: number;
  limit?: number;
  teacherId?: string;
  date?: string;
}

export interface StudentAttendanceListParams {
  page?: number;
  limit?: number;
  studentId?: string;
  classId?: string;
  date?: string;
}
