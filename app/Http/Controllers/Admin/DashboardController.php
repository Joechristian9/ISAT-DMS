<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\TeacherSubmission;
use App\Models\IpcrfRating;
use App\Models\AuditLog;
use App\Models\PendingAction;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // Basic Stats
        $stats = [
            'total_users' => User::count(),
            'total_teachers' => User::role('teacher')->count(),
            'total_admins' => User::role('admin')->count(),
            'total_super_admins' => User::role('super-admin')->count(),
        ];

        // IPCRF Stats
        $ipcrfStats = [
            'total_submissions' => TeacherSubmission::count(),
            'pending_submissions' => TeacherSubmission::where('status', 'pending')->count(),
            'reviewed_submissions' => TeacherSubmission::where('status', 'reviewed')->count(),
            'total_ratings' => IpcrfRating::count(),
            'average_rating' => IpcrfRating::avg('numerical_rating') ?? 0,
        ];

        // Pending Actions
        $pendingActions = [
            'total_pending' => PendingAction::where('status', 'pending')->count(),
            'approved_today' => PendingAction::where('status', 'approved')
                ->whereDate('updated_at', today())
                ->count(),
            'rejected_today' => PendingAction::where('status', 'rejected')
                ->whereDate('updated_at', today())
                ->count(),
        ];

        // Recent Activities (Last 10)
        $recentActivities = AuditLog::with('user')
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'description' => $log->description,
                    'user_name' => $log->user->name ?? 'System',
                    'created_at' => $log->created_at->diffForHumans(),
                ];
            });

        // Submissions Trend (Last 7 days)
        $submissionsTrend = TeacherSubmission::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count')
            )
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => Carbon::parse($item->date)->format('M d'),
                    'count' => $item->count,
                ];
            });

        // Ratings Distribution
        $ratingsDistribution = IpcrfRating::select(
                DB::raw('FLOOR(numerical_rating) as rating'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('rating')
            ->orderBy('rating')
            ->get()
            ->map(function ($item) {
                return [
                    'rating' => (int) $item->rating,
                    'count' => $item->count,
                ];
            });

        // Monthly Submissions (Last 6 months)
        $monthlySubmissions = TeacherSubmission::select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('COUNT(*) as count')
            )
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => Carbon::create($item->year, $item->month)->format('M Y'),
                    'count' => $item->count,
                ];
            });

        // Status Distribution
        $statusDistribution = TeacherSubmission::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => ucfirst($item->status),
                    'count' => $item->count,
                ];
            });

        // Top Rated Teachers (Top 5)
        $topRatedTeachers = IpcrfRating::with('teacher')
            ->select('teacher_id', DB::raw('AVG(numerical_rating) as avg_rating'))
            ->groupBy('teacher_id')
            ->orderByDesc('avg_rating')
            ->take(5)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->teacher->name ?? 'Unknown',
                    'rating' => round($item->avg_rating, 2),
                ];
            });

        // System Alerts
        $systemAlerts = [
            'unreviewed_submissions' => TeacherSubmission::whereNull('reviewed_at')->count(),
            'pending_approvals' => PendingAction::where('status', 'pending')->count(),
            'teachers_without_ratings' => User::role('teacher')
                ->whereDoesntHave('ipcrfRatings')
                ->count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'ipcrfStats' => $ipcrfStats,
            'pendingActions' => $pendingActions,
            'recentActivities' => $recentActivities,
            'submissionsTrend' => $submissionsTrend,
            'ratingsDistribution' => $ratingsDistribution,
            'monthlySubmissions' => $monthlySubmissions,
            'statusDistribution' => $statusDistribution,
            'topRatedTeachers' => $topRatedTeachers,
            'systemAlerts' => $systemAlerts,
            'isSuperAdmin' => auth()->user()->hasRole('super-admin'),
        ]);
    }
}
