/**
 * AuthContext — handles user authentication with Supabase
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

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  school?: string;
  phone?: string;
  grade?: string;
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
  ) => Promise<void>;
  login: (
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
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
        // PGRST116 = no rows returned (user not found)
        console.warn(
          "Profile error:",
          profileError,
        );
      }

      if (profileData) {
        setUser({
          id: profileData.id,
          email: profileData.email,
          fullName:
            profileData.full_name,
          school: profileData.school,
          phone: profileData.phone,
          grade: profileData.grade,
        });
        setIsAuthenticated(true);
      } else {
        // User logged in but no profile = not allowed
        await supabase.auth.signOut();
        setIsAuthenticated(false);
        setUser(null);
      }
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

  async function signup(
    email: string,
    password: string,
    fullName: string,
  ) {
    try {
      setError(null);
      setIsLoading(true);

      // Sign up user with Supabase Auth
      const {
        data,
        error: signupError,
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
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

      // User profile is auto-created by trigger
      // But we'll verify it exists
      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (
        profileError &&
        profileError.code !== "PGRST116"
      ) {
        console.warn(
          "Profile check error:",
          profileError,
        );
      }

      if (profileData) {
        setUser({
          id: profileData.id,
          email: profileData.email,
          fullName:
            profileData.full_name,
          school: profileData.school,
          phone: profileData.phone,
          grade: profileData.grade,
        });
        setIsAuthenticated(true);
      }
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

      if (!data.user) {
        throw new Error(
          "Login failed - no user returned",
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
        profileError &&
        profileError.code !== "PGRST116"
      ) {
        throw new Error(
          "User profile not found - please contact support",
        );
      }

      if (!profileData) {
        // User is authenticated but has no profile
        await supabase.auth.signOut();
        throw new Error(
          "User account not properly set up - please signup again",
        );
      }

      setUser({
        id: profileData.id,
        email: profileData.email,
        fullName: profileData.full_name,
        school: profileData.school,
        phone: profileData.phone,
        grade: profileData.grade,
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

/** Use this hook to access authentication */
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
