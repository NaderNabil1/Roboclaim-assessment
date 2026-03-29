"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getApiBaseUrl } from "@/lib/config";
import { getStoredRole } from "@/lib/session";

export function LoginForm() {
  const router = useRouter();
  const { login, isReady } = useAuth();
  const formId = useId();
  const emailId = `${formId}-email`;
  const passwordId = `${formId}-password`;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  /** Avoid hydration mismatch: server and first client paint must use the same `disabled` rule. */
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const apiBase = getApiBaseUrl();
  const showConfigHint = mounted && !apiBase;
  const disableForm =
    mounted && (!isReady || submitting || !apiBase);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.push(getStoredRole() === "admin" ? "/admin/reports" : "/claims");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      noValidate
    >
      {showConfigHint && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Set{" "}
          <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs">
            NEXT_PUBLIC_API_URL
          </code>{" "}
          in{" "}
          <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs">
            .env.local
          </code>{" "}
          (e.g. http://127.0.0.1:8000/api).
        </p>
      )}

      <div>
        <label
          htmlFor={emailId}
          className="block text-sm font-medium text-slate-800"
        >
          Email
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={disableForm}
          className="mt-2 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner outline-none ring-slate-900/5 transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 disabled:opacity-60"
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <label
          htmlFor={passwordId}
          className="block text-sm font-medium text-slate-800"
        >
          Password
        </label>
        <input
          id={passwordId}
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={disableForm}
          className="mt-2 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner outline-none ring-slate-900/5 transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 disabled:opacity-60"
          placeholder="••••••••"
          required
        />
      </div>

      {error && (
        <p className="text-sm text-rose-800" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={disableForm}
        className="flex h-11 w-full items-center justify-center rounded-lg bg-slate-900 px-5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Signing in…" : "Sign in"}
      </button>

    </form>
  );
}
