"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";
import { HARDCODED_USERS } from "@/lib/constants";

type User = {
  email: string;
  role: "admin" | "user";
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User | null>;
  logout: () => void;
  register: (credentials: { email: string; password: string }) => Promise<User | null>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("quantum-user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: { email: string; password: string }): Promise<User | null> => {
    setLoading(true);
    try {
      const storedUsers = localStorage.getItem("quantum-users-db");
      const users = storedUsers ? JSON.parse(storedUsers) : HARDCODED_USERS;
      
      const foundUser = users.find(
        (u: any) => u.email === credentials.email && u.password === credentials.password
      );

      if (foundUser) {
        const userToStore = { email: foundUser.email, role: foundUser.role };
        localStorage.setItem("quantum-user", JSON.stringify(userToStore));
        setUser(userToStore);
        return userToStore;
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (credentials: { email: string; password: string }): Promise<User | null> => {
    setLoading(true);
    try {
      const storedUsers = localStorage.getItem("quantum-users-db");
      let users = storedUsers ? JSON.parse(storedUsers) : [...HARDCODED_USERS];

      if (users.some((u: any) => u.email === credentials.email)) {
        throw new Error("User already exists.");
      }

      const newUser = { ...credentials, role: "user" as const };
      users.push(newUser);
      localStorage.setItem("quantum-users-db", JSON.stringify(users));

      return newUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("quantum-user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
