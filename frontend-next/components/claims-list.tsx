"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ClaimRecord } from "@/lib/types";
import { ClaimDocumentActions } from "@/components/claim-document-actions";
import { apiUrl, authHeaders } from "@/lib/api-client";
import { getApiBaseUrl } from "@/lib/config";

const statusLabel: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Rejected",
};

const statusStyle: Record<string, string> = {
  submitted:
    "bg-amber-50 text-amber-900 ring-amber-200/80",
  under_review:
    "bg-sky-50 text-sky-900 ring-sky-200/80",
  approved:
    "bg-emerald-50 text-emerald-900 ring-emerald-200/80",
  rejected:
    "bg-rose-50 text-rose-900 ring-rose-200/80",
};

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function ClaimsList() {
  const [claims, setClaims] = useState<ClaimRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const initialLoad = useRef(true);

  const load = useCallback(async () => {
    setError(null);
    if (!initialLoad.current) setRefreshing(true);
    try {
      if (!getApiBaseUrl()) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is not set. Add it to .env.local for local development.",
        );
      }
      const res = await fetch(apiUrl("claims"), {
        cache: "no-store",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message ?? data?.error ?? "Could not load claims.");
      }
      setClaims(data.claims ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setClaims([]);
    } finally {
      setRefreshing(false);
      initialLoad.current = false;
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (claims === null && !error) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading claims">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 px-4 py-4 sm:px-6">
                <div className="h-4 flex-1 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Claim reports
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Policies with a submitted claim and supporting documents.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void load()}
            disabled={refreshing}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? (
              <span className="inline-flex items-center gap-2">
                <Spinner className="h-4 w-4" />
                Refreshing
              </span>
            ) : (
              "Refresh"
            )}
          </button>
          <Link
            href="/claims/new"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            New report
          </Link>
        </div>
      </div>

      {error && (
        <div
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
          role="alert"
        >
          {error}
        </div>
      )}

      {claims && claims.length === 0 && !error && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-slate-700">No claim reports yet.</p>
          <p className="mt-2 text-sm text-slate-600">
            Submit a new report with your policy number and PDF documentation.
          </p>
          <Link
            href="/claims/new"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            Submit a claim report
          </Link>
        </div>
      )}

      {claims && claims.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th
                    scope="col"
                    className="px-4 py-3 font-medium text-slate-700 sm:px-6"
                  >
                    Policy
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-medium text-slate-700 sm:px-6"
                  >
                    Document
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-medium text-slate-700 sm:px-6"
                  >
                    Submitted
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-medium text-slate-700 sm:px-6"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-medium text-slate-700 sm:px-6"
                  >
                    PDF
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {claims.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-mono text-sm text-slate-900 sm:px-6">
                      {c.policyId}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-slate-700 sm:max-w-xs sm:px-6">
                      {c.documentName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600 sm:px-6">
                      {formatDate(c.submittedAt)}
                    </td>
                    <td className="px-4 py-3 sm:px-6">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyle[c.status] ?? "bg-slate-100 text-slate-800 ring-slate-200"}`}
                      >
                        {statusLabel[c.status] ?? c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 sm:px-6 align-top">
                      <ClaimDocumentActions
                        claimId={c.id}
                        documentName={c.documentName}
                        documentAvailable={c.documentAvailable !== false}
                        compact
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin text-current ${className ?? ""}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
