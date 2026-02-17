<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kra;
use App\Models\Objective;
use App\Models\Competency;
use App\Models\TeacherSubmission;
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

    public function submissions()
    {
        $teachers = User::role('teacher')
            ->with(['teacherSubmissions' => function ($query) {
                $query->with(['objective', 'competency'])
                    ->where('school_year', '2024-2025')
                    ->latest();
            }])
            ->get();

        return Inertia::render('Admin/IpcrfSubmissions', [
            'teachers' => $teachers,
        ]);
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
