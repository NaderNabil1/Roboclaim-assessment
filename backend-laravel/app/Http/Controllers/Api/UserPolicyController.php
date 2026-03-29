<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\AdminNewPolicyMail;
use App\Mail\UserPolicySubmittedMail;
use App\Models\Policy;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

class UserPolicyController extends Controller
{
    public function index(Request $request)
    {
        /** @var User $user */
        $user = auth('api')->user();
        if ($user->isAdmin()) {
            return response()->json([
                'message' => 'Use the admin API to list all policies.',
            ], 403);
        }

        $policies = Policy::query()
            ->where('user_id', $user->id)
            ->orderByDesc('updated_at')
            ->get();

        return response()->json([
            'policies' => $policies->map(fn (Policy $p) => $this->serializeUserPolicy($p)),
        ]);
    }

    public function store(Request $request)
    {
        /** @var User $user */
        $user = auth('api')->user();
        if ($user->isAdmin()) {
            return response()->json([
                'message' => 'Admins create policies from the admin policies screen.',
            ], 403);
        }

        $data = $request->validate([
            'policyNumber' => [
                'required',
                'string',
                'min:3',
                'max:64',
                'regex:/^[A-Za-z0-9-]+$/',
                Rule::unique('policies', 'policy_number'),
            ],
        ]);

        $number = trim($data['policyNumber']);

        $policy = Policy::create([
            'user_id' => $user->id,
            'policy_number' => $number,
            'status' => Policy::STATUS_PENDING,
        ]);

        try {
            Mail::to($user->email)->send(new UserPolicySubmittedMail($policy, $user));
        } catch (\Throwable $e) {
            Log::error('Error sending user policy submitted email', [
                'exception' => $e,
                'recipient' => $user->email,
                'policy_id' => $policy->id,
            ]);
        }

        foreach (User::adminEmailAddresses() as $adminEmail) {
            try {
                Mail::to($adminEmail)->send(new AdminNewPolicyMail($policy));
            } catch (\Throwable $e) {
                Log::error('Error sending admin new policy email', [
                    'exception' => $e,
                    'recipient' => $adminEmail,
                    'policy_id' => $policy->id,
                ]);
            }
        }

        return response()->json([
            'policy' => $this->serializeUserPolicy($policy),
        ], 201);
    }

    private function serializeUserPolicy(Policy $p): array
    {
        return [
            'id' => (string) $p->id,
            'policyNumber' => $p->policy_number,
            'status' => $p->status,
            'updatedAt' => $p->updated_at->toIso8601String(),
        ];
    }
}
