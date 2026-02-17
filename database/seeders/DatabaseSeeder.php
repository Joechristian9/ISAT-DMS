<?php

namespace Database\Seeders;

use App\Models\User;
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
        // Create roles
        $superAdminRole = Role::create(['name' => 'super-admin']);
        $adminRole = Role::create(['name' => 'admin']);
        $teacherRole = Role::create(['name' => 'teacher']);

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

        // Create a teacher
        $teacher = User::factory()->create([
            'name' => 'Teacher User',
            'email' => 'teacher@gmail.com',
            'password' => bcrypt('teacher123'),
        ]);
        $teacher->assignRole('teacher');

        // Create additional test teacher
        $teacher2 = User::factory()->create([
            'name' => 'Test Teacher',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);
        $teacher2->assignRole('teacher');

        // Seed IPCRF data
        $this->call(IpcrfSeeder::class);
    }
}
