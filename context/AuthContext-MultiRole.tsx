/**
 * AuthContext — handles user authentication via custom Express backend
 * Supports: Student, Parent, Teacher roles
 * Manages login, signup, and logout
 */

import * as authService from "@/services/auth.service";
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

export type UserRole =
  | "student"
  | "parent"
  | "teacher";

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  city?: string;
  role: UserRole;

  // Student specific
  school?: string;
  grade?: string;
  age?: number;
  parentEmail?: string;

  // Parent specific
  childName?: string;
  childAge?: number;
  childSchool?: string;
  relationship?: string;
  occupation?: string;

  // Teacher specific
  subject?: string;
  qualification?: string;
  experienceYears?: number;
  bio?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signup: (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    roleData:
      | StudentData
      | ParentData
      | TeacherData,
  ) => Promise<void>;
  login: (
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export interface StudentData {
  school: string;
  grade: "SD" | "SMP" | "SMA";
  age: number;
  parentEmail?: string;
}

export interface ParentData {
  childName: string;
  childAge: number;
  childSchool: string;
  relationship:
    | "Father"
    | "Mother"
    | "Guardian";
  occupation: string;
}

export interface TeacherData {
  school: string;
  subject: string;
  qualification: string;
  experienceYears: number;
  bio: string;
}

const AuthContext =
  createContext<AuthContextType>({
    user: null,
    isLoading: true,
    error: null,
    isAuthenticated: false,
    signup: async () => {},
    login: async () => {},
    logout: async () => {},
    clearError: () => {},
  });

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] =
    useState(true);
  const [error, setError] = useState<
    string | null
  >(null);
  const [
    isAuthenticated,
    setIsAuthenticated,
  ] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      setIsLoading(true);
      setError(null);

      const userData = await authService.getMe();

      if (!userData) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      setUser({
        id: userData.id,
        email: userData.email,
        fullName: userData.fullName,
        phone: userData.phone,
        city: userData.city,
        role: userData.role,
        school: userData.school,
        grade: userData.grade,
        childName: userData.childName,
        childSchool: userData.childSchool,
        childGrade: userData.childGrade,
        relationship: userData.relationship,
        subject: userData.subject,
        department: userData.department,
      });
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error("Auth check error:", err);
      setError(
        err?.message || "Authentication check failed",
      );
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function signup(
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    roleData:
      | StudentData
      | ParentData
      | TeacherData,
  ) {
    try {
      setError(null);
      setIsLoading(true);

      const { user: userData } =
        await authService.signup({
          email,
          password,
          fullName,
          phone: "",
          city: "",
          role,
          roleData,
        });

      setUser({
        id: userData.id,
        email: userData.email,
        fullName: userData.fullName,
        phone: userData.phone,
        city: userData.city,
        role: userData.role,
        school: userData.school,
        grade: userData.grade,
        childName: userData.childName,
        childSchool: userData.childSchool,
        relationship: userData.relationship,
        subject: userData.subject,
      });
      setIsAuthenticated(true);
    } catch (err: any) {
      const errorMessage =
        err?.message || "Signup failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function login(
    email: string,
    password: string,
  ) {
    try {
      setError(null);
      setIsLoading(true);

      const { user: userData } =
        await authService.login(email, password);

      if (!userData) {
        throw new Error("Login failed - no user returned");
      }

      setUser({
        id: userData.id,
        email: userData.email,
        fullName: userData.fullName,
        phone: userData.phone,
        city: userData.city,
        role: userData.role,
        school: userData.school,
        grade: userData.grade,
        childName: userData.childName,
        childSchool: userData.childSchool,
        relationship: userData.relationship,
        subject: userData.subject,
      });
      setIsAuthenticated(true);
    } catch (err: any) {
      const errorMessage =
        err?.message || "Login failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      setError(null);
      setIsLoading(true);

      await authService.logout();

      setUser(null);
      setIsAuthenticated(false);
    } catch (err: any) {
      const errorMessage =
        err?.message || "Logout failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  function clearError() {
    setError(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        isAuthenticated,
        signup,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider",
    );
  }
  return context;
}
