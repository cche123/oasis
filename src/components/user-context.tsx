"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type UserProfile = {
  name: string;
  interests: string[];
  experience: string;
  isLoggedIn: boolean;
};

type UserContextType = {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  logout: () => void;
};

const defaultUser: UserProfile = {
  name: "",
  interests: [],
  experience: "",
  isLoggedIn: false,
};

const UserContext = createContext<UserContextType>({
  user: defaultUser,
  setUser: () => {},
  logout: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile>(defaultUser);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("oasis-user");
    if (stored) {
      try {
        setUserState(JSON.parse(stored));
      } catch { /* ignore */ }
    }
    setLoaded(true);
  }, []);

  const setUser = (newUser: UserProfile) => {
    setUserState(newUser);
    localStorage.setItem("oasis-user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUserState(defaultUser);
    localStorage.removeItem("oasis-user");
  };

  if (!loaded) return null;

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
