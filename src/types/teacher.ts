import { Teacher, User } from "./user";
import { Class } from "./class";

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

export interface AssignTeacherToClassRequest {
  teacherId: string;
  classId: string;
  isPrimaryTeacher?: boolean;
}

export interface RemoveTeacherFromClassRequest {
  teacherId: string;
  classId: string;
}
