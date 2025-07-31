import { Model } from "@nozbe/watermelondb";
import {
  field,
  date,
  readonly,
  relation,
} from "@nozbe/watermelondb/decorators";
import { Relation } from "@nozbe/watermelondb";
import Class from "./Class";
import User from "./User";

export default class TeacherClass extends Model {
  static table = "teacher_class";

  @field("teacher_id") teacherId!: string;
  @field("class_id") classId!: string;
  @field("is_primary_teacher") isPrimaryTeacher!: boolean;
  @field("is_active") isActive!: boolean;
  @readonly @date("created_at") createdAt!: number;
  @readonly @date("updated_at") updatedAt!: number;

  @relation("users", "teacher_id") teacher!: Relation<User>;
  @relation("classes", "class_id") class!: Relation<Class>;
}
