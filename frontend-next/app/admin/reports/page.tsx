"use client";

import { useCallback, useEffect, useState } from "react";
import { ClaimDocumentActions } from "@/components/claim-document-actions";
import { apiUrl, authHeaders } from "@/lib/api-client";
import { getApiBaseUrl } from "@/lib/config";
import { formatDateTime } from "@/lib/format-date";

type Owner = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type AdminClaimRow = {
  id: string;
  policyId: string;
  submittedAt: string;
  status: string;
  documentName: string;
  documentAvailable?: boolean;
  submitter: Owner;
};

const claimStatusOptions = [
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminReportsPage() {
  const [claims, setClaims] = useState<AdminClaimRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingClaimId, setUpdatingClaimId] = useState<string | null>(null);

  const loadClaims = useCallback(async () => {
    if (!getApiBaseUrl()) {
      setError("NEXT_PUBLIC_API_URL is not configured.");
      setClaims([]);
      return;
    }
    setError(null);
    try {
      const res = await fetch(apiUrl("admin/claim-reports"), {
        cache: "no-store",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message ?? "Could not load claim reports.");
      }
      setClaims(data.claims ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load reports.");
      setClaims([]);
    }
  }, []);

  useEffect(() => {
    void loadClaims();
  }, [loadClaims]);

  const onClaimStatusChange = async (claimId: string, status: string) => {
    setUpdatingClaimId(claimId);
    setError(null);
    try {
      const res = await fetch(apiUrl(`admin/claim-reports/${claimId}`), {
        method: "PATCH",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message ?? "Update failed.");
      }
      const updated = data.claim as AdminClaimRow;
      setClaims((prev) =>
        prev
          ? prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
          : prev,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setUpdatingClaimId(null);
    }
  };

  const loading = claims === null;
  const reportCount = claims?.length ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Claim reports
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Every submitted report from all users. Update status as claims move
            through your workflow.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadClaims()}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      <section className="space-y-4" aria-labelledby="admin-reports-heading">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <h2 id="admin-reports-heading" className="text-lg font-semibold text-slate-900">
            All submitted reports
          </h2>
          {!loading && (
            <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {reportCount} {reportCount === 1 ? "report" : "reports"}
            </span>
          )}
        </div>

        {error && (
          <div
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
            role="alert"
          >
            {error}
          </div>
        )}

        {loading && (
          <div
            className="h-40 animate-pulse rounded-xl bg-slate-200"
            aria-busy="true"
            aria-label="Loading reports"
          />
        )}

        {!loading && claims && claims.length === 0 && !error && (
          <p className="text-sm text-slate-600">
            No submitted reports yet. When users file claim reports, they will
            appear here.
          </p>
        )}

        {!loading && claims && claims.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-4 py-3 font-medium text-slate-700 sm:px-6">
                      Client
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-700 sm:px-6">
                      Policy
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-700 sm:px-6">
                      Document
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-700 sm:px-6">
                      Submitted
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-700 sm:px-6">
                      Status
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-700 sm:px-6">
                      PDF
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {claims.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 text-slate-700 sm:px-6">
                        <span className="block font-medium text-slate-900">
                          {c.submitter.firstName} {c.submitter.lastName}
                        </span>
                        <span className="text-xs text-slate-500">
                          {c.submitter.email}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-slate-900 sm:px-6">
                        {c.policyId}
                      </td>
                      <td className="max-w-[180px] truncate px-4 py-3 text-slate-700 sm:max-w-xs sm:px-6">
                        {c.documentName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600 sm:px-6">
                        {formatDateTime(c.submittedAt)}
                      </td>
                      <td className="px-4 py-3 sm:px-6">
                        <select
                          value={c.status}
                          disabled={updatingClaimId === c.id}
                          onChange={(e) =>
                            void onClaimStatusChange(c.id, e.target.value)
                          }
                          className="max-w-[180px] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 disabled:opacity-60"
                          aria-label={`Report status for claim ${c.id}`}
                        >
                          {claimStatusOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
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
      </section>
    </div>
  );
}
