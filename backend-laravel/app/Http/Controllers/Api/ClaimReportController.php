<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\AdminNewClaimReportMail;
use App\Mail\UserClaimReportUploadedMail;
use App\Models\ClaimReport;
use App\Models\Policy;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class ClaimReportController extends Controller
{
    private const MAX_BYTES = 10 * 1024 * 1024;

    public function index(Request $request)
    {
        $reports = ClaimReport::query()->where('user_id', auth('api')->id())->with('policy')->orderByDesc('created_at')->get();

        $claims = $reports->map(fn (ClaimReport $r) => $this->serializeClaim($r));

        return response()->json(['claims' => $claims]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'policyId' => 'required|string|max:64',
            'file' => 'required|file|max:10240',
        ]);

        $policyNumber = trim($request->input('policyId'));
        $policy = Policy::query()
            ->where('policy_number', $policyNumber)
            ->where('user_id', auth('api')->id())
            ->first();

        if (! $policy) {
            return response()->json([
                'ok' => false,
                'error' => 'This policy number was not found. Check the number on your documents or contact support.',
            ], 422);
        }

        if ($policy->status !== Policy::STATUS_ACTIVE) {
            return response()->json([
                'ok' => false,
                'error' => 'This policy is not active. You cannot submit a report against it.',
            ], 422);
        }

        $file = $request->file('file');
        $name = strtolower($file->getClientOriginalName());
        $mime = $file->getMimeType();
        $isPdf = $mime === 'application/pdf' || str_ends_with($name, '.pdf');
        if (! $isPdf) {
            return response()->json([
                'ok' => false,
                'error' => 'Only PDF files are accepted.',
            ], 400);
        }

        if ($file->getSize() > self::MAX_BYTES) {
            return response()->json([
                'ok' => false,
                'error' => 'PDF must be 10 MB or smaller.',
            ], 400);
        }

        $path = $file->store('claim-documents', 'local');
        $report = ClaimReport::create([
            'user_id' => auth('api')->id(),
            'policy_id' => $policy->id,
            'document_path' => $path,
            'document_name' => $file->getClientOriginalName(),
            'status' => 'submitted',
        ]);
        $report->load('policy');

        /** @var User $owner */
        $owner = auth('api')->user();

        try {
            Mail::to($owner->email)->send(new UserClaimReportUploadedMail($report, $owner));
        } catch (\Throwable $e) {
            Log::error('Error sending user claim report uploaded email', [
                'exception' => $e,
                'recipient' => $owner->email,
                'claim_report_id' => $report->id,
            ]);
        }

        foreach (User::adminEmailAddresses() as $adminEmail) {
            try {
                Mail::to($adminEmail)->send(new AdminNewClaimReportMail($report));
            } catch (\Throwable $e) {
                Log::error('Error sending admin new claim report email', [
                    'exception' => $e,
                    'recipient' => $adminEmail,
                    'claim_report_id' => $report->id,
                ]);
            }
        }

        return response()->json([
            'ok' => true,
            'claim' => $this->serializeClaim($report),
        ]);
    }

    private function serializeClaim(ClaimReport $r): array
    {
        $r->loadMissing('policy');

        return [
            'id' => (string) $r->id,
            'policyId' => $r->policy->policy_number,
            'submittedAt' => $r->created_at->toIso8601String(),
            'status' => $r->status,
            'documentName' => $r->document_name,
            'documentAvailable' => Storage::disk('local')->exists($r->document_path),
        ];
    }
}
