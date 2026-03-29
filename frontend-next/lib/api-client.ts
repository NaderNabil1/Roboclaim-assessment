import { getApiBaseUrl } from "@/lib/config";
import { getStoredToken } from "@/lib/session";

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  if (!base) throw new Error("NEXT_PUBLIC_API_URL is not set.");
  const segment = path.replace(/^\/+/, "");
  return `${base}/${segment}`;
}

export function authHeaders(): HeadersInit {
  const t = getStoredToken();
  if (!t) return { Accept: "application/json" };
  return {
    Accept: "application/json",
    Authorization: `Bearer ${t}`,
  };
}
