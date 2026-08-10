<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\IpcrfRating;
use App\Models\TeacherSubmission;
use App\Models\User;
use App\Models\IpcrfConfiguration;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IpcrfHistoryController extends Controller
{
    public function index(Request $request)
    {
        // Get filter parameters
        $schoolYear = $request->school_year;
        $teacherId = $request->teacher_id;

        // Get all school years from ratings (using rating_period)
        $schoolYears = IpcrfRating::select('rating_period')
            ->distinct()
            ->orderBy('rating_period', 'desc')
            ->pluck('rating_period');

        // Get all teachers with role 'teacher'
        $teachers = User::role('teacher')
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        // Build query for ratings
        $query = IpcrfRating::with(['teacher.currentPosition']);

        if ($schoolYear) {
            $query->where('rating_period', $schoolYear);
        }

        if ($teacherId) {
            $query->where('teacher_id', $teacherId);
        }

        // Get ALL ratings without pagination
        $ratings = $query->orderBy('rating_period', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        // Get statistics for the selected filters
        $stats = [
            'total_submissions' => TeacherSubmission::when($schoolYear, function ($q) use ($schoolYear) {
                return $q->where('school_year', $schoolYear);
            })->when($teacherId, function ($q) use ($teacherId) {
                return $q->where('teacher_id', $teacherId);
            })->count(),
            
            'total_ratings' => IpcrfRating::when($schoolYear, function ($q) use ($schoolYear) {
                return $q->where('rating_period', $schoolYear);
            })->when($teacherId, function ($q) use ($teacherId) {
                return $q->where('teacher_id', $teacherId);
            })->count(),
            
            'average_rating' => IpcrfRating::when($schoolYear, function ($q) use ($schoolYear) {
                return $q->where('rating_period', $schoolYear);
            })->when($teacherId, function ($q) use ($teacherId) {
                return $q->where('teacher_id', $teacherId);
            })->avg('numerical_rating'),
        ];

        return Inertia::render('Admin/IpcrfHistory', [
            'ratings' => $ratings,
            'schoolYears' => $schoolYears,
            'teachers' => $teachers,
            'filters' => [
                'school_year' => $schoolYear,
                'teacher_id' => $teacherId,
            ],
            'stats' => $stats,
        ]);
    }
}
