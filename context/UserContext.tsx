/**
 * UserContext — provides the current logged-in user to the whole app.
 * During development, it uses MOCK_USER automatically.
 * When real auth is ready, just update the value here — nothing else changes.
 */

import {
  AppUser,
  MOCK_USER,
} from "@/constants/mock-user";
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
  // Starts with MOCK_USER during dev — swap for null + real login later
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

/** Use this hook in any screen to get the current user */
export function useUser() {
  return useContext(UserContext);
}
