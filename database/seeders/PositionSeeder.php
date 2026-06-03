<?php

namespace Database\Seeders;

use App\Models\Position;
use Illuminate\Database\Seeder;

class PositionSeeder extends Seeder
{
    /**
     * Seed the positions table with teacher ranks
     */
    public function run(): void
    {
        $positions = [
            ['name' => 'Beginner', 'order' => 1, 'parent_position_id' => null],
            ['name' => 'Proficient', 'order' => 2, 'parent_position_id' => null],
            ['name' => 'Highly Proficient', 'order' => 3, 'parent_position_id' => null],
            ['name' => 'Distinguished', 'order' => 4, 'parent_position_id' => null],
        ];

        foreach ($positions as $position) {
            Position::firstOrCreate(
                ['order' => $position['order']],
                $position
            );
        }

        // Set parent relationships for hierarchy
        $beginner = Position::where('name', 'Beginner')->first();
        $proficient = Position::where('name', 'Proficient')->first();
        $highlyProficient = Position::where('name', 'Highly Proficient')->first();
        $distinguished = Position::where('name', 'Distinguished')->first();

        if ($beginner && $proficient) {
            $proficient->update(['parent_position_id' => $beginner->id]);
        }
        if ($proficient && $highlyProficient) {
            $highlyProficient->update(['parent_position_id' => $proficient->id]);
        }
        if ($highlyProficient && $distinguished) {
            $distinguished->update(['parent_position_id' => $highlyProficient->id]);
        }
    }
}
