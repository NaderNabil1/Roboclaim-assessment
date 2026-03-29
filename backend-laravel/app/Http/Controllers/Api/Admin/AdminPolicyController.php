<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Mail\UserPolicyStatusChangedMail;
use App\Models\Policy;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

class AdminPolicyController extends Controller
{
    public function index()
    {
        $policies = Policy::query()
            ->with('user:id,first_name,last_name,email')
            ->orderByDesc('updated_at')
            ->get();

        $rows = $policies->map(fn (Policy $p) => $this->serializePolicy($p));

        return response()->json(['policies' => $rows]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'policyNumber' => [
                'required',
                'string',
                'min:3',
                'max:64',
                'regex:/^[A-Za-z0-9-]+$/',
                Rule::unique('policies', 'policy_number'),
            ],
            'ownerEmail' => ['required', 'email', 'exists:users,email'],
        ]);

        $owner = User::where('email', $data['ownerEmail'])->first();
        if ($owner->isAdmin()) {
            return response()->json([
                'message' => 'Assign policies to client accounts only (not admin users).',
            ], 422);
        }

        $number = trim($data['policyNumber']);

        $policy = Policy::create([
            'user_id' => $owner->id,
            'policy_number' => $number,
            'status' => Policy::STATUS_ACTIVE,
        ]);
        $policy->load('user:id,first_name,last_name,email');

        return response()->json([
            'policy' => $this->serializePolicy($policy),
        ], 201);
    }

    public function update(Request $request, Policy $policy)
    {
        $data = $request->validate([
            'status' => 'required|string|in:active,pending,suspended,cancelled',
        ]);

        $previousStatus = $policy->status;
        $policy->update(['status' => $data['status']]);
        $policy->load('user:id,first_name,last_name,email');

        $owner = $policy->user;
        if ($previousStatus !== $policy->status && $owner) {
            try {
                Mail::to($owner->email)->send(
                    new UserPolicyStatusChangedMail($policy, $owner, $previousStatus),
                );
            } catch (\Throwable $e) {
                Log::error('Error sending user policy status changed email', [
                    'exception' => $e,
                    'recipient' => $owner->email,
                    'policy_id' => $policy->id,
                ]);
            }
        }

        return response()->json([
            'policy' => $this->serializePolicy($policy),
        ]);
    }

    public function destroy(Policy $policy)
    {
        $policy->delete();

        return response()->json(['ok' => true]);
    }

    private function serializePolicy(Policy $p): array
    {
        $p->loadMissing('user:id,first_name,last_name,email');
        $u = $p->user;

        return [
            'id' => (string) $p->id,
            'policyNumber' => $p->policy_number,
            'status' => $p->status,
            'updatedAt' => $p->updated_at->toIso8601String(),
            'owner' => [
                'id' => (string) $u->id,
                'firstName' => $u->first_name,
                'lastName' => $u->last_name,
                'email' => $u->email,
            ],
        ];
    }
}
