import { int, sqliteTable, text, index } from "drizzle-orm/sqlite-core";

// Enums as text fields with constraints
export const userRoleEnum = ["admin", "teacher"] as const;
export const genderEnum = ["male", "female", "other"] as const;
export const attendanceStatusEnum = ["present", "absent"] as const;

// Users table (merged with teachers for simplicity)
export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(), // UUID from backend
    email: text("email").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    role: text("role", { enum: userRoleEnum }).notNull(),
    // Teacher-specific fields
    employeeId: text("employee_id"),
    department: text("department"),
    phone: text("phone"),
    address: text("address"),
    hireDate: text("hire_date"),
    isActive: int("is_active", { mode: "boolean" }).default(true).notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    // Sync fields for offline functionality
    lastSyncedAt: text("last_synced_at"),
    isDirty: int("is_dirty", { mode: "boolean" }).default(false).notNull(),
  },
  table => ({
    emailIdx: index("email_idx").on(table.email),
    roleIdx: index("role_idx").on(table.role),
    departmentIdx: index("department_idx").on(table.department),
  }),
);

// Subjects table
export const subjects = sqliteTable(
  "subjects",
  {
    id: text("id").primaryKey(), // UUID from backend
    name: text("name").notNull(),
    code: text("code").notNull(),
    description: text("description"),
    isActive: int("is_active", { mode: "boolean" }).default(true).notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    // Sync fields
    lastSyncedAt: text("last_synced_at"),
    isDirty: int("is_dirty", { mode: "boolean" }).default(false).notNull(),
  },
  table => ({
    codeIdx: index("code_idx").on(table.code),
    nameIdx: index("subject_name_idx").on(table.name),
  }),
);

// Classes table
export const classes = sqliteTable(
  "classes",
  {
    id: text("id").primaryKey(), // UUID from backend
    name: text("name").notNull(),
    grade: text("grade").notNull(),
    section: text("section").notNull(),
    academicYear: text("academic_year").notNull(),
    isActive: int("is_active", { mode: "boolean" }).default(true).notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    // Sync fields
    lastSyncedAt: text("last_synced_at"),
    isDirty: int("is_dirty", { mode: "boolean" }).default(false).notNull(),
  },
  table => ({
    gradeIdx: index("grade_idx").on(table.grade),
    academicYearIdx: index("academic_year_idx").on(table.academicYear),
    nameIdx: index("class_name_idx").on(table.name),
  }),
);

// Teacher Class Assignment table (Many-to-Many relationship)
export const teacherClass = sqliteTable(
  "teacher_class",
  {
    id: text("id").primaryKey(), // UUID from backend
    teacherId: text("teacher_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    classId: text("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    isPrimaryTeacher: int("is_primary_teacher", { mode: "boolean" })
      .default(false)
      .notNull(),
    isActive: int("is_active", { mode: "boolean" }).default(true).notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    // Sync fields
    lastSyncedAt: text("last_synced_at"),
    isDirty: int("is_dirty", { mode: "boolean" }).default(false).notNull(),
  },
  table => ({
    teacherClassIdx: index("teacher_class_idx").on(
      table.teacherId,
      table.classId,
    ),
    teacherIdx: index("teacher_idx").on(table.teacherId),
    classIdx: index("class_idx").on(table.classId),
  }),
);

// Students table
export const students = sqliteTable(
  "students",
  {
    id: text("id").primaryKey(), // UUID from backend
    studentId: text("student_id").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    address: text("address").notNull(),
    dateOfBirth: text("date_of_birth").notNull(),
    gender: text("gender", { enum: genderEnum }).notNull(),
    classId: text("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    isActive: int("is_active", { mode: "boolean" }).default(true).notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    // Sync fields
    lastSyncedAt: text("last_synced_at"),
    isDirty: int("is_dirty", { mode: "boolean" }).default(false).notNull(),
  },
  table => ({
    studentIdIdx: index("student_id_idx").on(table.studentId),
    classIdx: index("student_class_idx").on(table.classId),
    nameIdx: index("student_name_idx").on(table.firstName, table.lastName),
    emailIdx: index("student_email_idx").on(table.email),
  }),
);

// Teacher attendance table
export const teacherAttendance = sqliteTable(
  "teacher_attendance",
  {
    id: text("id").primaryKey(), // UUID from backend
    teacherId: text("teacher_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    checkIn: text("check_in"),
    checkOut: text("check_out"),
    status: text("status", { enum: attendanceStatusEnum }).notNull(),
    notes: text("notes"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    // Sync fields
    lastSyncedAt: text("last_synced_at"),
    isDirty: int("is_dirty", { mode: "boolean" }).default(false).notNull(),
  },
  table => ({
    teacherDateIdx: index("teacher_date_idx").on(table.teacherId, table.date),
    teacherIdx: index("teacher_attendance_teacher_idx").on(table.teacherId),
    dateIdx: index("teacher_attendance_date_idx").on(table.date),
  }),
);

// Student attendance table
export const studentAttendance = sqliteTable(
  "student_attendance",
  {
    id: text("id").primaryKey(), // UUID from backend
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    classId: text("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    status: text("status", { enum: attendanceStatusEnum }).notNull(),
    notes: text("notes"),
    markedBy: text("marked_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    // Sync fields
    lastSyncedAt: text("last_synced_at"),
    isDirty: int("is_dirty", { mode: "boolean" }).default(false).notNull(),
  },
  table => ({
    studentDateIdx: index("student_date_idx").on(table.studentId, table.date),
    classDateIdx: index("class_date_idx").on(table.classId, table.date),
    studentIdx: index("student_attendance_student_idx").on(table.studentId),
    classIdx: index("student_attendance_class_idx").on(table.classId),
    dateIdx: index("student_attendance_date_idx").on(table.date),
  }),
);

// Sync status table for tracking sync state
export const syncStatus = sqliteTable(
  "sync_status",
  {
    id: int("id").primaryKey({ autoIncrement: true }),
    tableName: text("table_name").notNull(),
    lastSyncedAt: text("last_synced_at"),
    lastSyncError: text("last_sync_error"),
    createdAt: text("created_at").notNull().default(new Date().toISOString()),
    updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
  },
  table => ({
    tableNameIdx: index("table_name_idx").on(table.tableName),
  }),
);

// Export types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;
export type Class = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;
export type TeacherClass = typeof teacherClass.$inferSelect;
export type NewTeacherClass = typeof teacherClass.$inferInsert;
export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
export type TeacherAttendance = typeof teacherAttendance.$inferSelect;
export type NewTeacherAttendance = typeof teacherAttendance.$inferInsert;
export type StudentAttendance = typeof studentAttendance.$inferSelect;
export type NewStudentAttendance = typeof studentAttendance.$inferInsert;
export type SyncStatus = typeof syncStatus.$inferSelect;
export type NewSyncStatus = typeof syncStatus.$inferInsert;
