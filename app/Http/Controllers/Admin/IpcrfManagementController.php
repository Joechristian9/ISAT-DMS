<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kra;
use App\Models\Objective;
use App\Models\Competency;
use App\Models\TeacherSubmission;
use App\Models\IpcrfRating;
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

        $query = User::role('teacher')
            ->with(['currentPosition', 'ipcrfRatings' => function ($q) use ($yearFilter) {
                if ($yearFilter) {
                    $q->where('rating_period', $yearFilter);
                }
                $q->latest();
            }]);

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $teachers = $query->paginate(10);

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
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
                'year' => $yearFilter,
            ],
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
}
