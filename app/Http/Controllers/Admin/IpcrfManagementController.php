<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kra;
use App\Models\Objective;
use App\Models\Competency;
use App\Models\TeacherSubmission;
use App\Models\IpcrfRating;
use App\Models\IpcrfConfiguration;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IpcrfManagementController extends Controller
{
    public function index()
    {
        $kras = Kra::with(['objectives.competencies'])
            ->orderBy('order')
            ->get();

        return Inertia::render('Admin/IpcrfManagement', [
            'kras' => $kras,
        ]);
    }

    public function submissions(Request $request)
    {
        $search = $request->input('search', '');
        $statusFilter = $request->input('status', '');
        $yearFilter = $request->input('year', '');

        // Active configurations are now defined per position tier
        $activeConfigs = IpcrfConfiguration::where('is_active', true)->get();
        $currentSchoolYear = $activeConfigs->first()->school_year ?? null;

        // Expected objective count per position tier, taken from each tier's configuration
        $objectiveTotalsByTier = $activeConfigs
            ->filter(fn ($config) => $config->position_tier)
            ->mapWithKeys(fn ($config) => [
                $config->position_tier => count($config->selected_objective_ids ?? []),
            ]);

        // Fallback for teachers with no tier (or no tier-specific configuration)
        $fallbackConfig = $activeConfigs->firstWhere('position_tier', null);
        $fallbackTotal = $fallbackConfig
            ? count($fallbackConfig->selected_objective_ids ?? [])
            : Objective::where('is_active', true)->count();

        $query = User::role('teacher')
            ->with([
                'currentPosition', 
                'ipcrfRatings' => function ($q) {
                    // Load ALL ratings for rating history display (no year filter here)
                    $q->orderBy('rating_period', 'desc')->orderBy('created_at', 'desc');
                },
                'teacherSubmissions' => function ($q) {
                    $q->latest()->limit(10);
                }
            ])
            ->withMax('ipcrfRatings as latest_rating_date', 'created_at')
            // Count MOV submissions for the current school year
            ->withCount(['teacherSubmissions as mov_uploads_count' => function ($q) use ($currentSchoolYear) {
                if ($currentSchoolYear) {
                    $q->where('school_year', $currentSchoolYear);
                }
            }]);

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        // Order by latest IPCRF rating submission date (most recent first)
        $teachers = $query->orderByDesc('latest_rating_date')
            ->orderBy('name') // Secondary sort by name for teachers without ratings
            ->paginate(10);

        // Parse division JSON for each teacher to get position tier info and the
        // objective total expected for that tier
        $teachers->getCollection()->transform(function ($teacher) use ($objectiveTotalsByTier, $fallbackTotal) {
            $divisionData = json_decode($teacher->division, true);
            $teacher->position_range = is_array($divisionData) ? ($divisionData['position_range'] ?? null) : null;
            $teacher->position_career_stage = is_array($divisionData) ? ($divisionData['career_stage'] ?? null) : null;
            $teacher->expected_movs = $objectiveTotalsByTier[$teacher->position_range] ?? $fallbackTotal;

            return $teacher;
        });

        // Get available years from ratings
        $availableYears = IpcrfRating::select('rating_period')
            ->distinct()
            ->orderBy('rating_period', 'desc')
            ->pluck('rating_period');

        // Get KRAs for rating form
        $kras = Kra::with('objectives')->orderBy('order')->get();

        return Inertia::render('Admin/IpcrfSubmissions', [
            'teachers' => $teachers,
            'availableYears' => $availableYears,
            'kras' => $kras,
            'totalObjectives' => $fallbackTotal,
            'currentSchoolYear' => $currentSchoolYear,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
                'year' => $yearFilter,
            ],
        ]);
    }

    public function rateTeacher(User $teacher, Request $request)
    {
        // Ensure the user is a teacher
        if (!$teacher->hasRole('teacher')) {
            return redirect()->route('admin.ipcrf.submissions')
                ->with('error', 'Invalid teacher selected.');
        }

        // Get school year from request, default to current active config
        $schoolYear = $request->input('school_year');
        
        // If no school year provided, get from active configuration
        if (!$schoolYear) {
            $activeConfig = \App\Models\IpcrfConfiguration::where('is_active', true)->first();
            $schoolYear = $activeConfig ? $activeConfig->school_year : null;
        }

        // Get available school years for this teacher
        $availableYears = TeacherSubmission::where('teacher_id', $teacher->id)
            ->select('school_year')
            ->distinct()
            ->orderBy('school_year', 'desc')
            ->pluck('school_year');

        // Get teacher's IPCRF submissions with related data for selected year
        $query = TeacherSubmission::where('teacher_id', $teacher->id)
            ->with(['objective', 'competency']);
        
        if ($schoolYear) {
            $query->where('school_year', $schoolYear);
        }
        
        $submissions = $query->orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/RateIpcrfPdf', [
            'teacher' => $teacher->load('currentPosition'),
            'submissions' => $submissions,
            'availableYears' => $availableYears,
            'selectedYear' => $schoolYear,
            'auth' => [
                'user' => auth()->user()->load('roles'),
            ],
        ]);
    }

    public function storeSubmissionRatings(Request $request)
    {
        $request->validate([
            'teacher_id' => 'required|exists:users,id',
            'ratings' => 'required|array',
            'ratings.*.submission_id' => 'required|exists:teacher_submissions,id',
            'ratings.*.rating' => 'required|integer|min:1|max:5',
        ], [
            'ratings.required' => 'Please provide ratings for all submissions.',
            'ratings.*.rating.required' => 'Each submission must have a rating.',
            'ratings.*.rating.min' => 'Rating must be at least 1 star.',
            'ratings.*.rating.max' => 'Rating cannot exceed 5 stars.',
        ]);

        $teacherId = $request->teacher_id;
        $totalRating = 0;
        $submissionCount = count($request->ratings);

        // Update each submission with its rating
        foreach ($request->ratings as $ratingData) {
            TeacherSubmission::where('id', $ratingData['submission_id'])
                ->update([
                    'rating' => $ratingData['rating'],
                    'status' => 'reviewed',
                    'reviewed_by' => auth()->id(),
                    'reviewed_at' => now(),
                ]);
            
            $totalRating += $ratingData['rating'];
        }

        // Calculate average rating
        $averageRating = $submissionCount > 0 ? round($totalRating / $submissionCount, 2) : 0;

        // Get current year for rating period
        $ratingPeriod = now()->year . '-' . (now()->year + 1);

        // Create or update IPCRF Rating record
        $ipcrfRating = IpcrfRating::updateOrCreate(
            [
                'teacher_id' => $teacherId,
                'rating_period' => $ratingPeriod,
            ],
            [
                'numerical_rating' => $averageRating,
                'total_score' => $averageRating * 20, // Convert to 100-point scale
                'status' => 'submitted',
                'created_by' => auth()->id(),
                'kra_details' => [], // Empty for now, can be populated later
                'remarks' => 'Auto-generated from submission ratings',
            ]
        );

        return redirect()->route('admin.ipcrf.submissions')
            ->with('success', 'All ratings submitted successfully! Average rating: ' . $averageRating . '/5')
            ->with('show_survey', true)
            ->with('rating_data', [
                'rating_id' => $ipcrfRating->id,
                'teacher_id' => $teacherId,
                'school_year' => $ratingPeriod,
            ]);
    }

    public function storeRating(Request $request)
    {
        $request->validate([
            'teacher_id' => 'required|exists:users,id',
            'rating_period' => 'required|string',
            'kra_details' => 'required|array',
            'remarks' => 'nullable|string',
        ]);

        // Calculate total score and average rating from KRA details
        $totalScore = 0;
        $totalRatings = 0;
        $objectiveCount = 0;

        foreach ($request->kra_details as $kra) {
            $totalScore += $kra['score'] ?? 0;
            
            // Sum up all objective ratings
            if (isset($kra['objectives'])) {
                foreach ($kra['objectives'] as $objective) {
                    $totalRatings += $objective['rating'] ?? 0;
                    $objectiveCount++;
                }
            }
        }

        // Calculate average rating (1-5 scale)
        $numericalRating = $objectiveCount > 0 ? $totalRatings / $objectiveCount : 0;

        $rating = IpcrfRating::create([
            'teacher_id' => $request->teacher_id,
            'rating_period' => $request->rating_period,
            'kra_details' => $request->kra_details,
            'total_score' => round($totalScore, 2),
            'numerical_rating' => round($numericalRating, 2),
            'remarks' => $request->remarks,
            'status' => 'draft',
            'created_by' => auth()->id(),
        ]);

        return back()->with('success', 'IPCRF rating created successfully!');
    }

    public function updateRating(Request $request, IpcrfRating $rating)
    {
        $request->validate([
            'kra_details' => 'required|array',
            'remarks' => 'nullable|string',
            'status' => 'nullable|in:draft,submitted,approved',
        ]);

        // Calculate total score and average rating
        $totalScore = 0;
        $totalRatings = 0;
        $objectiveCount = 0;

        foreach ($request->kra_details as $kra) {
            $totalScore += $kra['score'] ?? 0;
            
            // Sum up all objective ratings
            if (isset($kra['objectives'])) {
                foreach ($kra['objectives'] as $objective) {
                    $totalRatings += $objective['rating'] ?? 0;
                    $objectiveCount++;
                }
            }
        }

        // Calculate average rating (1-5 scale)
        $numericalRating = $objectiveCount > 0 ? $totalRatings / $objectiveCount : 0;

        $updateData = [
            'kra_details' => $request->kra_details,
            'total_score' => round($totalScore, 2),
            'numerical_rating' => round($numericalRating, 2),
            'remarks' => $request->remarks,
        ];

        if ($request->status) {
            $updateData['status'] = $request->status;
            if ($request->status === 'approved') {
                $updateData['approved_by'] = auth()->id();
                $updateData['approved_at'] = now();
            }
        }

        $rating->update($updateData);

        return back()->with('success', 'IPCRF rating updated successfully!');
    }

    public function review(Request $request, TeacherSubmission $submission)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'feedback' => 'nullable|string|max:1000',
        ]);

        $submission->update([
            'rating' => $request->rating,
            'feedback' => $request->feedback,
            'status' => 'reviewed',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Submission reviewed successfully!');
    }

    // KRA Management
    public function storeKra(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'order' => 'required|integer',
        ]);

        Kra::create($request->all());

        return back()->with('success', 'KRA created successfully!');
    }

    public function updateKra(Request $request, Kra $kra)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'order' => 'required|integer',
        ]);

        $kra->update($request->all());

        return back()->with('success', 'KRA updated successfully!');
    }

    // Objective Management
    public function storeObjective(Request $request)
    {
        $request->validate([
            'kra_id' => 'required|exists:kras,id',
            'code' => 'required|string|max:50',
            'description' => 'required|string',
            'weight' => 'required|numeric|min:0|max:100',
            'order' => 'required|integer',
        ]);

        $objective = Objective::create($request->all());

        // Create competency if type is provided
        if ($request->competency_type) {
            Competency::create([
                'objective_id' => $objective->id,
                'type' => $request->competency_type,
                'weight' => $request->weight,
            ]);
        }

        return back()->with('success', 'Objective created successfully!');
    }

    public function updateObjective(Request $request, Objective $objective)
    {
        $request->validate([
            'code' => 'required|string|max:50',
            'description' => 'required|string',
            'weight' => 'required|numeric|min:0|max:100',
            'order' => 'required|integer',
        ]);

        $objective->update($request->all());

        return back()->with('success', 'Objective updated successfully!');
    }

    public function deleteObjective(Objective $objective)
    {
        $objective->delete();
        return back()->with('success', 'Objective deleted successfully!');
    }

    /**
     * Add all default objectives from the active IPCRF configuration
     */
    public function addAllObjectives(Request $request)
    {
        try {
            // Get the active IPCRF configuration
            $activeConfig = IpcrfConfiguration::where('is_active', true)->first();
            
            if (!$activeConfig) {
                return back()->with('error', 'No active IPCRF configuration found.');
            }

            // Get all objectives that are not already added
            $selectedObjectiveIds = json_decode($activeConfig->selected_objectives, true) ?? [];
            
            if (empty($selectedObjectiveIds)) {
                return back()->with('error', 'No objectives configured in the active IPCRF configuration.');
            }

            $existingObjectiveIds = Objective::whereIn('id', $selectedObjectiveIds)
                ->where('is_active', true)
                ->pluck('id')
                ->toArray();

            if (count($existingObjectiveIds) === count($selectedObjectiveIds)) {
                return back()->with('info', 'All objectives are already active.');
            }

            // Activate all selected objectives
            Objective::whereIn('id', $selectedObjectiveIds)
                ->update(['is_active' => true]);

            $addedCount = count($selectedObjectiveIds);
            
            return back()->with('success', "Successfully activated {$addedCount} objectives!");
            
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to add all objectives: ' . $e->getMessage());
        }
    }

    /**
     * Display objectives management interface
     */
    public function objectivesIndex(Request $request)
    {
        $search = $request->input('search', '');
        $kraFilter = $request->input('kra', '');
        $statusFilter = $request->input('status', '');

        $query = Objective::with('kra');

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($kraFilter) {
            $query->where('kra_id', $kraFilter);
        }

        if ($statusFilter !== '') {
            $query->where('is_active', $statusFilter === '1');
        }

        $objectives = $query->orderBy('kra_id')
                           ->orderBy('order')
                           ->get(); // Get all for AJAX requests

        $kras = Kra::orderBy('order')->get();

        // Return JSON for AJAX requests
        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'objectives' => $objectives,
                'kras' => $kras,
            ]);
        }

        // Return Inertia response for direct access (fallback)
        return Inertia::render('Admin/IpcrfConfiguration', [
            'objectives' => $objectives,
            'kras' => $kras,
            'filters' => [
                'search' => $search,
                'kra' => $kraFilter,
                'status' => $statusFilter,
            ],
        ]);
    }

    /**
     * Store a new objective (management interface)
     */
    public function storeObjectiveManagement(Request $request)
    {
        $request->validate([
            'kra_id' => 'required|exists:kras,id',
            'description' => 'required|string|max:1000',
            'weight' => 'required|numeric|min:0|max:100',
            'order' => 'required|integer|min:1',
            'is_active' => 'boolean',
            'position_tiers' => 'nullable|array',
            'position_tiers.*' => 'string|in:T1 - T3,T4 - T7,MT1 - MT2,MT3 - MT5',
        ]);

        // Auto-generate code based on order
        $code = (string) $request->order;

        Objective::create([
            'kra_id' => $request->kra_id,
            'code' => $code,
            'description' => $request->description,
            'weight' => $request->weight,
            'order' => $request->order,
            'is_active' => $request->boolean('is_active', true),
            'is_custom' => true,
            'position_tiers' => $request->position_tiers,
        ]);

        return back()->with('success', 'Objective created successfully!');
    }

    /**
     * Update an existing objective (management interface)
     */
    public function updateObjectiveManagement(Request $request, Objective $objective)
    {
        $request->validate([
            'kra_id' => 'required|exists:kras,id',
            'description' => 'required|string|max:1000',
            'weight' => 'required|numeric|min:0|max:100',
            'order' => 'required|integer|min:1',
            'is_active' => 'boolean',
            'position_tiers' => 'nullable|array',
            'position_tiers.*' => 'string|in:T1 - T3,T4 - T7,MT1 - MT2,MT3 - MT5',
        ]);

        // Auto-generate code based on order
        $code = (string) $request->order;

        $objective->update([
            'kra_id' => $request->kra_id,
            'code' => $code,
            'description' => $request->description,
            'weight' => $request->weight,
            'order' => $request->order,
            'is_active' => $request->boolean('is_active'),
            'position_tiers' => $request->position_tiers,
        ]);

        return back()->with('success', 'Objective updated successfully!');
    }

    /**
     * Delete an objective (management interface)
     */
    public function deleteObjectiveManagement(Objective $objective)
    {
        try {
            // Check if objective is used in any teacher submissions
            $submissionsCount = TeacherSubmission::where('objective_id', $objective->id)->count();
            
            if ($submissionsCount > 0) {
                return back()->with('error', "Cannot delete objective. It has {$submissionsCount} associated teacher submissions.");
            }

            $objective->delete();
            
            return back()->with('success', 'Objective deleted successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete objective: ' . $e->getMessage());
        }
    }
}
