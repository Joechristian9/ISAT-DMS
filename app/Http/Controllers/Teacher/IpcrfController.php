<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Kra;
use App\Models\TeacherSubmission;
use App\Models\IpcrfConfiguration;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class IpcrfController extends Controller
{
    public function index()
    {
        // Get the active IPCRF configuration
        $activeConfig = IpcrfConfiguration::where('is_active', true)->first();
        
        // Check if there's no active config or if it's locked
        if (!$activeConfig) {
            return Inertia::render('Teacher/Ipcrf', [
                'kras' => [],
                'submissions' => [],
                'schoolYear' => null,
                'user' => auth()->user(),
                'noActiveConfig' => true,
                'message' => 'No active IPCRF configuration found. Please contact the administrator.',
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
        
        // Load KRAs with filtered objectives based on configuration
        // Include both default KRAs and custom KRAs for this configuration
        $kras = Kra::with(['objectives' => function ($query) use ($activeConfig) {
            $query->where('is_active', true);
            
            // Filter by selected objective IDs if configured
            if ($activeConfig->selected_objective_ids && count($activeConfig->selected_objective_ids) > 0) {
                $query->where(function($q) use ($activeConfig) {
                    $q->whereIn('id', $activeConfig->selected_objective_ids)
                      ->orWhere('ipcrf_configuration_id', $activeConfig->id); // Include custom objectives
                });
            }
            
            $query->orderBy('order');
        }, 'objectives.competencies'])
        ->where('is_active', true)
        ->where(function($query) use ($activeConfig) {
            $query->whereNull('ipcrf_configuration_id') // Default KRAs
                  ->orWhere('ipcrf_configuration_id', $activeConfig->id); // Custom KRAs for this config
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

        return Inertia::render('Teacher/Ipcrf', [
            'kras' => $kras,
            'submissions' => $submissions,
            'schoolYear' => $currentYear,
            'user' => auth()->user(),
            'noActiveConfig' => false,
            'isLocked' => false,
        ]);
    }

    public function upload(Request $request)
    {
        // Check if there's an active config and it's not locked
        $activeConfig = IpcrfConfiguration::where('is_active', true)->first();
        
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
