/**
 * UserContext — provides the current logged-in user to the whole app.
 * Integrates with custom Express backend for authentication and data storage.
 * Falls back to MOCK_USER during development.
 */

import * as authService from "@/services/auth.service";
import * as registrationService from "@/services/registration.service";
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

  useEffect(() => {
    loadAuthenticatedUser();
  }, []);

  async function loadAuthenticatedUser() {
    try {
      const userData = await authService.getMe();

      if (userData) {
        setUser({
          id: userData.id,
          name: userData.fullName || "User",
          email: userData.email || "",
          phone: userData.phone || "",
          school: userData.school || "",
          city: userData.city || "",
          role: userData.role || "student",
          level: userData.grade || "SMP",
        } as AppUser);
      }
    } catch (err) {
      console.error(
        "Error loading authenticated user:",
        err,
      );
    }
  }

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

      const data = await registrationService.list();

      setRegistrations(
        data.map((reg) => ({
          id: reg.id,
          compId: reg.compId,
          status: reg.status as RegistrationStatus,
          createdAt: reg.createdAt,
          meta: reg.meta,
        })),
      );
    } catch (err) {
      console.warn(
        "Failed to load registrations, using local state",
        err,
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

      setRegistrations((s) => [
        reg,
        ...s,
      ]);
      setLastRegisteredId(id);

      if (user?.id) {
        registrationService
          .create({
            id,
            compId,
            status: "registered",
            meta,
          })
          .catch((err) => {
            console.warn(
              "Failed to save registration to backend:",
              err,
            );
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

      setRegistrations((s) =>
        s.map((r) =>
          r.id === id
            ? { ...r, status: "paid" }
            : r,
        ),
      );

      if (user?.id) {
        registrationService
          .updateStatus(id, "paid")
          .catch((err) => {
            console.warn(
              "Failed to update registration in backend:",
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

      setRegistrations((s) =>
        s.filter((r) => r.id !== id),
      );

      if (user?.id) {
        registrationService
          .remove(id)
          .catch((err) => {
            console.warn(
              "Failed to delete registration from backend:",
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

export function useUser() {
  return useContext(UserContext);
}
