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
        $superAdminRole = Role::create(['name' => 'super-admin']);
        $adminRole = Role::create(['name' => 'admin']);
        $teacherRole = Role::create(['name' => 'teacher']);

        // Get positions for teachers
        $beginnerPosition = Position::where('name', 'Beginner')->first();
        $proficientPosition = Position::where('name', 'Proficient')->first();

        // Create super admin
        $superAdmin = User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'superadmin@gmail.com',
            'password' => bcrypt('superadmin123'),
        ]);
        $superAdmin->assignRole('super-admin');

        // Create 3 admins
        for ($i = 1; $i <= 3; $i++) {
            $admin = User::factory()->create([
                'name' => "Admin $i",
                'email' => "admin$i@gmail.com",
                'password' => bcrypt('admin123'),
            ]);
            $admin->assignRole('admin');
        }

        // Create a teacher with Beginner position
        $teacher = User::factory()->create([
            'name' => 'Teacher User',
            'email' => 'teacher@gmail.com',
            'password' => bcrypt('teacher123'),
            'current_position_id' => $beginnerPosition->id,
            'division' => 'Science Department',
            'teacher_type' => 'Full-time',
        ]);
        $teacher->assignRole('teacher');

        // Create additional test teacher with Proficient position
        $teacher2 = User::factory()->create([
            'name' => 'Test Teacher',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'current_position_id' => $proficientPosition->id,
            'division' => 'Mathematics Department',
            'teacher_type' => 'Full-time',
        ]);
        $teacher2->assignRole('teacher');

        // Seed IPCRF data
        $this->call(IpcrfSeeder::class);
    }
}
