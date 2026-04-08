/**
 * UserContext — provides the current logged-in user to the whole app.
 * Integrates with Supabase for authentication and data storage.
 * Falls back to MOCK_USER during development.
 */

import { supabase } from "@/config/supabase";
import {
    AppUser,
    MOCK_USER,
} from "@/constants/mock-user";
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

interface UserContextType {
  user: AppUser | null;
  setUser: (
    user: AppUser | null,
  ) => void;
  registrations: Registration[];
  registerCompetition: (
    compId: string,
    meta?: Record<string, any>,
  ) => Promise<void>;
  markRegistrationPaid: (
    id: string,
  ) => Promise<void>;
  removeRegistration: (
    id: string,
  ) => Promise<void>;
  lastRegisteredId?: string | null;
  clearLastRegistered?: () => void;
  isLoading: boolean;
  error: string | null;
}

type RegistrationStatus =
  | "registered"
  | "paid"
  | "completed";

export interface Registration {
  id: string;
  compId: string;
  status: RegistrationStatus;
  createdAt: string;
  meta?: Record<string, any>;
}

const UserContext =
  createContext<UserContextType>({
    user: null,
    setUser: () => {},
    registrations: [],
    registerCompetition: async () => {},
    markRegistrationPaid:
      async () => {},
    removeRegistration: async () => {},
    isLoading: false,
    error: null,
  });

export function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Starts with MOCK_USER during dev — swap for real auth later
  const [user, setUser] =
    useState<AppUser | null>(MOCK_USER);
  const [
    registrations,
    setRegistrations,
  ] = useState<Registration[]>([]);
  const [
    lastRegisteredId,
    setLastRegisteredId,
  ] = useState<string | null>(null);
  const [isLoading, setIsLoading] =
    useState(false);
  const [error, setError] = useState<
    string | null
  >(null);

  // Load current authenticated user from Supabase
  useEffect(() => {
    loadAuthenticatedUser();
  }, []);

  async function loadAuthenticatedUser() {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser?.id) {
        // Fetch user profile from database
        const {
          data: userData,
          error: userError,
        } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (userError) {
          console.warn(
            "Failed to load user profile:",
            userError,
          );
          return;
        }

        if (userData) {
          setUser({
            id: userData.id,
            name:
              userData.full_name ||
              "User",
            email: userData.email || "",
            phone: userData.phone || "",
            school:
              userData.school || "",
            city: userData.city || "",
            role:
              userData.role ||
              "student",
            level:
              userData.grade || "SMP",
          } as AppUser);
        }
      }
    } catch (err) {
      console.error(
        "Error loading authenticated user:",
        err,
      );
    }
  }

  // Load registrations on app start
  useEffect(() => {
    loadRegistrations();
  }, [user?.id]);

  async function loadRegistrations() {
    if (!user?.id) {
      setRegistrations([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Try to fetch from Supabase
      const {
        data,
        error: supabaseError,
      } = await supabase
        .from("registrations")
        .select("*")
        .eq("user_id", user.id);

      if (supabaseError) {
        console.warn(
          "Failed to load from Supabase, using local state",
          supabaseError,
        );
        // Fall back to local state - data will be in memory
        return;
      }

      if (data) {
        setRegistrations(
          data.map((reg: any) => ({
            id: reg.id,
            compId: reg.comp_id,
            status: reg.status,
            createdAt: reg.created_at,
            meta: reg.meta,
          })),
        );
      }
    } catch (err) {
      console.error(
        "Error loading registrations:",
        err,
      );
      setError(
        "Failed to load registrations",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function registerCompetition(
    compId: string,
    meta: Record<string, any> = {},
  ) {
    try {
      setError(null);
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const reg: Registration = {
        id,
        compId,
        status: "registered",
        createdAt:
          new Date().toISOString(),
        meta,
      };

      // Add to local state immediately for better UX
      setRegistrations((s) => [
        reg,
        ...s,
      ]);
      setLastRegisteredId(id);

      // Try to save to Supabase (fire and forget, don't block UI)
      if (user?.id) {
        supabase
          .from("registrations")
          .insert({
            id,
            user_id: user.id,
            comp_id: compId,
            status: "registered",
            created_at: reg.createdAt,
            meta,
          })
          .catch((err) => {
            console.warn(
              "Failed to save registration to Supabase:",
              err,
            );
            // Data is still in local state, so user can continue
          });
      }
    } catch (err) {
      console.error(
        "Error registering for competition:",
        err,
      );
      setError(
        "Failed to register for competition",
      );
      throw err;
    }
  }

  async function markRegistrationPaid(
    id: string,
  ) {
    try {
      setError(null);

      // Update local state immediately
      setRegistrations((s) =>
        s.map((r) =>
          r.id === id
            ? { ...r, status: "paid" }
            : r,
        ),
      );

      // Update in Supabase (fire and forget)
      if (user?.id) {
        supabase
          .from("registrations")
          .update({ status: "paid" })
          .eq("id", id)
          .catch((err) => {
            console.warn(
              "Failed to update registration in Supabase:",
              err,
            );
          });
      }
    } catch (err) {
      console.error(
        "Error updating registration:",
        err,
      );
      setError(
        "Failed to update registration",
      );
      throw err;
    }
  }

  async function removeRegistration(
    id: string,
  ) {
    try {
      setError(null);

      // Remove from local state immediately
      setRegistrations((s) =>
        s.filter((r) => r.id !== id),
      );

      // Remove from Supabase (fire and forget)
      if (user?.id) {
        supabase
          .from("registrations")
          .delete()
          .eq("id", id)
          .catch((err) => {
            console.warn(
              "Failed to delete registration from Supabase:",
              err,
            );
          });
      }
    } catch (err) {
      console.error(
        "Error removing registration:",
        err,
      );
      setError(
        "Failed to remove registration",
      );
      throw err;
    }
  }

  function clearLastRegistered() {
    setLastRegisteredId(null);
  }

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        registrations,
        registerCompetition,
        markRegistrationPaid,
        removeRegistration,
        lastRegisteredId,
        clearLastRegistered,
        isLoading,
        error,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

/** Use this hook in any screen to get the current user and registration functions */
export function useUser() {
  return useContext(UserContext);
}
