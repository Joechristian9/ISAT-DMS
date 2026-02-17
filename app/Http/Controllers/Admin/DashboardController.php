<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $stats = [
            'total_users' => User::count(),
            'total_teachers' => User::role('teacher')->count(),
            'total_admins' => User::role('admin')->count(),
            'total_super_admins' => User::role('super-admin')->count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'isSuperAdmin' => auth()->user()->hasRole('super-admin'),
        ]);
    }
}
