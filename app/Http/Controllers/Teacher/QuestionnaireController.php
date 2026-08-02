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

        // Get KRAs and objectives from active configuration
        $kras = [];
        if ($activeConfig) {
            // Debug: Log configuration data
            \Log::info('Active Config:', [
                'id' => $activeConfig->id,
                'school_year' => $activeConfig->school_year,
                'selected_objective_ids' => $activeConfig->selected_objective_ids,
                'objectives_per_kra' => $activeConfig->objectives_per_kra,
            ]);
            
            // Get selected objective IDs from configuration
            $selectedObjectiveIds = is_array($activeConfig->selected_objective_ids) ? $activeConfig->selected_objective_ids : [];
            
            \Log::info('Selected Objective IDs:', $selectedObjectiveIds);
            
            // Load default objectives and group by KRA
            if (!empty($selectedObjectiveIds)) {
                $objectives = \App\Models\Objective::whereIn('id', $selectedObjectiveIds)
                    ->whereNull('ipcrf_configuration_id') // Only default objectives
                    ->with('kra')
                    ->orderBy('order')
                    ->get();
                
                \Log::info('Loaded Objectives Count:', ['count' => $objectives->count()]);
                
                // Group objectives by KRA
                $kraGroups = $objectives->groupBy('kra_id');
                
                foreach ($kraGroups as $kraId => $kraObjectives) {
                    $firstObj = $kraObjectives->first();
                    if ($firstObj && $firstObj->kra) {
                        $kras[] = [
                            'id' => $firstObj->kra->id,
                            'name' => $firstObj->kra->name,
                            'objectives' => $kraObjectives->map(function($obj) {
                                return [
                                    'id' => $obj->id,
                                    'code' => $obj->code,
                                    'description' => $obj->description,
                                ];
                            })->toArray()
                        ];
                    }
                }
            }
            
            // Get custom KRAs and objectives for this configuration
            $customKras = \App\Models\Kra::where('ipcrf_configuration_id', $activeConfig->id)
                ->where('is_custom', true)
                ->with(['objectives' => function($q) use ($activeConfig) {
                    $q->where('ipcrf_configuration_id', $activeConfig->id)
                      ->where('is_custom', true)
                      ->orderBy('order');
                }])
                ->orderBy('order')
                ->get();
            
            \Log::info('Custom KRAs Count:', ['count' => $customKras->count()]);
            
            foreach ($customKras as $customKra) {
                $kras[] = [
                    'id' => 'custom_' . $customKra->id,
                    'name' => $customKra->name,
                    'is_custom' => true,
                    'objectives' => $customKra->objectives->map(function($obj) {
                        return [
                            'id' => 'custom_' . $obj->id,
                            'code' => $obj->code,
                            'description' => $obj->description,
                            'is_custom' => true,
                        ];
                    })->toArray()
                ];
            }
            
            // Get custom objectives for existing KRAs
            $customObjectives = \App\Models\Objective::where('ipcrf_configuration_id', $activeConfig->id)
                ->where('is_custom', true)
                ->whereNotNull('kra_id')
                ->with('kra')
                ->orderBy('order')
                ->get();
            
            \Log::info('Custom Objectives Count:', ['count' => $customObjectives->count()]);
            
            foreach ($customObjectives as $customObj) {
                // Find the KRA in our array
                $kraIndex = collect($kras)->search(function($k) use ($customObj) {
                    return $k['id'] === $customObj->kra_id;
                });
                
                if ($kraIndex !== false) {
                    $kras[$kraIndex]['objectives'][] = [
                        'id' => 'custom_' . $customObj->id,
                        'code' => $customObj->code,
                        'description' => $customObj->description,
                        'is_custom' => true,
                    ];
                }
            }
            
            \Log::info('Final KRAs Count:', ['count' => count($kras)]);
        }

        return Inertia::render('Teacher/Questionnaire', [
            'questionnaire' => $questionnaire,
            'schoolYear' => $schoolYear,
            'user' => auth()->user(),
            'kras' => $kras,
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
