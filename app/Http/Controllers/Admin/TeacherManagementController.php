<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Position;
use App\Models\Promotion;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeacherManagementController extends Controller
{
    /**
     * Display all teachers
     */
    public function index(Request $request): Response
    {
        $query = User::role('teacher')
            ->with('currentPosition')
            ->orderBy('name');

        // Search by name
        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Filter by position
        if ($request->has('position') && $request->position) {
            $query->where('current_position_id', $request->position);
        }

        $teachers = $query->paginate(10);
        $positions = Position::orderBy('order')->get();

        return Inertia::render('Admin/TeacherManagement', [
            'teachers' => $teachers,
            'positions' => $positions,
            'filters' => $request->only(['search', 'position']),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Store a new teacher
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'current_position_id' => 'required|exists:positions,id',
            'division' => 'nullable|string|max:255',
            'teacher_type' => 'nullable|string|max:255',
        ], [
            'name.required' => 'Teacher name is required.',
            'name.max' => 'Teacher name cannot exceed 255 characters.',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please provide a valid email address.',
            'email.unique' => 'This email address is already registered in the system.',
            'password.required' => 'Password is required.',
            'password.min' => 'Password must be at least 8 characters long.',
            'current_position_id.required' => 'Please select a position for the teacher.',
            'current_position_id.exists' => 'The selected position is invalid.',
            'division.max' => 'Division name cannot exceed 255 characters.',
            'teacher_type.max' => 'Teacher type cannot exceed 255 characters.',
        ]);

        $teacher = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'current_position_id' => $validated['current_position_id'],
            'division' => $validated['division'] ?? null,
            'teacher_type' => $validated['teacher_type'] ?? null,
        ]);

        $teacher->assignRole('teacher');

        // Log the action
        AuditLogService::logTeacherCreated($teacher->id, $teacher->name);

        return redirect()->back()->with('success', 'Teacher created successfully!');
    }

    /**
     * Update teacher information
     */
    public function update(Request $request, User $teacher)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $teacher->id,
            'division' => 'nullable|string|max:255',
            'teacher_type' => 'nullable|string|max:255',
        ], [
            'name.required' => 'Teacher name is required.',
            'name.max' => 'Teacher name cannot exceed 255 characters.',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please provide a valid email address.',
            'email.unique' => 'This email address is already registered to another user.',
            'division.max' => 'Division name cannot exceed 255 characters.',
            'teacher_type.max' => 'Teacher type cannot exceed 255 characters.',
        ]);

        $oldValues = $teacher->only(['name', 'email', 'division', 'teacher_type']);
        $teacher->update($validated);

        // Log the action
        AuditLogService::logTeacherUpdated($teacher->id, $teacher->name, $oldValues, $validated);

        return redirect()->back()->with('success', 'Teacher updated successfully!');
    }

    /**
     * Delete a teacher
     */
    public function destroy(User $teacher)
    {
        if (!$teacher->hasRole('teacher')) {
            return redirect()->back()->with('error', 'User is not a teacher!');
        }

        $teacherName = $teacher->name;
        $teacher->delete();

        // Log the action
        AuditLogService::logTeacherDeleted($teacher->id, $teacherName);

        return redirect()->back()->with('success', 'Teacher deleted successfully!');
    }

    /**
     * Promote a teacher to a selected position
     */
    public function promote(Request $request, User $teacher)
    {
        $validated = $request->validate([
            'to_position_id' => 'required|exists:positions,id',
            'notes' => 'nullable|string',
        ], [
            'to_position_id.required' => 'Please select a position to promote the teacher to.',
            'to_position_id.exists' => 'The selected position is invalid.',
        ]);

        // Validate teacher has a position
        if (!$teacher->current_position_id) {
            return redirect()->back()->with('error', 'Teacher does not have a current position!');
        }

        $currentPosition = $teacher->currentPosition;
        $toPosition = Position::find($validated['to_position_id']);

        // Check if trying to promote to same position
        if ($currentPosition->id === $toPosition->id) {
            return redirect()->back()->with('error', 'Teacher is already at this position!');
        }

        // Create promotion record
        Promotion::create([
            'user_id' => $teacher->id,
            'from_position_id' => $currentPosition->id,
            'to_position_id' => $toPosition->id,
            'promoted_by' => auth()->id(),
            'promoted_at' => now(),
            'notes' => $validated['notes'] ?? null,
        ]);

        // Update teacher's position
        $teacher->update([
            'current_position_id' => $toPosition->id,
        ]);

        // Log the action
        AuditLogService::logTeacherPromoted(
            $teacher->id,
            $teacher->name,
            $currentPosition->name,
            $toPosition->name
        );

        return redirect()->back()->with('success', "Teacher promoted from {$currentPosition->name} to {$toPosition->name}!");
    }

    /**
     * View promotion history for a teacher
     */
    public function promotionHistory(User $teacher): Response
    {
        $promotions = Promotion::where('user_id', $teacher->id)
            ->with(['fromPosition', 'toPosition', 'promotedBy'])
            ->orderBy('promoted_at', 'desc')
            ->get();

        return Inertia::render('Admin/PromotionHistory', [
            'teacher' => $teacher->load('currentPosition'),
            'promotions' => $promotions,
        ]);
    }

    /**
     * Get promotion history data as JSON
     */
    public function promotionHistoryData(User $teacher)
    {
        $promotions = Promotion::where('user_id', $teacher->id)
            ->with(['fromPosition', 'toPosition', 'promotedBy'])
            ->orderBy('promoted_at', 'desc')
            ->get();

        return response()->json($promotions);
    }
}
