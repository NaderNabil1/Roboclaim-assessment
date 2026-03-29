"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function BannerInner() {
  const searchParams = useSearchParams();
  if (searchParams.get("success") !== "1") return null;

  return (
    <div
      className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-sm"
      role="status"
    >
      <p className="font-medium">Report submitted</p>
      <p className="mt-1 text-emerald-800/90">
        Your claim report and PDF were received. We will review your file and
        follow up if we need anything else.
      </p>
    </div>
  );
}

export function ClaimSuccessBanner() {
  return (
    <Suspense fallback={null}>
      <BannerInner />
    </Suspense>
  );
}
