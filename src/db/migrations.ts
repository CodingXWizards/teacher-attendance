import {
  createTable,
  addColumns,
  schemaMigrations,
} from "@nozbe/watermelondb/Schema/migrations";

export default schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        createTable({
          name: "users",
          columns: [
            { name: "email", type: "string" },
            { name: "password_hash", type: "string" },
            { name: "role", type: "string" },
            { name: "first_name", type: "string" },
            { name: "last_name", type: "string" },
            { name: "employee_id", type: "string", isOptional: true },
            { name: "department", type: "string", isOptional: true },
            { name: "phone", type: "string", isOptional: true },
            { name: "address", type: "string", isOptional: true },
            { name: "hire_date", type: "string", isOptional: true },
            { name: "is_active", type: "boolean" },
            { name: "created_at", type: "number" },
            { name: "updated_at", type: "number" },
          ],
        }),
        createTable({
          name: "subjects",
          columns: [
            { name: "name", type: "string" },
            { name: "code", type: "string" },
            { name: "description", type: "string", isOptional: true },
            { name: "is_active", type: "boolean" },
            { name: "created_at", type: "number" },
            { name: "updated_at", type: "number" },
          ],
        }),
        createTable({
          name: "classes",
          columns: [
            { name: "name", type: "string" },
            { name: "grade", type: "string" },
            { name: "section", type: "string" },
            { name: "academic_year", type: "string" },
            { name: "description", type: "string", isOptional: true },
            { name: "is_active", type: "boolean" },
            { name: "created_at", type: "number" },
            { name: "updated_at", type: "number" },
          ],
        }),
        createTable({
          name: "teacher_class",
          columns: [
            { name: "teacher_id", type: "string", isIndexed: true },
            { name: "class_id", type: "string", isIndexed: true },
            { name: "is_primary_teacher", type: "boolean" },
            { name: "is_active", type: "boolean" },
            { name: "created_at", type: "number" },
            { name: "updated_at", type: "number" },
          ],
        }),
        createTable({
          name: "students",
          columns: [
            { name: "student_id", type: "string" },
            { name: "first_name", type: "string" },
            { name: "last_name", type: "string" },
            { name: "email", type: "string" },
            { name: "phone", type: "string" },
            { name: "address", type: "string" },
            { name: "date_of_birth", type: "string" },
            { name: "gender", type: "string" },
            { name: "class_id", type: "string", isIndexed: true },
            { name: "is_active", type: "boolean" },
            { name: "created_at", type: "number" },
            { name: "updated_at", type: "number" },
          ],
        }),
        createTable({
          name: "teacher_attendance",
          columns: [
            { name: "teacher_id", type: "string", isIndexed: true },
            { name: "date", type: "string" },
            { name: "check_in", type: "string", isOptional: true },
            { name: "check_out", type: "string", isOptional: true },
            { name: "status", type: "string" },
            { name: "notes", type: "string", isOptional: true },
            { name: "created_at", type: "number" },
            { name: "updated_at", type: "number" },
          ],
        }),
        createTable({
          name: "student_attendance",
          columns: [
            { name: "student_id", type: "string", isIndexed: true },
            { name: "class_id", type: "string", isIndexed: true },
            { name: "date", type: "string" },
            { name: "status", type: "string" },
            { name: "notes", type: "string", isOptional: true },
            { name: "marked_by", type: "string", isIndexed: true },
            { name: "created_at", type: "number" },
            { name: "updated_at", type: "number" },
          ],
        }),
        createTable({
          name: "sync_status",
          columns: [
            { name: "table_name", type: "string" },
            { name: "last_sync", type: "number" },
            { name: "created_at", type: "number" },
            { name: "updated_at", type: "number" },
          ],
        }),
      ],
    },
    {
      toVersion: 3,
      steps: [
        addColumns({
          table: "classes",
          columns: [{ name: "class_id", type: "string" }],
        }),
      ],
    },
  ],
});
