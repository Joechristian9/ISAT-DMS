<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IpcrfRating extends Model
{
    protected $fillable = [
        'teacher_id',
        'rating_period',
        'numerical_rating',
        'status',
        'kra_details',
        'total_score',
        'remarks',
        'created_by',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'kra_details' => 'array',
        'numerical_rating' => 'decimal:2',
        'total_score' => 'decimal:2',
        'approved_at' => 'datetime',
    ];

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
