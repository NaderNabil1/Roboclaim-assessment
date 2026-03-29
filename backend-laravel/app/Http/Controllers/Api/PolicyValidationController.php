<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Policy;
use Illuminate\Http\Request;

class PolicyValidationController extends Controller
{
    public function validatePolicy(Request $request)
    {
        $request->validate([
            'policyId' => 'required|string|max:64',
        ]);


        $number = trim($request->input('policyId'));
        $policy = Policy::query()->where('policy_number', $number)->where('user_id', auth('api')->id())->first();

        if (! $policy) {
            return response()->json([
                'ok' => true,
                'exists' => false,
                'policyId' => $number,
            ]);
        }

        if ($policy->status !== Policy::STATUS_ACTIVE) {
            return response()->json([
                'ok' => true,
                'exists' => false,
                'policyId' => $number,
                'message' => 'This policy is not active. Contact support if you need help.',
            ]);
        }

        return response()->json([
            'ok' => true,
            'exists' => true,
            'policyId' => $number,
        ]);
    }
}
