import { Q } from "@nozbe/watermelondb";

import {
  User,
  Class,
  Student,
  Subject,
  SyncStatus,
  TeacherClass,
  TeacherAttendance,
  StudentAttendance,
} from "@/db/models";
import database from "@/db";
import {
  Class as ClassType,
  Student as StudentType,
  TeacherAttendance as TeacherAttendanceType,
  StudentAttendance as StudentAttendanceType,
} from "@/types";

// Utility function to convert snake_case to camelCase
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Utility function to convert object keys from snake_case to camelCase
function convertKeysToCamelCase(obj: any): any {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamelCase);
  }

  const converted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = snakeToCamel(key);
    converted[camelKey] = convertKeysToCamelCase(value);
  }
  return converted;
}

// Helper function to extract raw data from WatermelonDB models and convert to camelCase
function extractRawData<T>(model: T): any {
  const rawData = (model as any)._raw;
  return convertKeysToCamelCase(rawData);
}

function extractRawDataArray<T>(models: T[]): any[] {
  return models.map(model => extractRawData(model));
}

export class DatabaseService {
  // User operations
  static async createUser(userData: {
    email: string;
    passwordHash: string;
    role: string;
    firstName: string;
    lastName: string;
    employeeId?: string;
    department?: string;
    phone?: string;
    address?: string;
    hireDate?: string;
    isActive: boolean;
  }): Promise<User> {
    return await database.write(async () => {
      return await database.get<User>("users").create(user => {
        user.email = userData.email;
        user.passwordHash = userData.passwordHash;
        user.role = userData.role;
        user.firstName = userData.firstName;
        user.lastName = userData.lastName;
        user.employeeId = userData.employeeId || null;
        user.department = userData.department || null;
        user.phone = userData.phone || null;
        user.address = userData.address || null;
        user.hireDate = userData.hireDate || null;
        user.isActive = userData.isActive;
      });
    });
  }

  static async getUserByEmail(email: string): Promise<User[]> {
    return await database
      .get<User>("users")
      .query(Q.where("email", email))
      .fetch();
  }

  static async getCurrentUser(userId: string): Promise<User | null> {
    try {
      return await database.get<User>("users").find(userId);
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  static async updateUser(userId: string, userData: any): Promise<void> {
    const user = await database.get<User>("users").find(userId);
    if (user) {
      await database.write(async () => {
        await user.update(updatedUser => {
          if (userData.email) updatedUser.email = userData.email;
          if (userData.role) updatedUser.role = userData.role;
          if (userData.isActive !== undefined)
            updatedUser.isActive = userData.isActive;
        });
      });
    }
  }

  // Teacher operations (now using User model)
  static async getTeacherById(id: string): Promise<User | null> {
    try {
      const user = await database.get<User>("users").find(id);
      return user && user.role === "teacher" ? user : null;
    } catch (error) {
      console.error("Error getting teacher by ID:", error);
      return null;
    }
  }

  static async getTeacherByUserId(userId: string): Promise<User[]> {
    return await database
      .get<User>("users")
      .query(Q.where("id", userId), Q.where("role", "teacher"))
      .fetch();
  }

  static async getAllTeachers(): Promise<User[]> {
    const teachers = await database
      .get<User>("users")
      .query(Q.where("role", "teacher"), Q.where("is_active", true))
      .fetch();
    return extractRawDataArray(teachers);
  }

  static async getTeacherAssignment(
    teacherId: string,
  ): Promise<TeacherClass[]> {
    return await database
      .get<TeacherClass>("teacher_class")
      .query(Q.where("teacher_id", teacherId), Q.where("is_active", true))
      .fetch();
  }

  static async syncTeacherAttendance(
    teacherAttendanceData: TeacherAttendanceType[],
  ): Promise<void> {
    for (const attendance of teacherAttendanceData) {
      await this.markTeacherAttendance({
        teacherId: attendance.teacherId,
        date: attendance.date,
        checkIn: attendance.checkIn || "",
        status: attendance.status,
      });
    }
  }

  // Subject operations
  static async createSubject(subjectData: {
    name: string;
    code: string;
    description?: string;
    isActive: boolean;
  }): Promise<Subject> {
    return await database.write(async () => {
      return await database.get<Subject>("subjects").create(subject => {
        subject.name = subjectData.name;
        subject.code = subjectData.code;
        subject.description = subjectData.description || null;
        subject.isActive = subjectData.isActive;
      });
    });
  }

  static async getAllSubjects(): Promise<Subject[]> {
    return await database
      .get<Subject>("subjects")
      .query(Q.where("is_active", true))
      .fetch();
  }

  // Class operations
  static async createClass(classData: {
    classId: string;
    name: string;
    grade: string;
    section: string;
    academicYear: string;
    description: string;
    isActive: boolean;
  }): Promise<Class> {
    return await database.write(async () => {
      return await database.get<Class>("classes").create(cls => {
        cls.classId = classData.classId;
        cls.name = classData.name;
        cls.grade = classData.grade;
        cls.section = classData.section;
        cls.academicYear = classData.academicYear;
        cls.description = classData.description || null;
        cls.isActive = classData.isActive;
      });
    });
  }

  static async createClasses(classData: ClassType[]) {
    for (const cls of classData) {
      await this.createClass({
        classId: cls.id,
        name: cls.name,
        grade: cls.grade,
        section: cls.section,
        academicYear: cls.academicYear,
        description: cls.description,
        isActive: cls.isActive,
      });
    }
  }

  static async getTeacherClasses(teacherId: string): Promise<Class[]> {
    const classes = await database
      .get<Class>("classes")
      .query(Q.where("is_active", true))
      .fetch();
    return extractRawDataArray(classes);
  }

  static async getAllClasses(): Promise<Class[]> {
    const classes = await database
      .get<Class>("classes")
      .query(Q.where("is_active", true))
      .fetch();
    return extractRawDataArray(classes);
  }

  static async getClassById(id: string): Promise<Class | null> {
    try {
      const [classData] = await database
        .get<Class>("classes")
        .query(Q.where("class_id", id), Q.where("is_active", true))
        .fetch();

      return extractRawData(classData) || null;
    } catch (error) {
      console.error("Error getting class by ID:", error);
      return null;
    }
  }

  static async getClassStats(classId: string): Promise<{
    totalStudents: number;
    presentToday: number;
    absentToday: number;
  }> {
    try {
      const students = await this.getClassStudents(classId);

      // For now, return basic stats
      return {
        totalStudents: students.length,
        presentToday: 0, // Would need to implement attendance checking
        absentToday: 0, // Would need to implement attendance checking
      };
    } catch (error) {
      console.error("Error getting class stats:", error);
      return {
        totalStudents: 0,
        presentToday: 0,
        absentToday: 0,
      };
    }
  }

  // Student operations
  static async createStudent(studentData: {
    studentId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    gender: string;
    classId: string;
    isActive: boolean;
  }): Promise<Student> {
    return await database.write(async () => {
      return await database.get<Student>("students").create(student => {
        student.studentId = studentData.studentId;
        student.firstName = studentData.firstName;
        student.lastName = studentData.lastName;
        student.email = studentData.email;
        student.phone = studentData.phone;
        student.address = studentData.address;
        student.dateOfBirth = studentData.dateOfBirth;
        student.gender = studentData.gender;
        student.classId = studentData.classId;
        student.isActive = studentData.isActive;
      });
    });
  }

  static async createStudents(studentData: StudentType[]) {
    for (const student of studentData) {
      await this.createStudent({
        studentId: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email || "",
        phone: student.phone || "",
        address: student.address || "",
        dateOfBirth: student.dateOfBirth || "",
        gender: student.gender || "",
        classId: student.classId,
        isActive: student.isActive,
      });
    }
  }

  static async getClassStudents(classId: string): Promise<Student[]> {
    const students = await database
      .get<Student>("students")
      .query(Q.where("class_id", classId), Q.where("is_active", true))
      .fetch();
    return extractRawDataArray(students);
  }

  static async getAllStudents(): Promise<Student[]> {
    const students = await database
      .get<Student>("students")
      .query(Q.where("is_active", true))
      .fetch();
    return extractRawDataArray(students);
  }

  static async getStudentById(id: string): Promise<Student | null> {
    try {
      return await database.get<Student>("students").find(id);
    } catch (error) {
      console.error("Error getting student by ID:", error);
      return null;
    }
  }

  static async getStudentByStudentId(
    studentId: string,
  ): Promise<Student | null> {
    try {
      const [student] = await database
        .get<Student>("students")
        .query(Q.where("student_id", studentId))
        .fetch();
      return student || null;
    } catch (error) {
      console.error("Error getting student by ID:", error);
      return null;
    }
  }

  // TeacherClass operations
  static async addTeacherToClass(
    teacherId: string,
    classId: string,
    isPrimaryTeacher: boolean = false,
  ): Promise<TeacherClass> {
    return await database.write(async () => {
      return await database
        .get<TeacherClass>("teacher_class")
        .create(teacherClass => {
          teacherClass.teacherId = teacherId;
          teacherClass.classId = classId;
          teacherClass.isPrimaryTeacher = isPrimaryTeacher;
          teacherClass.isActive = true;
        });
    });
  }

  // Teacher Attendance operations
  static async markTeacherAttendance(attendanceData: {
    teacherId: string;
    date: string;
    checkIn: string;
    status: string;
  }): Promise<TeacherAttendance> {
    return await database.write(async () => {
      return await database
        .get<TeacherAttendance>("teacher_attendance")
        .create(attendance => {
          attendance.teacherId = attendanceData.teacherId;
          attendance.date = attendanceData.date;
          attendance.checkIn = attendanceData.checkIn || null;
          attendance.status = attendanceData.status;
        });
    });
  }

  static async getTeacherAttendance(
    teacherId: string,
    date: string,
  ): Promise<TeacherAttendance[]> {
    return await database
      .get<TeacherAttendance>("teacher_attendance")
      .query(Q.where("teacher_id", teacherId), Q.where("date", date))
      .fetch();
  }

  static async updateTeacherAttendance(
    id: string,
    updateData: {
      checkIn?: string;
      checkOut?: string;
      status?: string;
    },
  ): Promise<void> {
    const attendance = await database
      .get<TeacherAttendance>("teacher_attendance")
      .find(id);
    if (attendance) {
      await database.write(async () => {
        await attendance.update(updatedAttendance => {
          if (updateData.checkIn !== undefined)
            updatedAttendance.checkIn = updateData.checkIn;
          if (updateData.status !== undefined)
            updatedAttendance.status = updateData.status;
        });
      });
    }
  }

  // Student Attendance operations
  static async markStudentAttendance(attendanceData: {
    classId: string;
    studentId: string;
    date: string;
    status: string;
    notes?: string;
    markedBy?: string;
  }): Promise<StudentAttendance> {
    return await database.write(async () => {
      return await database
        .get<StudentAttendance>("student_attendance")
        .create(attendance => {
          attendance.classId = attendanceData.classId;
          attendance.studentId = attendanceData.studentId;
          attendance.date = attendanceData.date;
          attendance.status = attendanceData.status;
          attendance.notes = attendanceData.notes || null;
          attendance.markedBy = attendanceData.markedBy || "";
        });
    });
  }

  static async updateStudentAttendance(
    id: string,
    updateData: {
      status?: string;
      notes?: string;
      markedBy?: string;
    },
  ): Promise<void> {
    const attendance = await database
      .get<StudentAttendance>("student_attendance")
      .find(id);
    if (attendance) {
      await database.write(async () => {
        await attendance.update(updatedAttendance => {
          if (updateData.status !== undefined)
            updatedAttendance.status = updateData.status;
          if (updateData.notes !== undefined)
            updatedAttendance.notes = updateData.notes;
          if (updateData.markedBy !== undefined)
            updatedAttendance.markedBy = updateData.markedBy;
        });
      });
    }
  }

  static async getStudentAttendanceByClassAndDate(
    classId: string,
    date: string,
  ): Promise<StudentAttendance[]> {
    return await database
      .get<StudentAttendance>("student_attendance")
      .query(Q.where("class_id", classId), Q.where("date", date))
      .fetch();
  }

  static async syncStudentAttendance(
    studentAttendanceData: StudentAttendanceType[],
  ): Promise<void> {
    for (const attendance of studentAttendanceData) {
      await this.markStudentAttendance(attendance);
    }
  }

  static async getClassAttendance(
    classId: string,
    date: string,
  ): Promise<StudentAttendance[]> {
    const studentAttendance = await database
      .get<StudentAttendance>("student_attendance")
      .query(Q.where("class_id", classId), Q.where("date", date))
      .fetch();
    return extractRawDataArray(studentAttendance);
  }

  static async getClassAttendanceModels(
    classId: string,
    date: string,
  ): Promise<StudentAttendance[]> {
    return await database
      .get<StudentAttendance>("student_attendance")
      .query(Q.where("class_id", classId), Q.where("date", date))
      .fetch();
  }

  static async getTodayAttendanceForClass(
    classId: string,
  ): Promise<StudentAttendance[]> {
    const today = new Date().toISOString().split("T")[0];
    return await this.getClassAttendance(classId, today);
  }

  static async getTodayAttendanceForClassModels(
    classId: string,
  ): Promise<StudentAttendance[]> {
    const today = new Date().toISOString().split("T")[0];
    return await this.getClassAttendanceModels(classId, today);
  }

  static async getStudentAttendanceByDateRange(
    classId: string,
    startDate: string,
    endDate: string,
  ): Promise<StudentAttendance[]> {
    const studentAttendance = await database
      .get<StudentAttendance>("student_attendance")
      .query(
        Q.where("class_id", classId),
        Q.where("date", Q.gte(startDate)),
        Q.where("date", Q.lte(endDate)),
      )
      .fetch();
    return extractRawDataArray(studentAttendance);
  }

  static async getStudentAttendance(
    studentId: string,
    params?: {
      startDate?: string;
      endDate?: string;
      classId?: string;
    },
  ): Promise<StudentAttendance[]> {
    return await database
      .get<StudentAttendance>("student_attendance")
      .query(Q.where("student_id", studentId))
      .fetch();
  }

  static async bulkCreateOrUpdateStudentAttendance(
    attendanceData: {
      studentId: string;
      classId: string;
      date: string;
      status: string;
      notes?: string;
      markedBy?: string;
    }[],
  ): Promise<void> {
    const today = new Date().toISOString().split("T")[0];

    // Get existing attendance records for today as model instances
    const existingAttendance = await this.getClassAttendanceModels(
      attendanceData[0]?.classId || "",
      today,
    );

    await database.write(async () => {
      for (const data of attendanceData) {
        // Check if attendance already exists for this student today
        const existingRecord = existingAttendance.find(
          record => record.studentId === data.studentId,
        );

        if (existingRecord) {
          // Update existing record directly
          await existingRecord.update(updatedAttendance => {
            updatedAttendance.status = data.status;
            updatedAttendance.notes = data.notes || null;
            updatedAttendance.markedBy = data.markedBy || "";
          });
        } else {
          // Create new record
          await database
            .get<StudentAttendance>("student_attendance")
            .create(attendance => {
              attendance.classId = data.classId;
              attendance.studentId = data.studentId;
              attendance.date = data.date;
              attendance.status = data.status;
              attendance.notes = data.notes || null;
              attendance.markedBy = data.markedBy || "";
            });
        }
      }
    });
  }

  // Sync operations
  static async updateSyncStatus(
    tableName: string,
    lastSync: number,
  ): Promise<SyncStatus> {
    const existing = await database
      .get<SyncStatus>("sync_status")
      .query(Q.where("table_name", tableName))
      .fetch();

    return await database.write(async () => {
      if (existing.length > 0) {
        return await existing[0].update(sync => {
          sync.lastSync = lastSync;
        });
      } else {
        return await database.get<SyncStatus>("sync_status").create(sync => {
          sync.tableName = tableName;
          sync.lastSync = lastSync;
        });
      }
    });
  }

  static async getSyncStatus(tableName: string): Promise<SyncStatus | null> {
    const status = await database
      .get<SyncStatus>("sync_status")
      .query(Q.where("table_name", tableName))
      .fetch();

    return status.length > 0 ? status[0] : null;
  }

  static async getTeacherStats(teacherId: string): Promise<{
    totalClasses: number;
    totalStudents: number;
    attendanceThisMonth: number;
  }> {
    try {
      const classes = await this.getTeacherClasses(teacherId);
      let totalStudents = 0;

      for (const cls of classes) {
        const students = await this.getClassStudents(cls.id);
        totalStudents += students.length;
      }

      return {
        totalClasses: classes.length,
        totalStudents,
        attendanceThisMonth: 0, // Would need to implement attendance calculation
      };
    } catch (error) {
      console.error("Error getting teacher stats:", error);
      return {
        totalClasses: 0,
        totalStudents: 0,
        attendanceThisMonth: 0,
      };
    }
  }

  static async getUnsyncedRecordsCount(): Promise<{
    teacherAttendance: number;
    studentAttendance: number;
  }> {
    // This would need to be implemented based on your sync tracking
    return {
      teacherAttendance: 0,
      studentAttendance: 0,
    };
  }

  // Clear all data (for data sync)
  static async clearAllData(): Promise<void> {
    return await database.write(async () => {
      await database.get<User>("users").query().destroyAllPermanently();
      await database.get<Subject>("subjects").query().destroyAllPermanently();
      await database.get<Class>("classes").query().destroyAllPermanently();
      await database
        .get<TeacherClass>("teacher_class")
        .query()
        .destroyAllPermanently();
      await database.get<Student>("students").query().destroyAllPermanently();
      await database
        .get<TeacherAttendance>("teacher_attendance")
        .query()
        .destroyAllPermanently();
      await database
        .get<StudentAttendance>("student_attendance")
        .query()
        .destroyAllPermanently();
      await database
        .get<SyncStatus>("sync_status")
        .query()
        .destroyAllPermanently();
    });
  }
}
