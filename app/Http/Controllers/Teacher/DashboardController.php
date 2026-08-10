<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\IpcrfConfiguration;
use App\Models\TeacherSubmission;
use App\Models\SignedIpcrf;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $teacherId = auth()->id();
        
        // Get active configuration
        $activeConfig = IpcrfConfiguration::where('is_active', true)->first();
        
        // Get current year submissions
        $submissions = [];
        $signedIpcrf = null;
        
        if ($activeConfig) {
            $submissions = TeacherSubmission::where('teacher_id', $teacherId)
                ->where('school_year', $activeConfig->school_year)
                ->get();
                
            $signedIpcrf = SignedIpcrf::where('teacher_id', $teacherId)
                ->where('school_year', $activeConfig->school_year)
                ->first();
        }
        
        return Inertia::render('Teacher/Dashboard', [
            'user' => auth()->user(),
            'activeConfig' => $activeConfig,
            'submissions' => $submissions,
            'signedIpcrf' => $signedIpcrf,
        ]);
    }
}
