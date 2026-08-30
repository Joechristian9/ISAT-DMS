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

        // Get positions for teachers (PositionSeeder defines the current tier names)
        $beginnerPosition = Position::where('name', 'Beginning Towards Proficient')->first();
        $proficientPosition = Position::where('name', 'Highly Proficient')->first();

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

        // Principal account (super-admin) - rates Master Teacher I-II.
        // The Principal IV of ISAT Ilagan Campus.
        $principal = User::updateOrCreate(
            ['email' => 'principal@isat.edu.ph'],
            [
                'name' => 'Mary Ann Lopez Catindig',
                'password' => bcrypt('password'),
                'career_stage' => 'Distinguished',
                'is_active' => true,
            ]
        );
        if (!$principal->hasRole('super-admin')) {
            $principal->assignRole('super-admin');
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

        // Seed IPCRF data - KRAs only.
        // Objectives are managed directly in the database / admin UI, not seeded.
        $this->call(KraSeeder::class);

        // IpcrfRatingSeeder is intentionally NOT called - ratings must start empty.
        // Teachers show "Not rated yet" / status "draft" / rating 0 until a rater
        // scores them. Run it manually only when demo data is needed:
        //   php artisan db:seed --class=IpcrfRatingSeeder

        // ISAT Ilagan Campus teaching roster (Master Teacher I-II + Teacher I-III).
        $this->call(SchoolRosterSeeder::class);
    }
}
