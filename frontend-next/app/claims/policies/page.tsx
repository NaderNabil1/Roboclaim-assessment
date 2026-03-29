"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { apiUrl, authHeaders } from "@/lib/api-client";
import { getApiBaseUrl } from "@/lib/config";
import { formatDateTime } from "@/lib/format-date";

type UserPolicyRow = {
  id: string;
  policyNumber: string;
  status: string;
  updatedAt: string;
};

function validatePolicyNumber(value: string): string | null {
  const t = value.trim();
  if (!t) return "Enter a policy number.";
  if (t.length < 3 || t.length > 64) {
    return "Policy number must be between 3 and 64 characters.";
  }
  if (!/^[A-Za-z0-9-]+$/.test(t)) {
    return "Use letters, numbers, and hyphens only.";
  }
  return null;
}

export default function UserPoliciesPage() {
  const formId = useId();
  const policyInputId = `${formId}-policy`;

  const [rows, setRows] = useState<UserPolicyRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [policyNumber, setPolicyNumber] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!getApiBaseUrl()) {
      setLoadError("NEXT_PUBLIC_API_URL is not configured.");
      setRows([]);
      return;
    }
    setLoadError(null);
    try {
      const res = await fetch(apiUrl("policies"), {
        cache: "no-store",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message ?? "Could not load policies.");
      }
      setRows(data.policies ?? []);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not load policies.");
      setRows([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const err = validatePolicyNumber(policyNumber);
    setFieldError(err);
    if (err) return;

    setSubmitting(true);
    try {
      const res = await fetch(apiUrl("policies"), {
        method: "POST",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ policyNumber: policyNumber.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg =
          typeof data?.message === "string"
            ? data.message
            : Array.isArray(data?.errors?.policyNumber)
              ? String(data.errors.policyNumber[0])
              : "Could not register policy.";
        throw new Error(msg);
      }
      const p = data.policy as UserPolicyRow;
      setRows((prev) => (prev ? [p, ...prev] : [p]));
      setPolicyNumber("");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Request failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const loading = rows === null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          My policies
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Register a policy number for review. It stays{" "}
          <span className="font-medium text-slate-800">pending</span> until an
          administrator activates it. Only{" "}
          <span className="font-medium text-slate-800">active</span> policies
          can be used when filing a claim report.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Register a new policy
        </h2>
        <form onSubmit={(e) => void onSubmit(e)} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor={policyInputId}
              className="block text-sm font-medium text-slate-800"
            >
              Policy number
            </label>
            <input
              id={policyInputId}
              value={policyNumber}
              onChange={(e) => {
                setPolicyNumber(e.target.value);
                setFieldError(null);
                setSubmitError(null);
              }}
              className="mt-2 w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
              placeholder="e.g. POL-2024-001"
              autoComplete="off"
            />
            {fieldError && (
              <p className="mt-1 text-sm text-rose-700">{fieldError}</p>
            )}
          </div>
          {submitError && (
            <p className="text-sm text-rose-700" role="alert">
              {submitError}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit for review"}
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Your registered policies
          </h2>
          <button
            type="button"
            onClick={() => void load()}
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Refresh
          </button>
        </div>
        {loadError && (
          <p className="text-sm text-rose-700" role="alert">
            {loadError}
          </p>
        )}
        {loading && (
          <div className="h-24 animate-pulse rounded-xl bg-slate-200" aria-busy />
        )}
        {!loading && rows && rows.length === 0 && !loadError && (
          <p className="text-sm text-slate-600">
            You have not registered any policies yet.
          </p>
        )}
        {!loading && rows && rows.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-4 py-3 font-medium text-slate-700 sm:px-6">
                    Policy number
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-700 sm:px-6">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-700 sm:px-6">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-mono text-slate-900 sm:px-6">
                      {r.policyNumber}
                    </td>
                    <td className="px-4 py-3 sm:px-6">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          r.status === "active"
                            ? "bg-emerald-100 text-emerald-900"
                            : r.status === "pending"
                              ? "bg-amber-100 text-amber-900"
                              : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600 sm:px-6">
                      {formatDateTime(r.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
