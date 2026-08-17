<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Kra;

class KraSeeder extends Seeder
{
    public function run(): void
    {
        $kras = [
            [
                'name' => 'Content Knowledge and Pedagogy',
                'description' => 'Applied knowledge of content within and across curriculum teaching areas.',
                'order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Learning Environment & Diversity of Learners',
                'description' => 'Demonstrated understanding of learning environments and diversity of learners.',
                'order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Curriculum and Planning & Assessment and Reporting',
                'description' => 'Curriculum planning, assessment and reporting aligned to learning outcomes.',
                'order' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Plus Factor',
                'description' => 'Personal Growth and Professional Development',
                'order' => 4,
                'is_active' => true,
            ],
        ];

        foreach ($kras as $kra) {
            Kra::create($kra);
        }
    }
}