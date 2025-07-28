// Export all services
export { default as AuthService } from "./auth";
export { default as UsersService } from "./users";
export { default as ReportsService } from "./reports";
export { default as ClassesService } from "./classes";
export { default as TeachersService } from "./teachers";
export { default as StudentsService } from "./students";
export { default as SubjectsService } from "./subjects";
export { default as DashboardService } from "./dashboard";
export { default as AttendanceService } from "./attendance";

// Export types from the main types file
export type {
  User,
  Class,
  Subject,
  Teacher,
  Student,
  UserRole,
  UserStats,
  ClassStats,
  ApiResponse,
  SearchParams,
  TeacherClass,
  DashboardStats,
  UserListParams,
  TeacherWithUser,
  ClassListParams,
  ClassWithDetails,
  StudentWithClass,
  AttendanceStatus,
  CreateUserRequest,
  UpdateUserRequest,
  SubjectListParams,
  TeacherListParams,
  StudentListParams,
  TeacherAttendance,
  PaginatedResponse,
  StudentAttendance,
  CreateClassRequest,
  UpdateClassRequest,
  CreateSubjectRequest,
  UpdateSubjectRequest,
  CreateTeacherRequest,
  UpdateTeacherRequest,
  CreateStudentRequest,
  UpdateStudentRequest,
  TeacherDashboardData,
  ChangePasswordRequest,
  UpdatePasswordRequest,
  TeacherClassWithDetails,
  TeacherAttendanceListParams,
  StudentAttendanceListParams,
  AssignTeacherToClassRequest,
  CreateTeacherAttendanceRequest,
  UpdateTeacherAttendanceRequest,
  CreateStudentAttendanceRequest,
  UpdateStudentAttendanceRequest,
  RemoveTeacherFromClassRequest,
} from "@/types";
