import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";

import schema from "./schema";
import migrations from "./migrations";

import {
  User,
  Subject,
  Class,
  TeacherClass,
  Student,
  TeacherAttendance,
  StudentAttendance,
  SyncStatus,
} from "./models";

console.log("🔧 Starting WatermelonDB setup...");
console.log("📋 Schema version:", schema.version);
console.log("📋 Number of tables:", schema.tables.length);

// First, create the adapter
const adapter = new SQLiteAdapter({
  schema,
  migrations,
  dbName: "teacherAttendanceDB",
  onSetUpError: error => {
    console.error("❌ Failed to set up the database:", error);
  },
});

console.log(
  "🔧 WatermelonDB Adapter created with schema version:",
  schema.version,
);

const database = new Database({
  adapter,
  modelClasses: [
    User,
    Subject,
    Class,
    TeacherClass,
    Student,
    TeacherAttendance,
    StudentAttendance,
    SyncStatus,
  ],
});

console.log("✅ WatermelonDB Database instance created successfully");

export default database;
