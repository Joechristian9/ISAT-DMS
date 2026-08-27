<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Kra;
use App\Models\KraSelfRating;
use App\Models\TeacherSubmission;
use App\Models\IpcrfConfiguration;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class IpcrfController extends Controller
{
    public function index()
    {
        // Resolve the teacher's position tier from the division JSON payload
        $user = auth()->user();
        $divisionData = json_decode($user->division, true);
        $teacherPositionTier = is_array($divisionData) ? ($divisionData['position_range'] ?? null) : null;

        // Get the active IPCRF configuration for this teacher's position tier
        $activeConfig = IpcrfConfiguration::getActiveConfigForTier($teacherPositionTier);
        
        // Check if there's no active config or if it's locked
        if (!$activeConfig) {
            return Inertia::render('Teacher/Ipcrf', [
                'kras' => [],
                'submissions' => [],
                'schoolYear' => null,
                'user' => auth()->user(),
                'noActiveConfig' => true,
                'message' => $teacherPositionTier
                    ? "No active IPCRF configuration found for your position tier ({$teacherPositionTier}). Please contact the administrator."
                    : 'No active IPCRF configuration found. Please contact the administrator.',
            ]);
        }

        if ($activeConfig->is_locked) {
            return Inertia::render('Teacher/Ipcrf', [
                'kras' => [],
                'submissions' => [],
                'schoolYear' => $activeConfig->school_year,
                'user' => auth()->user(),
                'isLocked' => true,
                'message' => 'The IPCRF for SY ' . $activeConfig->school_year . ' is currently locked. No submissions are allowed at this time.',
            ]);
        }
        
        $currentYear = $activeConfig->school_year;
        
        // Load KRAs with filtered objectives based on configuration AND position tier
        $kras = Kra::with(['objectives' => function ($query) use ($activeConfig, $teacherPositionTier) {
            $query->where('is_active', true);
            
            // Filter by selected objective IDs if configured
            if ($activeConfig->selected_objective_ids && count($activeConfig->selected_objective_ids) > 0) {
                $query->where(function($q) use ($activeConfig) {
                    $q->whereIn('id', $activeConfig->selected_objective_ids)
                      ->orWhere('ipcrf_configuration_id', $activeConfig->id); // Include custom objectives
                });
            }
            
            // Filter by teacher's position tier
            if ($teacherPositionTier) {
                $query->where(function($q) use ($teacherPositionTier) {
                    $q->whereNull('position_tiers')  // Include objectives for all positions
                      ->orWhereJsonContains('position_tiers', $teacherPositionTier); // Or specific to teacher's tier
                });
            }
            
            $query->orderBy('order');
        }, 'objectives.competencies'])
        ->where('is_active', true)
        ->where(function($query) use ($activeConfig) {
            $query->whereNull('ipcrf_configuration_id') // Default KRAs
                  ->orWhere('ipcrf_configuration_id', $activeConfig->id); // Custom KRAs for this config
        })
        // Filter KRAs by position tier as well
        ->where(function($query) use ($teacherPositionTier) {
            if ($teacherPositionTier) {
                $query->whereNull('position_tiers')
                      ->orWhereJsonContains('position_tiers', $teacherPositionTier);
            }
        })
        ->orderBy('order')
        ->get();
        
        // Get teacher's submissions - grouped by objective
        $submissions = TeacherSubmission::where('teacher_id', auth()->id())
            ->where('school_year', $currentYear)
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy(function ($item) {
                if ($item->competency_id === null) {
                    return $item->objective_id . '_obj';
                }
                return $item->objective_id . '_' . $item->competency_id;
            });

        // Self-rating documents the teacher uploaded per KRA, keyed by KRA id
        $selfRatings = KraSelfRating::where('teacher_id', auth()->id())
            ->where('school_year', $currentYear)
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy('kra_id');

        return Inertia::render('Teacher/Ipcrf', [
            'kras' => $kras,
            'submissions' => $submissions,
            'selfRatings' => $selfRatings,
            'selfRatingTotalWeight' => KraSelfRating::TOTAL_WEIGHT,
            'selfRatingWeightPerKra' => KraSelfRating::weightPerKra($kras->count()),
            'schoolYear' => $currentYear,
            'user' => auth()->user(),
            'noActiveConfig' => false,
            'isLocked' => false,
        ]);
    }

    /**
     * Store a self-rating document for one KRA.
     */
    public function uploadSelfRating(Request $request)
    {
        $divisionData = json_decode(auth()->user()->division, true);
        $teacherPositionTier = is_array($divisionData) ? ($divisionData['position_range'] ?? null) : null;

        $activeConfig = IpcrfConfiguration::getActiveConfigForTier($teacherPositionTier);

        if (!$activeConfig) {
            return back()->with('error', 'No active IPCRF configuration found. Please contact the administrator.');
        }

        if ($activeConfig->is_locked) {
            return back()->with('error', 'The IPCRF for this school year is currently locked. No submissions are allowed.');
        }

        $validated = $request->validate([
            'kra_id' => 'required|exists:kras,id',
            'file' => 'required|file|mimes:pdf|max:10240', // 10MB max
            'self_rating' => 'nullable|numeric|min:1|max:5',
            'notes' => 'nullable|string|max:1000',
        ], [
            'file.mimes' => 'The self-rating document must be a PDF file.',
            'self_rating.min' => 'Self-rating must be between 1 and 5.',
            'self_rating.max' => 'Self-rating must be between 1 and 5.',
        ]);

        $file = $request->file('file');
        $path = $file->store('ipcrf-self-ratings/' . auth()->id(), 'public');

        KraSelfRating::create([
            'teacher_id' => auth()->id(),
            'kra_id' => $validated['kra_id'],
            'school_year' => $activeConfig->school_year,
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'self_rating' => $validated['self_rating'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return back()->with('success', 'Self-rating uploaded successfully!');
    }

    /**
     * Remove a self-rating document.
     */
    public function deleteSelfRating(KraSelfRating $selfRating)
    {
        if ($selfRating->teacher_id !== auth()->id()) {
            abort(403);
        }

        if ($selfRating->file_path) {
            Storage::disk('public')->delete($selfRating->file_path);
        }

        $selfRating->delete();

        return back()->with('success', 'Self-rating removed successfully!');
    }

    public function upload(Request $request)
    {
        // Check if there's an active config for this teacher's tier and it's not locked
        $divisionData = json_decode(auth()->user()->division, true);
        $teacherPositionTier = is_array($divisionData) ? ($divisionData['position_range'] ?? null) : null;

        $activeConfig = IpcrfConfiguration::getActiveConfigForTier($teacherPositionTier);
        
        if (!$activeConfig) {
            return back()->with('error', 'No active IPCRF configuration found. Please contact the administrator.');
        }
        
        if ($activeConfig->is_locked) {
            return back()->with('error', 'The IPCRF for this school year is currently locked. No submissions are allowed.');
        }

        $request->validate([
            'objective_id' => 'required|exists:objectives,id',
            'competency_id' => 'nullable|exists:competencies,id',
            'file' => 'required|file|mimes:pdf|max:10240', // 10MB max
            'notes' => 'nullable|string|max:1000',
            'school_year' => 'required|string',
        ]);

        $file = $request->file('file');
        $path = $file->store('ipcrf-submissions/' . auth()->id(), 'public');

        // Create new submission (allow multiple per objective)
        $submission = TeacherSubmission::create([
            'teacher_id' => auth()->id(),
            'objective_id' => $request->objective_id,
            'competency_id' => $request->competency_id,
            'school_year' => $request->school_year,
            'file_path' => $path,
            'notes' => $request->notes,
            'status' => 'submitted',
        ]);

        return back()->with('success', 'File uploaded successfully!');
    }

    public function deleteFile(TeacherSubmission $submission)
    {
        if ($submission->teacher_id !== auth()->id()) {
            abort(403);
        }

        if ($submission->file_path) {
            Storage::disk('public')->delete($submission->file_path);
        }

        $submission->delete();

        return back()->with('success', 'File deleted successfully!');
    }
}
