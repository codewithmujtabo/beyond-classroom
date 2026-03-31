/**
 * Mock user for development.
 * When you're ready for real auth, replace this file with
 * a real Supabase/API call — nothing else in the app changes.
 */

export type UserRole =
  | "student"
  | "parent"
  | "teacher";
export type GradeLevel =
  | "SD"
  | "SMP"
  | "SMA";

export interface AppUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  school: string;
  city: string;
  level?: GradeLevel; // only relevant for students
  avatarUrl?: string;
  // teacher-specific
  subject?: string;
  // parent-specific
  childName?: string;
  childSchool?: string;
  childLevel?: GradeLevel;
}

export const MOCK_USER: AppUser = {
  id: "dev-user-001",
  name: "Budi Santoso",
  phone: "08123456789",
  email: "budi@example.com",
  role: "student",
  school: "SMP Negeri 1 Jakarta",
  city: "Jakarta",
  level: "SMP",
};

/**
 * Set DEV_BYPASS_AUTH to true  → app skips login, uses MOCK_USER
 * Set DEV_BYPASS_AUTH to false → app goes through real login flow
 */
export const DEV_BYPASS_AUTH = false;
