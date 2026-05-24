"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import type { ResolvedLocation } from "@/lib/locations";

export type UserProfile = {
  name: string;
  interests: string[];
  location: string;
  internationalMarkets: string[];
  resolvedLocation?: ResolvedLocation;
  isLoggedIn: boolean;
  /** Bumped when chatbot personalizes feed — triggers UI refresh */
  feedVersion?: number;
};

type UserContextType = {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  updateUser: (partial: Partial<UserProfile>) => void;
  logout: () => void;
};

const defaultUser: UserProfile = {
  name: "",
  interests: [],
  location: "",
  internationalMarkets: [],
  isLoggedIn: false,
  feedVersion: 0,
};

const UserContext = createContext<UserContextType>({
  user: defaultUser,
  setUser: () => {},
  updateUser: () => {},
  logout: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile>(defaultUser);

  useEffect(() => {
    const stored = localStorage.getItem("oasis-user");
    if (stored) {
      try {
        setUserState(JSON.parse(stored));
      } catch { /* ignore */ }
    }
  }, []);

  const setUser = useCallback((newUser: UserProfile) => {
    setUserState(newUser);
    localStorage.setItem("oasis-user", JSON.stringify(newUser));
    window.dispatchEvent(new CustomEvent("oasis-user-updated"));
  }, []);

  const updateUser = useCallback((partial: Partial<UserProfile>) => {
    setUserState((prev) => {
      const next = { ...prev, ...partial, feedVersion: (prev.feedVersion || 0) + 1 };
      localStorage.setItem("oasis-user", JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("oasis-user-updated"));
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    setUserState(defaultUser);
    localStorage.removeItem("oasis-user");
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, updateUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
