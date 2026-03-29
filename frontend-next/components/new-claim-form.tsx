"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useId, useState } from "react";
import { apiUrl, authHeaders } from "@/lib/api-client";
import { getApiBaseUrl } from "@/lib/config";

const MAX_BYTES = 10 * 1024 * 1024;

function formatPolicyClient(policyId: string): string {
  return policyId.trim();
}

function validatePolicyFormat(policyId: string): string | null {
  const t = policyId.trim();
  if (!t) return "Enter your policy number.";
  if (t.length < 3 || t.length > 64) {
    return "Policy number must be between 3 and 64 characters.";
  }
  if (!/^[A-Za-z0-9-]+$/.test(t)) {
    return "Use letters, numbers, and hyphens only.";
  }
  return null;
}

function validateFile(file: File | null): string | null {
  if (!file) return "Upload a PDF with your claim details.";
  if (file.size === 0) return "The file appears to be empty.";
  if (file.size > MAX_BYTES) return "PDF must be 10 MB or smaller.";
  const name = file.name.toLowerCase();
  const isPdf =
    file.type === "application/pdf" || name.endsWith(".pdf");
  if (!isPdf) return "Only PDF files are accepted.";
  return null;
}

export function NewClaimForm() {
  const router = useRouter();
  const formId = useId();
  const policyFieldId = `${formId}-policy`;
  const fileFieldId = `${formId}-file`;

  const [policyId, setPolicyId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [policyCheck, setPolicyCheck] = useState<
    "idle" | "checking" | "found" | "not_found" | "error"
  >("idle");
  const [policyMessage, setPolicyMessage] = useState<string | null>(null);
  const [policyError, setPolicyError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const verifyPolicy = useCallback(async () => {
    setSubmitError(null);
    const fmtErr = validatePolicyFormat(policyId);
    if (fmtErr) {
      setPolicyError(fmtErr);
      setPolicyCheck("idle");
      setPolicyMessage(null);
      return;
    }
    setPolicyError(null);
    setPolicyCheck("checking");
    setPolicyMessage(null);
    if (!getApiBaseUrl()) {
      setPolicyCheck("error");
      setPolicyMessage("API URL is not configured (NEXT_PUBLIC_API_URL).");
      return;
    }
    try {
      const res = await fetch(apiUrl("policies/validate"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ policyId: formatPolicyClient(policyId) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPolicyCheck("error");
        setPolicyMessage(
          typeof data?.error === "string" ? data.error : "Validation failed.",
        );
        return;
      }
      if (data.exists) {
        setPolicyCheck("found");
        setPolicyMessage("This policy number is on file. You can submit your report.");
      } else {
        setPolicyCheck("not_found");
        setPolicyMessage(
          typeof data?.message === "string"
            ? data.message
            : "We could not find this policy. Double-check the number or contact your agent.",
        );
      }
    } catch {
      setPolicyCheck("error");
      setPolicyMessage("Network error. Try again in a moment.");
    }
  }, [policyId]);

  const onFile = (f: File | null) => {
    setSubmitError(null);
    setFile(f);
    setFileError(validateFile(f));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const pErr = validatePolicyFormat(policyId);
    const fErr = validateFile(file);
    setPolicyError(pErr);
    setFileError(fErr);
    if (pErr || fErr) return;

    if (policyCheck !== "found") {
      setSubmitError(
        "Verify your policy number before submitting. Use “Check policy” after entering it.",
      );
      return;
    }

    if (!getApiBaseUrl()) {
      setSubmitError("API URL is not configured (NEXT_PUBLIC_API_URL).");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("policyId", formatPolicyClient(policyId));
      fd.set("file", file!);

      const res = await fetch(apiUrl("claims"), {
        method: "POST",
        headers: authHeaders(),
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(
          typeof data?.error === "string"
            ? data.error
            : "Submission failed. Please try again.",
        );
        return;
      }
      router.push("/claims?success=1");
      router.refresh();
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          New claim report
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Enter the policy number exactly as it appears on your policy documents,
          then upload a single PDF with the information we need to open your
          claim.
        </p>
      </div>

      <form
        onSubmit={(e) => void onSubmit(e)}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        noValidate
      >
        <div>
          <label
            htmlFor={policyFieldId}
            className="block text-sm font-medium text-slate-800"
          >
            Policy number
          </label>
          <p id={`${policyFieldId}-hint`} className="mt-1 text-xs text-slate-500">
            Example: POL-2024-001 (demo policies are listed on the claim reports page).
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <input
              id={policyFieldId}
              name="policyId"
              type="text"
              autoComplete="off"
              value={policyId}
              onChange={(e) => {
                setPolicyId(e.target.value);
                setPolicyCheck("idle");
                setPolicyMessage(null);
                setPolicyError(null);
              }}
              aria-invalid={!!policyError}
              aria-describedby={`${policyFieldId}-hint`}
              className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner outline-none ring-slate-900/5 transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
              placeholder="e.g. POL-2024-001"
            />
            <button
              type="button"
              onClick={() => void verifyPolicy()}
              disabled={submitting}
              className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {policyCheck === "checking" ? (
                <span className="inline-flex items-center gap-2">
                  <SpinnerSm />
                  Checking…
                </span>
              ) : (
                "Check policy"
              )}
            </button>
          </div>
          {policyMessage && (
            <p
              className={`mt-2 text-sm ${
                policyCheck === "found"
                  ? "text-emerald-800"
                  : policyCheck === "not_found" || policyCheck === "error"
                    ? "text-rose-800"
                    : "text-slate-700"
              }`}
              role="status"
            >
              {policyMessage}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-800">
            Supporting PDF
          </label>
          <p className="mt-1 text-xs text-slate-500">
            One PDF, up to 10 MB. Include forms or notes that describe the incident.
          </p>
          <div
            className={`mt-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
              dragActive
                ? "border-slate-400 bg-slate-50"
                : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
            }`}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const dropped = e.dataTransfer.files?.[0];
              onFile(dropped ?? null);
            }}
          >
            <input
              id={fileFieldId}
              name="file"
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
            <label
              htmlFor={fileFieldId}
              className="cursor-pointer text-sm text-slate-700"
            >
              <span className="font-medium text-slate-900">Choose a file</span>
              <span className="text-slate-600"> or drag and drop here</span>
            </label>
            {file && (
              <div className="mt-3 text-xs text-slate-600">
                <span className="font-medium text-slate-800">{file.name}</span>
                <span className="mx-2 text-slate-300">·</span>
                {(file.size / 1024).toFixed(1)} KB
              </div>
            )}
          </div>
        </div>

        {(policyError || fileError) && (
          <div className="space-y-1 text-sm text-rose-800" role="alert">
            {policyError && <p>{policyError}</p>}
            {fileError && <p>{fileError}</p>}
          </div>
        )}
        {submitError && (
          <p className="text-sm text-rose-800" role="alert">
            {submitError}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
          <Link
            href="/claims"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-slate-900 px-5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <SpinnerSm />
                Submitting…
              </span>
            ) : (
              "Submit report"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function SpinnerSm() {
  return (
    <svg
      className="h-4 w-4 animate-spin text-current"
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
