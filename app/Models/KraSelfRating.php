<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KraSelfRating extends Model
{
    use HasFactory;

    /**
     * Self-rating carries 5% of the overall 100%; the objectives carry the
     * remaining 95%. The 5% is split evenly across the KRAs, since each KRA
     * gets its own self-rating upload.
     */
    public const TOTAL_WEIGHT = 5.00;

    /**
     * Weight assigned to a single KRA's self-rating.
     */
    public static function weightPerKra(int $kraCount): float
    {
        return $kraCount > 0 ? round(self::TOTAL_WEIGHT / $kraCount, 3) : 0.0;
    }

    protected $fillable = [
        'teacher_id',
        'kra_id',
        'school_year',
        'file_path',
        'original_name',
        'self_rating',
        'notes',
    ];

    protected $casts = [
        'self_rating' => 'decimal:2',
    ];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function kra()
    {
        return $this->belongsTo(Kra::class);
    }
}
