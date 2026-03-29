<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClaimReport extends Model
{
    protected $fillable = [
        'user_id',
        'policy_id',
        'document_path',
        'document_name',
        'status',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function policy(): BelongsTo
    {
        return $this->belongsTo(Policy::class);
    }
}
