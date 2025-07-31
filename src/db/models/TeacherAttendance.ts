import { Model } from "@nozbe/watermelondb";
import {
  field,
  date,
  readonly,
  relation,
} from "@nozbe/watermelondb/decorators";
import { Relation } from "@nozbe/watermelondb";
import User from "./User";

export default class TeacherAttendance extends Model {
  static table = "teacher_attendance";

  @field("teacher_id") teacherId!: string;
  @field("date") date!: string;
  @field("check_in") checkIn!: string | null;
  @field("status") status!: string;
  @field("notes") notes!: string | null;
  @readonly @date("created_at") createdAt!: number;
  @readonly @date("updated_at") updatedAt!: number;

  @relation("users", "teacher_id") teacher!: Relation<User>;
}
