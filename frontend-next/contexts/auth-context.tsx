"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getApiBaseUrl } from "@/lib/config";
import {
  clearAuthSession,
  getStoredToken,
  setAuthSession,
  type UserRole,
} from "@/lib/session";

type AuthUser = {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const t = getStoredToken();
    setToken(t);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const base = getApiBaseUrl();
    const t = getStoredToken();
    if (!t || !base) {
      if (!t) setUser(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      const res = await fetch(`${base}/auth/me`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (cancelled) return;
      if (!res.ok) {
        clearAuthSession();
        setToken(null);
        setUser(null);
        return;
      }
      const data = (await res.json()) as {
        email: string;
        first_name: string;
        last_name: string;
        role: UserRole;
      };
      setUser({
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
      });
      setToken(t);
    })();

    return () => {
      cancelled = true;
    };
  }, [isReady]);

  const login = useCallback(async (email: string, password: string) => {
    const base = getApiBaseUrl();
    if (!base) {
      throw new Error(
        "API URL is not configured. Set NEXT_PUBLIC_API_URL in .env.local.",
      );
    }
    const res = await fetch(`${base}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email: email.trim(), password }),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg =
        typeof data?.message === "string"
          ? data.message
          : "Sign-in failed. Check your credentials.";
      throw new Error(msg);
    }
    const accessToken = data.access_token as string;
    const role = data.role as UserRole;
    const expiresIn = Number(data.expires_in) || 3600;
    setAuthSession(accessToken, role, expiresIn);
    setToken(accessToken);
    setUser({
      email: data.email as string,
      firstName: data.first_name as string,
      lastName: data.last_name as string,
      role,
    });
  }, []);

  const logout = useCallback(async () => {
    const t = getStoredToken();
    const base = getApiBaseUrl();
    if (t && base) {
      try {
        await fetch(`${base}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${t}`,
            Accept: "application/json",
          },
        });
      } catch {
        // still clear local session
      }
    }
    clearAuthSession();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isReady,
      login,
      logout,
    }),
    [user, token, isReady, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
