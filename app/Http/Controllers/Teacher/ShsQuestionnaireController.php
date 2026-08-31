<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\IpcrfConfiguration;
use App\Models\QuestionnaireTemplate;
use App\Models\ShsQuestionnaireResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShsQuestionnaireController extends Controller
{
    private const TEMPLATE_KEY = 'shs-performance';

    public function index()
    {
        $template = QuestionnaireTemplate::where('key', self::TEMPLATE_KEY)
            ->where('is_active', true)
            ->firstOrFail();

        $activeConfig = IpcrfConfiguration::where('is_active', true)->first();
        $schoolYear = $activeConfig?->school_year ?? '2024-2025';

        $response = ShsQuestionnaireResponse::firstOrCreate(
            [
                'teacher_id' => auth()->id(),
                'questionnaire_template_id' => $template->id,
                'school_year' => $schoolYear,
            ],
            ['status' => 'draft'],
        );

        return Inertia::render('Teacher/ShsQuestionnaire', [
            'template' => $template,
            'response' => $response,
            'schoolYear' => $schoolYear,
            'user' => auth()->user(),
            'profileDefaults' => $this->profileDefaults($template, $schoolYear),
        ]);
    }

    /**
     * Best-effort PART I pre-fill from the teacher's account and their most
     * recent submission of this same questionnaire.
     *
     * @return array{profile: array<string,mixed>, trainings: array}
     */
    private function profileDefaults(QuestionnaireTemplate $template, string $schoolYear): array
    {
        $user = auth()->user();
        $division = json_decode((string) $user->division, true) ?: [];

        $prior = ShsQuestionnaireResponse::where('teacher_id', $user->id)
            ->where('questionnaire_template_id', $template->id)
            ->where('school_year', '!=', $schoolYear)
            ->latest('updated_at')
            ->first();
        $priorProfile = $prior?->profile ?? [];

        $pick = fn (...$vals) => collect($vals)->first(fn ($v) => $v !== null && $v !== '');

        $profile = array_filter([
            'name' => $user->name,
            'age' => $priorProfile['age'] ?? null,
            'teaching_position' => $pick($division['position_title'] ?? null, $user->career_stage, $priorProfile['teaching_position'] ?? null),
            'years_of_service' => $pick($user->years_of_service, $priorProfile['years_of_service'] ?? null),
            'bachelors_degree' => $priorProfile['bachelors_degree'] ?? null,
            'year_level_assignment' => $pick($user->level, $division['level'] ?? null, $priorProfile['year_level_assignment'] ?? null),
            'subject_taught' => $pick($user->department, $priorProfile['subject_taught'] ?? null),
        ], fn ($v) => $v !== null && $v !== '');

        return [
            'profile' => $profile,
            'trainings' => $prior?->trainings ?? [],
        ];
    }

    public function store(Request $request)
    {
        $template = QuestionnaireTemplate::where('key', self::TEMPLATE_KEY)
            ->where('is_active', true)
            ->firstOrFail();

        $validated = $request->validate([
            'school_year' => 'required|string|max:20',
            'status' => 'required|in:draft,submitted',
            'profile' => 'nullable|array',
            'trainings' => 'nullable|array',
            'trainings.*.title' => 'nullable|string|max:255',
            'trainings.*.level' => 'nullable|string|max:50',
            'trainings.*.year' => 'nullable|string|max:20',
            'performance_ratings' => 'nullable|array',
            'performance_ratings.*' => 'nullable|integer|min:1|max:5',
            'challenge_ratings' => 'nullable|array',
            'challenge_ratings.*' => 'nullable|integer|min:1|max:5',
        ]);

        // A final submission must have every rating answered.
        if ($validated['status'] === 'submitted') {
            $expectedPerformance = count($template->performanceItems());
            $expectedChallenges = count($template->challengeItems());
            $answeredPerformance = count(array_filter($validated['performance_ratings'] ?? [], fn ($v) => $v !== null));
            $answeredChallenges = count(array_filter($validated['challenge_ratings'] ?? [], fn ($v) => $v !== null));

            if ($answeredPerformance < $expectedPerformance || $answeredChallenges < $expectedChallenges) {
                return back()->with('error', 'Please answer every item before submitting.');
            }
        }

        ShsQuestionnaireResponse::updateOrCreate(
            [
                'teacher_id' => auth()->id(),
                'questionnaire_template_id' => $template->id,
                'school_year' => $validated['school_year'],
            ],
            [
                'profile' => $validated['profile'] ?? [],
                'trainings' => array_values($validated['trainings'] ?? []),
                'performance_ratings' => $validated['performance_ratings'] ?? [],
                'challenge_ratings' => $validated['challenge_ratings'] ?? [],
                'status' => $validated['status'],
                'submitted_at' => $validated['status'] === 'submitted' ? now() : null,
            ],
        );

        return back()->with('success', $validated['status'] === 'submitted'
            ? 'Thank you! Your SHS questionnaire has been submitted.'
            : 'Draft saved.');
    }
}
