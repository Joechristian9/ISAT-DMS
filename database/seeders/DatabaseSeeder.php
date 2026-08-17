<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Position;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed positions first
        $this->call(PositionSeeder::class);

        // Create roles
        $superAdminRole = Role::firstOrCreate(['name' => 'super-admin']);
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $teacherRole = Role::firstOrCreate(['name' => 'teacher']);

        // Get positions for teachers
        $beginnerPosition = Position::where('name', 'Beginner')->first();
        $proficientPosition = Position::where('name', 'Proficient')->first();

        // Create super admin
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@gmail.com'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('superadmin123'),
            ]
        );
        if (!$superAdmin->hasRole('super-admin')) {
            $superAdmin->assignRole('super-admin');
        }

        // Create 3 admins
        for ($i = 1; $i <= 3; $i++) {
            $admin = User::firstOrCreate(
                ['email' => "admin$i@gmail.com"],
                [
                    'name' => "Admin $i",
                    'password' => bcrypt('admin123'),
                ]
            );
            if (!$admin->hasRole('admin')) {
                $admin->assignRole('admin');
            }
        }

        // Create a teacher with Beginner position
        $teacher = User::firstOrCreate(
            ['email' => 'teacher@gmail.com'],
            [
                'name' => 'Teacher User',
                'password' => bcrypt('teacher123'),
                'current_position_id' => $beginnerPosition->id,
                'division' => 'Science Department',
                'teacher_type' => 'Full-time',
            ]
        );
        if (!$teacher->hasRole('teacher')) {
            $teacher->assignRole('teacher');
        }

        // Create additional test teacher with Proficient position
        $teacher2 = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test Teacher',
                'password' => bcrypt('password'),
                'current_position_id' => $proficientPosition->id,
                'division' => 'Mathematics Department',
                'teacher_type' => 'Full-time',
            ]
        );
        if (!$teacher2->hasRole('teacher')) {
            $teacher2->assignRole('teacher');
        }

        // Seed IPCRF data - KRAs and Objectives
        $this->call(KraSeeder::class);
        $this->call(ObjectiveSeeder::class);
        $this->call(IpcrfRatingSeeder::class);
    }
}
