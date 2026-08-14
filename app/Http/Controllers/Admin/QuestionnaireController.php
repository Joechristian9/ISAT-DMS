<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TeacherQuestionnaire;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuestionnaireController extends Controller
{
    public function index(Request $request)
    {
        $query = TeacherQuestionnaire::with('teacher')
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by school year
        if ($request->school_year) {
            $query->where('school_year', $request->school_year);
        }

        // Search by teacher name
        if ($request->search) { 
            $query->whereHas('teacher', function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            });
        }

        // Get all questionnaires
        $questionnaires = $query->get();

        // Get unique school years
        $schoolYears = TeacherQuestionnaire::select('school_year')
            ->distinct()
            ->orderBy('school_year', 'desc')
            ->pluck('school_year');

        // Calculate statistics
        $stats = [
            'total_submissions' => TeacherQuestionnaire::when($request->school_year, function($q) use ($request) {
                return $q->where('school_year', $request->school_year);
            })->count(),
            
            'submitted' => TeacherQuestionnaire::where('status', 'submitted')
                ->when($request->school_year, function($q) use ($request) {
                    return $q->where('school_year', $request->school_year);
                })->count(),
            
            'draft' => TeacherQuestionnaire::where('status', 'draft')
                ->when($request->school_year, function($q) use ($request) {
                    return $q->where('school_year', $request->school_year);
                })->count(),
            
            'reviewed' => TeacherQuestionnaire::where('status', 'reviewed')
                ->when($request->school_year, function($q) use ($request) {
                    return $q->where('school_year', $request->school_year);
                })->count(),
            
            'average_years_of_service' => TeacherQuestionnaire::when($request->school_year, function($q) use ($request) {
                return $q->where('school_year', $request->school_year);
            })->whereNotNull('years_of_service')->avg('years_of_service'),
            
            'average_age' => TeacherQuestionnaire::when($request->school_year, function($q) use ($request) {
                return $q->where('school_year', $request->school_year);
            })->whereNotNull('age')->avg('age'),
        ];

        return Inertia::render('Admin/QuestionnaireResults', [
            'questionnaires' => $questionnaires,
            'schoolYears' => $schoolYears,
            'filters' => [
                'status' => $request->status ?? 'all',
                'school_year' => $request->school_year,
                'search' => $request->search,
            ],
            'stats' => $stats,
        ]);
    }

    public function show(TeacherQuestionnaire $questionnaire)
    {
        $questionnaire->load('teacher');
        
        return Inertia::render('Admin/QuestionnaireDetail', [
            'questionnaire' => $questionnaire,
        ]);
    }

    public function updateStatus(Request $request, TeacherQuestionnaire $questionnaire)
    {
        $request->validate([
            'status' => 'required|in:draft,submitted,reviewed',
        ]);

        $questionnaire->update([
            'status' => $request->status,
        ]);

        return back()->with('success', 'Questionnaire status updated successfully!');
    }
}
