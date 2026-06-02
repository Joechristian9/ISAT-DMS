<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeacherQuestionnaire extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'school_year',
        'name',
        'age',
        'teaching_position',
        'years_of_service',
        'bachelors_degree',
        'year_level_assignment',
        'subject_taught',
        'trainings_attended',
        'kra_ratings',
        'challenges',
        'status',
        'submitted_at',
    ];

    protected $casts = [
        'kra_ratings' => 'array',
        'challenges' => 'array',
        'submitted_at' => 'datetime',
    ];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
}
