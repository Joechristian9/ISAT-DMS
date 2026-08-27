<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\IpcrfConfiguration;
use App\Models\TeacherSubmission;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
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
        ])
        ->orderBy('school_year', 'desc')
        ->orderByRaw('position_tier IS NULL DESC')
        ->orderBy('position_tier')
        ->get();
        
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
            'positionTiers' => IpcrfConfiguration::POSITION_TIERS,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'school_year' => 'required|string',
            'position_tier' => [
                'required',
                Rule::in(IpcrfConfiguration::POSITION_TIERS),
                Rule::unique('ipcrf_configurations', 'position_tier')
                    ->where(fn ($query) => $query->where('school_year', $request->input('school_year'))),
            ],
            'kra_count' => 'required|integer|min:1|max:10',
            'objectives_per_kra' => 'nullable|array',
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
        ], [
            'position_tier.required' => 'Please choose the position tier this configuration applies to.',
            'position_tier.unique' => 'A configuration for this position tier already exists for the selected school year.',
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
            'position_tier' => $validated['position_tier'],
            'kra_count' => $validated['kra_count'],
            'objectives_per_kra' => $validated['objectives_per_kra'] ?? [],
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
                    'position_tiers' => [$configuration->position_tier],
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
                    'position_tiers' => [$configuration->position_tier],
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
            "Created IPCRF configuration for {$validated['school_year']} ({$validated['position_tier']})",
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
            'school_year' => 'required|string',
            'position_tier' => [
                'required',
                Rule::in(IpcrfConfiguration::POSITION_TIERS),
                Rule::unique('ipcrf_configurations', 'position_tier')
                    ->where(fn ($query) => $query->where('school_year', $request->input('school_year')))
                    ->ignore($configuration->id),
            ],
            'kra_count' => 'required|integer|min:1|max:10',
            'objectives_per_kra' => 'nullable|array',
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
        ], [
            'position_tier.required' => 'Please choose the position tier this configuration applies to.',
            'position_tier.unique' => 'A configuration for this position tier already exists for the selected school year.',
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
            'position_tier' => $validated['position_tier'],
            'kra_count' => $validated['kra_count'],
            'objectives_per_kra' => $validated['objectives_per_kra'] ?? [],
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
                    'position_tiers' => [$configuration->position_tier],
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
                    'position_tiers' => [$configuration->position_tier],
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
            "Updated IPCRF configuration for {$validated['school_year']} ({$validated['position_tier']})",
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

        // Check if configuration is being used by teachers of this tier
        $submissionsQuery = TeacherSubmission::where('school_year', $configuration->school_year);

        if ($configuration->position_tier) {
            $tierTeacherIds = $this->teacherIdsForTier($configuration->position_tier);

            if (empty($tierTeacherIds)) {
                $submissionsQuery->whereRaw('1 = 0');
            } else {
                $submissionsQuery->whereIn('teacher_id', $tierTeacherIds);
            }
        }

        $submissionsCount = $submissionsQuery->count();
        
        if ($submissionsCount > 0) {
            return redirect()->back()->with('error', "Cannot delete: {$submissionsCount} submission(s) exist for this school year and position tier.");
        }

        $schoolYear = $configuration->school_year;
        $tier = $configuration->position_tier ?? 'All tiers';
        $configuration->delete();

        // Log the action
        $this->auditLogService->log(
            'delete',
            "Deleted IPCRF configuration for {$schoolYear} ({$tier})",
            'IpcrfConfiguration',
            $configuration->id
        );

        return redirect()->back()->with('success', 'Configuration deleted successfully!');
    }

    public function toggleActive(IpcrfConfiguration $configuration)
    {
        // Only one active configuration per position tier, so activating this one
        // deactivates the other configurations targeting the same tier.
        if (!$configuration->is_active) {
            IpcrfConfiguration::where('id', '!=', $configuration->id)
                ->when(
                    $configuration->position_tier,
                    fn ($query) => $query->where('position_tier', $configuration->position_tier),
                    fn ($query) => $query->whereNull('position_tier')
                )
                ->update(['is_active' => false]);
        }

        $configuration->update(['is_active' => !$configuration->is_active]);

        // Log the action
        $status = $configuration->is_active ? 'activated' : 'deactivated';
        $tier = $configuration->position_tier ?? 'All tiers';
        $this->auditLogService->log(
            'update',
            "Configuration for {$configuration->school_year} ({$tier}) {$status}",
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
        $tier = $configuration->position_tier ?? 'All tiers';
        $this->auditLogService->log(
            'update',
            "Configuration for {$configuration->school_year} ({$tier}) {$status}",
            'IpcrfConfiguration',
            $configuration->id
        );

        return redirect()->back()->with('success', 'Configuration lock status updated!');
    }

    /**
     * Resolve the teacher IDs whose position range matches the given tier.
     * Position data lives inside the `division` JSON column.
     */
    protected function teacherIdsForTier(string $positionTier): array
    {
        return \App\Models\User::role('teacher')
            ->get(['id', 'division'])
            ->filter(function ($teacher) use ($positionTier) {
                $division = json_decode($teacher->division, true);

                return is_array($division)
                    && ($division['position_range'] ?? null) === $positionTier;
            })
            ->pluck('id')
            ->all();
    }
}
