import { ClaimSuccessBanner } from "@/components/claim-success-banner";
import { ClaimsList } from "@/components/claims-list";

export default function ClaimsPage() {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Your dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Register policy numbers under{" "}
          <span className="font-medium text-slate-800">My policies</span>{" "}
          (pending until an admin activates them), review claim reports, file
          new reports, or message an administrator from{" "}
          <span className="font-medium text-slate-800">Contact admin</span>.
        </p>
      </div>
      <ClaimSuccessBanner />
      <ClaimsList />
    </div>
  );
}
