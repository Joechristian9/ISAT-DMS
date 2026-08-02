<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Objective extends Model
{
    use HasFactory;

    protected $fillable = [
        'kra_id',
        'code',
        'description',
        'order',
        'weight',
        'is_active',
        'ipcrf_configuration_id',
        'is_custom',
    ];

    protected $casts = [
        'weight' => 'decimal:2',
        'is_active' => 'boolean',
        'is_custom' => 'boolean',
    ];

    public function kra()
    {
        return $this->belongsTo(Kra::class);
    }

    public function competencies()
    {
        return $this->hasMany(Competency::class);
    }

    public function submissions()
    {
        return $this->hasMany(TeacherSubmission::class);
    }
}
