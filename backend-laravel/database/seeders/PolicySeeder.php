<?php

namespace Database\Seeders;

use App\Models\ClaimReport;
use App\Models\Policy;
use App\Models\User;
use Illuminate\Database\Seeder;

class PolicySeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'user@test.com')->first();
        if (! $user) {
            return;
        }

        $p1 = Policy::create([
            'user_id' => $user->id,
            'policy_number' => 'POL-2024-001',
            'status' => Policy::STATUS_ACTIVE,
        ]);
        Policy::create([
            'user_id' => $user->id,
            'policy_number' => 'POL-2024-002',
            'status' => Policy::STATUS_ACTIVE,
        ]);
        $p3 = Policy::create([
            'user_id' => $user->id,
            'policy_number' => 'POL-2023-991',
            'status' => Policy::STATUS_ACTIVE,
        ]);
        Policy::create([
            'user_id' => $user->id,
            'policy_number' => 'DEMO-POLICY-1',
            'status' => Policy::STATUS_SUSPENDED,
        ]);

        $r1 = ClaimReport::create([
            'user_id' => $user->id,
            'policy_id' => $p1->id,
            'document_path' => 'seed/claim-summary-march.pdf',
            'document_name' => 'claim-summary-march.pdf',
            'status' => 'under_review',
        ]);
        $r1->forceFill([
            'created_at' => now()->subDays(5),
            'updated_at' => now()->subDays(5),
        ])->saveQuietly();

        $r2 = ClaimReport::create([
            'user_id' => $user->id,
            'policy_id' => $p3->id,
            'document_path' => 'seed/incident-report.pdf',
            'document_name' => 'incident-report.pdf',
            'status' => 'approved',
        ]);
        $r2->forceFill([
            'created_at' => now()->subDays(21),
            'updated_at' => now()->subDays(21),
        ])->saveQuietly();
    }
}
