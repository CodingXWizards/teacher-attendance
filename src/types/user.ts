export enum UserRole {
  TEACHER = "teacher",
  ADMIN = "admin",
  PRINCIPAL = "principal",
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}
