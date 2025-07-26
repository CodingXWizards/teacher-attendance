// Export all services
export { default as AuthService } from './auth';
export { default as TeachersService } from './teachers';
export { default as AttendanceService } from './attendance';
export { default as ReportsService } from './reports';

export type {
  Teacher,
  CreateTeacherRequest,
  UpdateTeacherRequest,
  TeachersListParams
} from './teachers';

export type {
  TeacherAttendance,
  StudentAttendance,
  CreateTeacherAttendanceRequest,
  UpdateTeacherAttendanceRequest,
  CreateStudentAttendanceRequest,
  UpdateStudentAttendanceRequest,
  AttendanceListParams,
  AttendanceSummary
} from './attendance';

export type {
  AttendanceSummary as ReportAttendanceSummary,
  TeacherAttendanceReport,
  DateRangeReport,
  MonthlyReport,
  ReportFilters
} from './reports'; 