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
        // Get all configurations with their custom KRAs and objectives
        $configurations = IpcrfConfiguration::with([
            'customKras.objectives' => function ($query) {
                $query->where('is_active', true)->orderBy('order');
            },
            'customKras' => function ($query) {
                $query->where('is_active', true)->orderBy('order');
            }
        ])->orderBy('school_year', 'desc')->get();
        
        // Get all default (system) KRAs with their objectives
        $kras = \App\Models\Kra::with(['objectives' => function ($query) {
            $query->where('is_active', true)
                  ->whereNull('ipcrf_configuration_id') // Only default objectives
                  ->orderBy('order');
        }])
        ->where('is_active', true)
        ->whereNull('ipcrf_configuration_id') // Only default KRAs
        ->orderBy('order')
        ->get();
        
        return Inertia::render('Admin/IpcrfConfiguration', [
            'configurations' => $configurations,
            'currentYear' => date('Y'),
            'defaultKras' => $kras,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'school_year' => 'required|string|unique:ipcrf_configurations,school_year',
            'kra_count' => 'required|integer|min:1|max:10',
            'objectives_per_kra' => 'required|array',
            'objectives_per_kra.*' => 'required|integer|min:0|max:20',
            'selected_objective_ids' => 'nullable|array',
            'selected_objective_ids.*' => 'required|integer',
            'custom_kras' => 'nullable|array',
            'custom_kras.*.name' => 'required|string|max:255',
            'custom_kras.*.description' => 'nullable|string',
            'custom_objectives' => 'nullable|array',
            'custom_objectives.*.kra_id' => 'required|integer',
            'custom_objectives.*.code' => 'required|string|max:50',
            'custom_objectives.*.description' => 'required|string|max:500',
            'custom_objectives.*.weight' => 'nullable|numeric|min:0|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        // Ensure at least one objective (default or custom) is selected
        $hasDefaultObjectives = !empty($validated['selected_objective_ids']);
        $hasCustomObjectives = !empty($validated['custom_objectives']);
        
        if (!$hasDefaultObjectives && !$hasCustomObjectives) {
            return redirect()->back()
                ->withErrors(['selected_objective_ids' => 'You must select at least one objective or add a custom objective.'])
                ->withInput();
        }

        $configuration = IpcrfConfiguration::create([
            'school_year' => $validated['school_year'],
            'kra_count' => $validated['kra_count'],
            'objectives_per_kra' => $validated['objectives_per_kra'],
            'selected_objective_ids' => $validated['selected_objective_ids'] ?? [],
            'notes' => $validated['notes'] ?? null,
        ]);

        // Create custom KRAs if provided
        if (!empty($validated['custom_kras'])) {
            foreach ($validated['custom_kras'] as $index => $kraData) {
                \App\Models\Kra::create([
                    'name' => $kraData['name'],
                    'description' => $kraData['description'] ?? null,
                    'order' => 100 + $index, // Start at 100 to avoid conflicts with default KRAs
                    'is_active' => true,
                    'is_custom' => true,
                    'ipcrf_configuration_id' => $configuration->id,
                ]);
            }
        }

        // Create custom objectives if provided
        if (!empty($validated['custom_objectives'])) {
            foreach ($validated['custom_objectives'] as $objData) {
                $objective = \App\Models\Objective::create([
                    'kra_id' => $objData['kra_id'], // This should be the actual KRA ID
                    'code' => $objData['code'],
                    'description' => $objData['description'],
                    'weight' => $objData['weight'] ?? 7.00,
                    'order' => 100, // Custom objectives at end
                    'is_active' => true,
                    'is_custom' => true,
                    'ipcrf_configuration_id' => $configuration->id,
                ]);
                
                // Add the new custom objective to selected_objective_ids
                $selectedIds = $configuration->selected_objective_ids;
                $selectedIds[] = $objective->id;
                $configuration->update(['selected_objective_ids' => $selectedIds]);
            }
        }

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
            'objectives_per_kra.*' => 'required|integer|min:0|max:20',
            'selected_objective_ids' => 'nullable|array',
            'selected_objective_ids.*' => 'required|integer',
            'custom_kras' => 'nullable|array',
            'custom_kras.*.name' => 'required|string|max:255',
            'custom_kras.*.description' => 'nullable|string',
            'custom_objectives' => 'nullable|array',
            'custom_objectives.*.kra_id' => 'required|integer',
            'custom_objectives.*.code' => 'required|string|max:50',
            'custom_objectives.*.description' => 'required|string|max:500',
            'custom_objectives.*.weight' => 'nullable|numeric|min:0|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        // Ensure at least one objective (default or custom) is selected
        $hasDefaultObjectives = !empty($validated['selected_objective_ids']);
        $hasCustomObjectives = !empty($validated['custom_objectives']);
        
        if (!$hasDefaultObjectives && !$hasCustomObjectives) {
            return redirect()->back()
                ->withErrors(['selected_objective_ids' => 'You must select at least one objective or add a custom objective.'])
                ->withInput();
        }

        $configuration->update([
            'school_year' => $validated['school_year'],
            'kra_count' => $validated['kra_count'],
            'objectives_per_kra' => $validated['objectives_per_kra'],
            'selected_objective_ids' => $validated['selected_objective_ids'] ?? [],
            'notes' => $validated['notes'] ?? null,
        ]);

        // Create custom KRAs if provided
        if (!empty($validated['custom_kras'])) {
            foreach ($validated['custom_kras'] as $index => $kraData) {
                \App\Models\Kra::create([
                    'name' => $kraData['name'],
                    'description' => $kraData['description'] ?? null,
                    'order' => 100 + $index, // Start at 100 to avoid conflicts with default KRAs
                    'is_active' => true,
                    'is_custom' => true,
                    'ipcrf_configuration_id' => $configuration->id,
                ]);
            }
        }

        // Create custom objectives if provided
        if (!empty($validated['custom_objectives'])) {
            foreach ($validated['custom_objectives'] as $objData) {
                $objective = \App\Models\Objective::create([
                    'kra_id' => $objData['kra_id'], // This should be the actual KRA ID
                    'code' => $objData['code'],
                    'description' => $objData['description'],
                    'weight' => $objData['weight'] ?? 7.00,
                    'order' => 100, // Custom objectives at end
                    'is_active' => true,
                    'is_custom' => true,
                    'ipcrf_configuration_id' => $configuration->id,
                ]);
                
                // Add the new custom objective to selected_objective_ids
                $selectedIds = $configuration->selected_objective_ids;
                $selectedIds[] = $objective->id;
                $configuration->update(['selected_objective_ids' => $selectedIds]);
            }
        }

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
