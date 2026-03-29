<?php

namespace App\Support;

final class EmailStatusLabels
{
    public static function policy(string $status): string
    {
        return match ($status) {
            'active' => 'Active',
            'pending' => 'Pending approval',
            'suspended' => 'Suspended',
            'cancelled' => 'Cancelled',
            default => ucfirst(str_replace('_', ' ', $status)),
        };
    }

    public static function claimReport(string $status): string
    {
        return match ($status) {
            'submitted' => 'Submitted',
            'under_review' => 'Under review',
            'approved' => 'Approved',
            'rejected' => 'Rejected',
            default => ucfirst(str_replace('_', ' ', $status)),
        };
    }
}
