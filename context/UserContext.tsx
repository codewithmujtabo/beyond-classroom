/**
 * UserContext — provides the current logged-in user to the whole app.
 * Fetches real user data from custom Express backend after login.
 */

import * as userService from "@/services/user.service";
import { AppUser } from "@/constants/mock-user";
import React, {
    createContext,
    useContext,
    useState,
} from "react";

interface UserContextType {
  user: AppUser | null;
  setUser: (
    user: AppUser | null,
  ) => void;
  fetchUser: (
    userId: string,
  ) => Promise<void>;
  registrations: Registration[];
  registerCompetition: (
    compId: string,
    meta?: Record<string, any>,
  ) => void;
  markRegistrationPaid: (
    id: string,
  ) => void;
  removeRegistration: (
    id: string,
  ) => void;
  lastRegisteredId?: string | null;
  clearLastRegistered?: () => void;
}

type RegistrationStatus =
  | "registered"
  | "paid"
  | "completed";

interface Registration {
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
    fetchUser: async () => {},
    registrations: [],
    registerCompetition: () => {},
    markRegistrationPaid: () => {},
    removeRegistration: () => {},
  });

export function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<AppUser | null>(null);
  const [
    registrations,
    setRegistrations,
  ] = useState<Registration[]>([]);
  const [
    lastRegisteredId,
    setLastRegisteredId,
  ] = useState<string | null>(null);

  const fetchUser = async (
    _userId: string,
  ) => {
    try {
      const data = await userService.getProfile();

      if (data) {
        const appUser: AppUser = {
          id: data.id,
          name: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          school: data.school || "",
          level: data.grade as
            | "SD"
            | "SMP"
            | "SMA"
            | undefined,
          city: data.city || "",
          role:
            (data.role as
              | "student"
              | "parent"
              | "teacher") || "student",
        };
        setUser(appUser);
      }
    } catch (err) {
      console.error(
        "Error in fetchUser:",
        err,
      );
    }
  };

  function registerCompetition(
    compId: string,
    meta: Record<string, any> = {},
  ) {
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
  }

  function markRegistrationPaid(
    id: string,
  ) {
    setRegistrations((s) =>
      s.map((r) =>
        r.id === id
          ? { ...r, status: "paid" }
          : r,
      ),
    );
  }

  function removeRegistration(
    id: string,
  ) {
    setRegistrations((s) =>
      s.filter((r) => r.id !== id),
    );
  }

  function clearLastRegistered() {
    setLastRegisteredId(null);
  }

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        fetchUser,
        registrations,
        registerCompetition,
        markRegistrationPaid,
        removeRegistration,
        lastRegisteredId,
        clearLastRegistered,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
