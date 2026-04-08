/**
 * AuthContext — handles user authentication with Supabase
 * NOW SUPPORTS: Student, Parent, Teacher roles
 * Manages login, signup, and logout
 * Prevents users from accessing app if they don't have an account
 */

import { supabase } from "@/config/supabase";
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

// Role-specific data types
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

  // Check if user is already logged in
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      setIsLoading(true);
      setError(null);

      // Get current auth session
      const {
        data: { session },
        error: sessionError,
      } =
        await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      // Get user profile from database
      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (
        profileError &&
        profileError.code !== "PGRST116"
      ) {
        console.warn(
          "Profile error:",
          profileError,
        );
      }

      if (!profileData) {
        // User logged in but no profile = not allowed
        await supabase.auth.signOut();
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      // Fetch role-specific data
      const roleData =
        await fetchRoleData(
          session.user.id,
          profileData.role,
        );

      setUser({
        id: profileData.id,
        email: profileData.email,
        fullName: profileData.full_name,
        phone: profileData.phone,
        city: profileData.city,
        role: profileData.role,
        ...roleData,
      });
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error(
        "Auth check error:",
        err,
      );
      setError(
        err?.message ||
          "Authentication check failed",
      );
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchRoleData(
    userId: string,
    role: UserRole,
  ) {
    const tableName =
      role === "student"
        ? "students"
        : role === "parent"
          ? "parents"
          : "teachers";

    const { data, error } =
      await supabase
        .from(tableName)
        .select("*")
        .eq("id", userId)
        .single();

    if (error) {
      console.warn(
        `Error fetching ${role} data:`,
        error,
      );
      return {};
    }

    if (!data) return {};

    // Map database columns to user object
    if (role === "student") {
      return {
        school: data.school,
        grade: data.grade,
        age: data.age,
        parentEmail: data.parent_email,
      };
    } else if (role === "parent") {
      return {
        childName: data.child_name,
        childAge: data.child_age,
        childSchool: data.child_school,
        relationship: data.relationship,
        occupation: data.occupation,
      };
    } else if (role === "teacher") {
      return {
        school: data.school,
        subject: data.subject,
        qualification:
          data.qualification,
        experienceYears:
          data.experience_years,
        bio: data.bio,
      };
    }

    return {};
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

      // Sign up user with Supabase Auth
      // Pass role in metadata so trigger can use it
      const {
        data,
        error: signupError,
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });

      if (signupError) {
        throw signupError;
      }

      if (!data.user) {
        throw new Error(
          "Signup failed - no user returned",
        );
      }

      // User record is auto-created by trigger
      // Now create role-specific record
      const tableName =
        role === "student"
          ? "students"
          : role === "parent"
            ? "parents"
            : "teachers";

      // Map role data to correct column names
      let insertData: any = {
        id: data.user.id,
      };

      if (role === "student") {
        insertData = {
          ...insertData,
          school: (
            roleData as StudentData
          ).school,
          grade: (
            roleData as StudentData
          ).grade,
          age: (roleData as StudentData)
            .age,
          parent_email: (
            roleData as StudentData
          ).parentEmail,
        };
      } else if (role === "parent") {
        insertData = {
          ...insertData,
          child_name: (
            roleData as ParentData
          ).childName,
          child_age: (
            roleData as ParentData
          ).childAge,
          child_school: (
            roleData as ParentData
          ).childSchool,
          relationship: (
            roleData as ParentData
          ).relationship,
          occupation: (
            roleData as ParentData
          ).occupation,
        };
      } else if (role === "teacher") {
        insertData = {
          ...insertData,
          school: (
            roleData as TeacherData
          ).school,
          subject: (
            roleData as TeacherData
          ).subject,
          qualification: (
            roleData as TeacherData
          ).qualification,
          experience_years: (
            roleData as TeacherData
          ).experienceYears,
          bio: (roleData as TeacherData)
            .bio,
        };
      }

      const { error: roleError } =
        await supabase
          .from(tableName)
          .insert([insertData]);

      if (roleError) {
        console.error(
          `Error creating ${role} profile:`,
          roleError,
        );
        throw roleError;
      }

      // Fetch complete user data
      const roleSpecificData =
        await fetchRoleData(
          data.user.id,
          role,
        );

      setUser({
        id: data.user.id,
        email: data.user.email || email,
        fullName,
        role,
        ...roleSpecificData,
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

      // Sign in user
      const {
        data,
        error: signInError,
      } =
        await supabase.auth.signInWithPassword(
          {
            email,
            password,
          },
        );

      if (signInError) {
        throw signInError;
      }

      if (!data.session || !data.user) {
        throw new Error(
          "Login failed - no session",
        );
      }

      // Get user profile
      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (
        profileError ||
        !profileData
      ) {
        // User in auth but not in users table
        await supabase.auth.signOut();
        throw new Error(
          "User account not found. Please sign up first.",
        );
      }

      // Fetch role-specific data
      const roleData =
        await fetchRoleData(
          data.user.id,
          profileData.role,
        );

      setUser({
        id: profileData.id,
        email: profileData.email,
        fullName: profileData.full_name,
        phone: profileData.phone,
        city: profileData.city,
        role: profileData.role,
        ...roleData,
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

      const { error: signOutError } =
        await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

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
  const context = useContext(
    AuthContext,
  );
  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider",
    );
  }
  return context;
}
