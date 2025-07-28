import { TeacherClass } from "./teacher";
import { ClassWithDetails } from "./class";

export interface DashboardStats {
  totalClasses: number;
  totalStudents: number;
  totalTeachers: number;
  totalSubjects: number;
  todaySessions: number;
}

export interface TeacherDashboardData {
  classes: ClassWithDetails[];
  assignments: TeacherClass[];
  stats: DashboardStats;
}
