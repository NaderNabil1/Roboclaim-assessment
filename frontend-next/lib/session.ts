const TOKEN_KEY = "rc_token";
const ROLE_KEY = "rc_role";

export type UserRole = "admin" | "user" | string;

export function setAuthSession(
  token: string,
  role: UserRole,
  maxAgeSeconds: number,
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  const maxAge = Math.max(120, Math.floor(maxAgeSeconds));
  const enc = encodeURIComponent(token);
  document.cookie = `${TOKEN_KEY}=${enc}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `${ROLE_KEY}=${encodeURIComponent(role)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
  document.cookie = `${ROLE_KEY}=; path=/; max-age=0`;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredRole(): UserRole | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ROLE_KEY);
}
