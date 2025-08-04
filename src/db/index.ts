import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";

import schema from "./schema";
import migrations from "./migrations";

import {
  User,
  Class,
  TeacherClass,
  Student,
  TeacherAttendance,
  StudentAttendance,
  SyncStatus,
} from "./models";

// First, create the adapter
const adapter = new SQLiteAdapter({
  schema,
  migrations,
  dbName: "teacherAttendanceDB",
  onSetUpError: error => {
    console.error("❌ Failed to set up the database:", error);
  },
});

const database = new Database({
  adapter,
  modelClasses: [
    User,
    Class,
    TeacherClass,
    Student,
    TeacherAttendance,
    StudentAttendance,
    SyncStatus,
  ],
});

// Development helper to clear database (only use in development!)
export const clearDatabase = async () => {
  if (__DEV__) {
    await database.write(async () => {
      await database.unsafeResetDatabase();
    });
  } else {
    console.warn("⚠️ clearDatabase should only be used in development!");
  }
};

export default database;
