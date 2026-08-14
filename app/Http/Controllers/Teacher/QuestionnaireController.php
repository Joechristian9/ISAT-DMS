<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\TeacherQuestionnaire;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuestionnaireController extends Controller
{
    public function index()
    {
        // Get active IPCRF configuration
        $activeConfig = \App\Models\IpcrfConfiguration::where('is_active', true)->first();
        
        $schoolYear = $activeConfig ? $activeConfig->school_year : '2024-2025';
        
        // Get or create questionnaire for current year
        $questionnaire = TeacherQuestionnaire::firstOrCreate(
            [
                'teacher_id' => auth()->id(),
                'school_year' => $schoolYear,
            ],
            [
                'status' => 'draft',
            ]
        );

        return Inertia::render('Teacher/Questionnaire', [
            'questionnaire' => $questionnaire,
            'schoolYear' => $schoolYear,
            'user' => auth()->user(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'sex' => 'nullable|string|max:50',
            'years_of_service' => 'nullable|string|max:50',
            'last_ipcr_rating' => 'nullable|string|max:50',
            'responses' => 'required|array',
            'school_year' => 'nullable|string',
            'status' => 'required|in:draft,submitted',
        ]);

        // Get the school year from request or active configuration
        $schoolYear = $request->school_year;
        if (!$schoolYear) {
            $activeConfig = \App\Models\IpcrfConfiguration::where('is_active', true)->first();
            $schoolYear = $activeConfig ? $activeConfig->school_year : '2024-2025';
        }

        $questionnaire = TeacherQuestionnaire::updateOrCreate(
            [
                'teacher_id' => auth()->id(),
                'school_year' => $schoolYear,
            ],
            [
                'name' => $request->name,
                'sex' => $request->sex,
                'years_of_service' => $request->years_of_service,
                'last_ipcr_rating' => $request->last_ipcr_rating,
                'responses' => $request->responses,
                'status' => $request->status,
                'submitted_at' => $request->status === 'submitted' ? now() : null,
            ]
        );

        return back()->with('success', $request->status === 'submitted' 
            ? 'Thank you! Your feedback has been submitted successfully.' 
            : 'Draft saved successfully!');
    }
}
