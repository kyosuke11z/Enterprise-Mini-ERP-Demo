"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "@/services/api";

export interface User {
  id: number;
  username: string;
  name: string;
  role: "ADMIN" | "STAFF";
  email: string;
  department?: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  error: string | null;
  setError: (err: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkMe = async () => {
    try {
      const data = await apiRequest("/api/auth/me");
      if (data && data.username) {
        setUser(data as User);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const match = document.cookie.match(/(^|;)\s*auth_token\s*=\s*([^;]+)/);
    if (match && match[2]) {
      checkMe();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      if (data.token) {
        document.cookie = `auth_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
      }
      const loggedUser = data.user as User;
      setUser(loggedUser);
      return loggedUser;
    } catch (err: any) {
      const msg = err.message || "Failed to log in";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
    } catch (_) {}
    setUser(null);
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
