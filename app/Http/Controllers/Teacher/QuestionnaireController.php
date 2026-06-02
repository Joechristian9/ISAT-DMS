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
        $currentYear = '2024-2025';
        
        // Get or create questionnaire for current year
        $questionnaire = TeacherQuestionnaire::firstOrCreate(
            [
                'teacher_id' => auth()->id(),
                'school_year' => $currentYear,
            ],
            [
                'status' => 'draft',
            ]
        );

        return Inertia::render('Teacher/Questionnaire', [
            'questionnaire' => $questionnaire,
            'schoolYear' => $currentYear,
            'user' => auth()->user(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'nullable|string|max:255',
            'age' => 'nullable|integer|min:18|max:100',
            'teaching_position' => 'nullable|string|max:255',
            'years_of_service' => 'nullable|integer|min:0',
            'bachelors_degree' => 'nullable|string|max:255',
            'year_level_assignment' => 'nullable|string|max:255',
            'subject_taught' => 'nullable|string|max:255',
            'trainings_attended' => 'nullable|string',
            'kra_ratings' => 'nullable|array',
            'challenges' => 'nullable|array',
            'status' => 'required|in:draft,submitted',
        ]);

        $questionnaire = TeacherQuestionnaire::updateOrCreate(
            [
                'teacher_id' => auth()->id(),
                'school_year' => $request->school_year ?? '2024-2025',
            ],
            [
                'name' => $request->name,
                'age' => $request->age,
                'teaching_position' => $request->teaching_position,
                'years_of_service' => $request->years_of_service,
                'bachelors_degree' => $request->bachelors_degree,
                'year_level_assignment' => $request->year_level_assignment,
                'subject_taught' => $request->subject_taught,
                'trainings_attended' => $request->trainings_attended,
                'kra_ratings' => $request->kra_ratings,
                'challenges' => $request->challenges,
                'status' => $request->status,
                'submitted_at' => $request->status === 'submitted' ? now() : null,
            ]
        );

        return back()->with('success', $request->status === 'submitted' 
            ? 'Questionnaire submitted successfully!' 
            : 'Questionnaire saved as draft!');
    }
}
