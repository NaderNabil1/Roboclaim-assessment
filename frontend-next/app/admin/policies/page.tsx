"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { apiUrl, authHeaders } from "@/lib/api-client";
import { getApiBaseUrl } from "@/lib/config";
import { formatDateTime } from "@/lib/format-date";

type Owner = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type AdminPolicyRow = {
  id: string;
  policyNumber: string;
  status: string;
  updatedAt: string;
  owner: Owner;
};

const policyStatusOptions = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "suspended", label: "Suspended" },
  { value: "cancelled", label: "Cancelled" },
];

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

export default function AdminPoliciesPage() {
  const formId = useId();
  const policyInputId = `${formId}-policy`;
  const ownerInputId = `${formId}-owner`;

  const [policies, setPolicies] = useState<AdminPolicyRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingPolicyId, setUpdatingPolicyId] = useState<string | null>(null);
  const [deletingPolicyId, setDeletingPolicyId] = useState<string | null>(null);

  const [newPolicyNumber, setNewPolicyNumber] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const loadPolicies = useCallback(async () => {
    if (!getApiBaseUrl()) {
      setError("NEXT_PUBLIC_API_URL is not configured.");
      setPolicies([]);
      return;
    }
    setError(null);
    try {
      const res = await fetch(apiUrl("admin/policies"), {
        cache: "no-store",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message ?? "Could not load policies.");
      }
      setPolicies(data.policies ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load policies.");
      setPolicies([]);
    }
  }, []);

  useEffect(() => {
    void loadPolicies();
  }, [loadPolicies]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const pErr = validatePolicyNumber(newPolicyNumber);
    const email = ownerEmail.trim();
    if (pErr) {
      setFormError(pErr);
      return;
    }
    if (!email) {
      setFormError("Enter the client account email.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch(apiUrl("admin/policies"), {
        method: "POST",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          policyNumber: newPolicyNumber.trim(),
          ownerEmail: email,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg =
          typeof data?.message === "string"
            ? data.message
            : data?.errors
              ? Object.values(data.errors).flat().join(" ")
              : "Could not create policy.";
        throw new Error(msg);
      }
      const row = data.policy as AdminPolicyRow;
      setPolicies((prev) => (prev ? [row, ...prev] : [row]));
      setNewPolicyNumber("");
      setOwnerEmail("");
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Create failed.");
    } finally {
      setCreating(false);
    }
  };

  const onPolicyStatusChange = async (policyId: string, status: string) => {
    setUpdatingPolicyId(policyId);
    setError(null);
    try {
      const res = await fetch(apiUrl(`admin/policies/${policyId}`), {
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
      const updated = data.policy as AdminPolicyRow;
      setPolicies((prev) =>
        prev
          ? prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
          : prev,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setUpdatingPolicyId(null);
    }
  };

  const onDelete = async (policyId: string, policyNumber: string) => {
    if (
      !window.confirm(
        `Delete policy ${policyNumber}? Related claim reports will be removed as well.`,
      )
    ) {
      return;
    }
    setDeletingPolicyId(policyId);
    setError(null);
    try {
      const res = await fetch(apiUrl(`admin/policies/${policyId}`), {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message ?? "Delete failed.");
      }
      setPolicies((prev) => (prev ? prev.filter((p) => p.id !== policyId) : prev));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setDeletingPolicyId(null);
    }
  };

  const loading = policies === null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Policies
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Create active policies for clients, adjust status, or delete a
            policy. Pending policies are created by users until you activate
            them.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadPolicies()}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Add policy (active)
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          New policies are saved as <span className="font-medium">active</span>{" "}
          immediately. Use a client account email (not an admin).
        </p>
        <form onSubmit={(e) => void onCreate(e)} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <label
              htmlFor={policyInputId}
              className="text-sm font-medium text-slate-800"
            >
              Policy number
            </label>
            <input
              id={policyInputId}
              value={newPolicyNumber}
              onChange={(e) => {
                setNewPolicyNumber(e.target.value);
                setFormError(null);
              }}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
              placeholder="e.g. POL-2024-100"
              autoComplete="off"
            />
          </div>
          <div className="sm:col-span-1">
            <label
              htmlFor={ownerInputId}
              className="text-sm font-medium text-slate-800"
            >
              Client email
            </label>
            <input
              id={ownerInputId}
              type="email"
              value={ownerEmail}
              onChange={(e) => {
                setOwnerEmail(e.target.value);
                setFormError(null);
              }}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="user@test.com"
              autoComplete="email"
            />
          </div>
          <div className="sm:col-span-2">
            {formError && (
              <p className="mb-2 text-sm text-rose-700" role="alert">
                {formError}
              </p>
            )}
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {creating ? "Creating…" : "Create policy"}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4" aria-labelledby="admin-policies-heading">
        <h2 id="admin-policies-heading" className="text-lg font-semibold text-slate-900">
          All policies
        </h2>

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
            className="h-36 animate-pulse rounded-xl bg-slate-200"
            aria-busy="true"
            aria-label="Loading policies"
          />
        )}

        {!loading && policies && policies.length === 0 && !error && (
          <p className="text-sm text-slate-600">No policies found.</p>
        )}

        {!loading && policies && policies.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-4 py-3 font-medium text-slate-700 sm:px-6">
                      Policy
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-700 sm:px-6">
                      Owner
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-700 sm:px-6">
                      Updated
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-700 sm:px-6">
                      Status
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-700 sm:px-6">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {policies.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-mono text-sm text-slate-900 sm:px-6">
                        {p.policyNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-700 sm:px-6">
                        <span className="block font-medium text-slate-900">
                          {p.owner.firstName} {p.owner.lastName}
                        </span>
                        <span className="text-xs text-slate-500">
                          {p.owner.email}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600 sm:px-6">
                        {formatDateTime(p.updatedAt)}
                      </td>
                      <td className="px-4 py-3 sm:px-6">
                        <select
                          value={p.status}
                          disabled={updatingPolicyId === p.id}
                          onChange={(e) =>
                            void onPolicyStatusChange(p.id, e.target.value)
                          }
                          className="max-w-[160px] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 disabled:opacity-60"
                          aria-label={`Policy status for ${p.policyNumber}`}
                        >
                          {policyStatusOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 sm:px-6">
                        <button
                          type="button"
                          disabled={deletingPolicyId === p.id}
                          onClick={() => void onDelete(p.id, p.policyNumber)}
                          className="text-sm font-medium text-rose-700 hover:text-rose-900 disabled:opacity-50"
                        >
                          {deletingPolicyId === p.id ? "Deleting…" : "Delete"}
                        </button>
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
