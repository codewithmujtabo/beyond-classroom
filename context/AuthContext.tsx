/**
 * AuthContext — handles user authentication via custom Express backend
 * Manages login, signup, and logout
 */

import * as authService from "@/services/auth.service";
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
        school: userData.school,
        phone: userData.phone,
        grade: userData.grade,
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
          role: "student",
          roleData: {},
        });

      if (userData) {
        setUser({
          id: userData.id,
          email: userData.email,
          fullName: userData.fullName,
          school: userData.school,
          phone: userData.phone,
          grade: userData.grade,
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

      const { user: userData } =
        await authService.login(email, password);

      if (!userData) {
        throw new Error("Login failed - no user returned");
      }

      setUser({
        id: userData.id,
        email: userData.email,
        fullName: userData.fullName,
        school: userData.school,
        phone: userData.phone,
        grade: userData.grade,
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
