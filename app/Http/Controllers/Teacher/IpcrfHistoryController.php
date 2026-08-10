<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\IpcrfRating;
use App\Models\TeacherSubmission;
use App\Models\SignedIpcrf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IpcrfHistoryController extends Controller
{
    public function index()
    {
        $teacherId = auth()->id();

        // Get all IPCRF ratings for this teacher, grouped by school year
        $ratings = IpcrfRating::where('teacher_id', $teacherId)
            ->orderBy('school_year', 'desc')
            ->get()
            ->groupBy('school_year');

        // Get all submissions grouped by school year
        $submissions = TeacherSubmission::where('teacher_id', $teacherId)
            ->with(['objective', 'competency'])
            ->orderBy('school_year', 'desc')
            ->get()
            ->groupBy('school_year');

        // Get all signed IPCRFs
        $signedIpcrfs = SignedIpcrf::where('teacher_id', $teacherId)
            ->orderBy('school_year', 'desc')
            ->get()
            ->groupBy('school_year');

        // Combine all data by school year
        $historyData = [];
        
        // Get all unique school years
        $schoolYears = collect()
            ->merge($ratings->keys())
            ->merge($submissions->keys())
            ->merge($signedIpcrfs->keys())
            ->unique()
            ->sort()
            ->reverse()
            ->values();

        foreach ($schoolYears as $year) {
            $rating = $ratings->get($year)?->first();
            
            $historyData[] = [
                'school_year' => $year,
                'rating' => $rating ? [
                    'numerical_rating' => $rating->numerical_rating,
                    'total_score' => $rating->total_score,
                    'performance_level' => $rating->performance_level,
                    'status' => $rating->status,
                    'submitted_at' => $rating->created_at,
                ] : null,
                'submissions_count' => $submissions->get($year)?->count() ?? 0,
                'signed_ipcrf' => $signedIpcrfs->get($year)?->first(),
            ];
        }

        return Inertia::render('Teacher/IpcrfHistory', [
            'historyData' => $historyData,
            'user' => auth()->user(),
        ]);
    }
}
