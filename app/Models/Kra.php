<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kra extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'order',
        'is_active',
        'ipcrf_configuration_id',
        'is_custom',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_custom' => 'boolean',
    ];

    public function objectives()
    {
        return $this->hasMany(Objective::class)->orderBy('order');
    }
}
