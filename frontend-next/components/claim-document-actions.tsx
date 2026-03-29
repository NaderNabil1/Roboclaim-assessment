"use client";

import { useState } from "react";
import { apiUrl, authHeaders } from "@/lib/api-client";

type Props = {
  claimId: string;
  documentName: string;
  documentAvailable?: boolean;
  compact?: boolean;
};

export function ClaimDocumentActions({
  claimId,
  documentName,
  documentAvailable = true,
  compact = false,
}: Props) {
  const [busy, setBusy] = useState<"view" | "download" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!documentAvailable) {
    return (
      <span className="text-xs text-slate-400" title="File missing on server">
        No file
      </span>
    );
  }

  const run = async (mode: "view" | "download") => {
    setError(null);
    setBusy(mode);
    try {
      const q = mode === "download" ? "?download=1" : "";
      const res = await fetch(`${apiUrl(`claims/${claimId}/document`)}${q}`, {
        headers: authHeaders(),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (mode === "view") {
        window.open(url, "_blank", "noopener,noreferrer");
        window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = documentName || "claim-document.pdf";
        a.rel = "noopener";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open document.");
    } finally {
      setBusy(null);
    }
  };

  const btn =
    "inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className={compact ? "inline-flex flex-wrap gap-1.5" : "flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2"}>
      <button
        type="button"
        className={btn}
        disabled={busy !== null}
        onClick={() => void run("view")}
      >
        {busy === "view" ? "Opening…" : "View PDF"}
      </button>
      <button
        type="button"
        className={btn}
        disabled={busy !== null}
        onClick={() => void run("download")}
      >
        {busy === "download" ? "Preparing…" : "Download"}
      </button>
      {error && (
        <span className="text-xs text-rose-700" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
