<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\IpcrfConfiguration;
use App\Models\TeacherSubmission;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IpcrfConfigurationController extends Controller
{
    protected $auditLogService;

    public function __construct(AuditLogService $auditLogService)
    {
        $this->auditLogService = $auditLogService;
    }

    public function index(): Response
    {
        $configurations = IpcrfConfiguration::orderBy('school_year', 'desc')->get();
        
        return Inertia::render('Admin/IpcrfConfiguration', [
            'configurations' => $configurations,
            'currentYear' => date('Y'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'school_year' => 'required|string|unique:ipcrf_configurations,school_year',
            'kra_count' => 'required|integer|min:1|max:10',
            'objectives_per_kra' => 'required|array',
            'objectives_per_kra.*' => 'required|integer|min:1|max:20',
            'notes' => 'nullable|string|max:500',
        ]);

        $configuration = IpcrfConfiguration::create($validated);

        // Log the action
        $this->auditLogService->log(
            'create',
            "Created IPCRF configuration for {$validated['school_year']}",
            'IpcrfConfiguration',
            $configuration->id
        );

        return redirect()->back()->with('success', 'Configuration created successfully!');
    }

    public function update(Request $request, IpcrfConfiguration $configuration)
    {
        // Check if configuration is locked
        if ($configuration->is_locked) {
            return redirect()->back()->with('error', 'This configuration is locked and cannot be modified.');
        }

        $validated = $request->validate([
            'school_year' => 'required|string|unique:ipcrf_configurations,school_year,' . $configuration->id,
            'kra_count' => 'required|integer|min:1|max:10',
            'objectives_per_kra' => 'required|array',
            'objectives_per_kra.*' => 'required|integer|min:1|max:20',
            'notes' => 'nullable|string|max:500',
        ]);

        $configuration->update($validated);

        // Log the action
        $this->auditLogService->log(
            'update',
            "Updated IPCRF configuration for {$validated['school_year']}",
            'IpcrfConfiguration',
            $configuration->id
        );

        return redirect()->back()->with('success', 'Configuration updated successfully!');
    }

    public function destroy(IpcrfConfiguration $configuration)
    {
        // Check if configuration is locked
        if ($configuration->is_locked) {
            return redirect()->back()->with('error', 'This configuration is locked and cannot be deleted.');
        }

        // Check if configuration is being used
        $submissionsCount = TeacherSubmission::where('school_year', $configuration->school_year)->count();
        
        if ($submissionsCount > 0) {
            return redirect()->back()->with('error', "Cannot delete: {$submissionsCount} submission(s) exist for this school year.");
        }

        $schoolYear = $configuration->school_year;
        $configuration->delete();

        // Log the action
        $this->auditLogService->log(
            'delete',
            "Deleted IPCRF configuration for {$schoolYear}",
            'IpcrfConfiguration',
            $configuration->id
        );

        return redirect()->back()->with('success', 'Configuration deleted successfully!');
    }

    public function toggleActive(IpcrfConfiguration $configuration)
    {
        // Deactivate all other configurations
        if (!$configuration->is_active) {
            IpcrfConfiguration::where('id', '!=', $configuration->id)->update(['is_active' => false]);
        }

        $configuration->update(['is_active' => !$configuration->is_active]);

        // Log the action
        $status = $configuration->is_active ? 'activated' : 'deactivated';
        $this->auditLogService->log(
            'update',
            "Configuration for {$configuration->school_year} {$status}",
            'IpcrfConfiguration',
            $configuration->id
        );

        return redirect()->back()->with('success', 'Configuration status updated!');
    }

    public function toggleLock(IpcrfConfiguration $configuration)
    {
        $configuration->update(['is_locked' => !$configuration->is_locked]);

        // Log the action
        $status = $configuration->is_locked ? 'locked' : 'unlocked';
        $this->auditLogService->log(
            'update',
            "Configuration for {$configuration->school_year} {$status}",
            'IpcrfConfiguration',
            $configuration->id
        );

        return redirect()->back()->with('success', 'Configuration lock status updated!');
    }
}
