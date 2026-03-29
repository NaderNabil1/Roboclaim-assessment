<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Mail\UserClaimReportStatusChangedMail;
use App\Models\ClaimReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class AdminClaimReportController extends Controller
{
    public function index()
    {
        $reports = ClaimReport::query()
            ->with([
                'policy:id,policy_number',
                'user:id,first_name,last_name,email',
            ])
            ->orderByDesc('created_at')
            ->get();

        $claims = $reports->map(fn (ClaimReport $r) => $this->serializeAdminClaim($r));

        return response()->json(['claims' => $claims]);
    }

    public function update(Request $request, ClaimReport $claimReport)
    {
        $data = $request->validate([
            'status' => 'required|string|in:submitted,under_review,approved,rejected',
        ]);

        $previousStatus = $claimReport->status;
        $claimReport->update(['status' => $data['status']]);
        $claimReport->load(['policy:id,policy_number', 'user:id,first_name,last_name,email']);

        $submitter = $claimReport->user;
        if ($previousStatus !== $claimReport->status && $submitter) {
            try {
                Mail::to($submitter->email)->send(
                    new UserClaimReportStatusChangedMail($claimReport, $submitter, $previousStatus),
                );
            } catch (\Throwable $e) {
                Log::error('Error sending user claim report status changed email', [
                    'exception' => $e,
                    'recipient' => $submitter->email,
                    'claim_report_id' => $claimReport->id,
                ]);
            }
        }

        return response()->json([
            'claim' => $this->serializeAdminClaim($claimReport),
        ]);
    }

    private function serializeAdminClaim(ClaimReport $r): array
    {
        $r->loadMissing(['policy', 'user']);

        return [
            'id' => (string) $r->id,
            'policyId' => $r->policy->policy_number,
            'submittedAt' => $r->created_at->toIso8601String(),
            'status' => $r->status,
            'documentName' => $r->document_name,
            'documentAvailable' => Storage::disk('local')->exists($r->document_path),
            'submitter' => [
                'id' => (string) $r->user->id,
                'firstName' => $r->user->first_name,
                'lastName' => $r->user->last_name,
                'email' => $r->user->email,
            ],
        ];
    }
}
