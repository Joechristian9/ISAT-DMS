<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Kra;
use App\Models\Objective;

class ObjectiveSeeder extends Seeder
{
    public function run(): void
    {
        // Get KRAs by their order for consistent assignment
        $kraContentKnowledge = Kra::where('order', 1)->first();
        $kraLearningEnvironment = Kra::where('order', 2)->first();
        $kraCurriculumPlanning = Kra::where('order', 3)->first();
        $kraPlusFactor = Kra::where('order', 4)->first();

        $objectives = [
            // Content Knowledge and Pedagogy (KRA 1) - 5 objectives
            [
                'kra_id' => $kraContentKnowledge->id,
                'code' => '1',
                'description' => 'Applied knowledge of content within and across curriculum teaching areas (PPST 1.1.2)',
                'order' => 1,
                'weight' => 6.786,
                'is_active' => true,
            ],
            [
                'kra_id' => $kraContentKnowledge->id,
                'code' => '2',
                'description' => 'Used a range of teaching strategies that enhance learner achievement in literacy and numeracy skills (PPST 1.4.2)',
                'order' => 2,
                'weight' => 6.786,
                'is_active' => true,
            ],
            [
                'kra_id' => $kraContentKnowledge->id,
                'code' => '3',
                'description' => 'Applied a range of teaching strategies to develop critical and creative thinking, as well as other higher-order thinking skills (PPST 1.5.2)',
                'order' => 3,
                'weight' => 6.786,
                'is_active' => true,
            ],
            [
                'kra_id' => $kraContentKnowledge->id,
                'code' => '4',
                'description' => 'Displayed proficient use of Mother Tongue, Filipino and English to facilitate teaching and learning (PPST 1.6.2)',
                'order' => 4,
                'weight' => 6.786,
                'is_active' => true,
            ],
            [
                'kra_id' => $kraContentKnowledge->id,
                'code' => '5',
                'description' => 'Used effective verbal and non-verbal classroom communication strategies to support learner understanding, participation, engagement and achievement (PPST 1.7.2)',
                'order' => 5,
                'weight' => 6.786,
                'is_active' => true,
            ],

            // Learning Environment & Diversity of Learners (KRA 2) - 4 objectives
            [
                'kra_id' => $kraLearningEnvironment->id,
                'code' => '1',
                'description' => 'Maintained learning environments that promote fairness, respect and care to encourage learning (PPST 2.1.2)',
                'order' => 1,
                'weight' => 6.786,
                'is_active' => true,
            ],
            [
                'kra_id' => $kraLearningEnvironment->id,
                'code' => '2',
                'description' => 'Managed classroom structure to engage learners, individually or in groups, in meaningful exploration, discovery and hands-on activities within a range of physical learning environments (PPST 2.2.2)',
                'order' => 2,
                'weight' => 6.786,
                'is_active' => true,
            ],
            [
                'kra_id' => $kraLearningEnvironment->id,
                'code' => '3',
                'description' => 'Managed learner behavior constructively by applying positive and non-violent discipline to ensure learning-focused environments (PPST 2.5.2)',
                'order' => 3,
                'weight' => 6.786,
                'is_active' => true,
            ],
            [
                'kra_id' => $kraLearningEnvironment->id,
                'code' => '4',
                'description' => 'Used differentiated, developmentally appropriate learning experiences to address learners\' gender, needs, strengths, interests and experiences (PPST 3.1.2)',
                'order' => 4,
                'weight' => 6.786,
                'is_active' => true,
            ],

            // Curriculum and Planning & Assessment and Reporting (KRA 3) - 5 objectives
            [
                'kra_id' => $kraCurriculumPlanning->id,
                'code' => '1',
                'description' => 'Planned, managed, and implemented developmentally sequenced teaching and learning processes to meet curriculum requirements and varied teaching contexts (PPST 4.2.2)',
                'order' => 1,
                'weight' => 6.786,
                'is_active' => true,
            ],
            [
                'kra_id' => $kraCurriculumPlanning->id,
                'code' => '2',
                'description' => 'Participated in collegial discussions that use teacher and learner feedback to enrich teaching practice (PPST 4.4.2)',
                'order' => 2,
                'weight' => 6.786,
                'is_active' => true,
            ],
            [
                'kra_id' => $kraCurriculumPlanning->id,
                'code' => '3',
                'description' => 'Planned and delivered teaching strategies that are responsive to the special educational needs of learners in difficult circumstances, including: geographic isolation; chronic illness; displacement due to armed conflict, urban resettlement or disaster; child or youth in conflict with the law; child labor practice; victims of abuse and exploitation (PPST 3.4.2)',
                'order' => 3,
                'weight' => 6.786,
                'is_active' => true,
            ],
            [
                'kra_id' => $kraCurriculumPlanning->id,
                'code' => '4',
                'description' => 'Used assessment data, to inform the modification of teaching and learning programs to further enhance learning (PPST 5.3.2)',
                'order' => 4,
                'weight' => 6.786,
                'is_active' => true,
            ],
            [
                'kra_id' => $kraCurriculumPlanning->id,
                'code' => '5',
                'description' => 'Utilized effective strategies for providing timely, accurate and constructive feedback to improve learner performance (PPST 5.4.2)',
                'order' => 5,
                'weight' => 6.786,
                'is_active' => true,
            ],

            // Plus Factor (KRA 4) - 0 objectives
            // 5% weight reserved for Plus Factor - admins can add custom objectives as needed
        ];

        foreach ($objectives as $objective) {
            Objective::create($objective);
        }
    }
}