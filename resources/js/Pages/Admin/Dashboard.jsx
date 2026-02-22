import { AppSidebar } from "@/components/app-sidebar"
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
    Users, 
    GraduationCap, 
    Shield, 
    FileText, 
    CheckCircle, 
    Clock, 
    TrendingUp, 
    AlertCircle,
    Star,
    Activity,
    Download,
    Calendar,
    BarChart3,
    PieChart as PieChartIcon,
    LineChart as LineChartIcon
} from 'lucide-react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';

export default function AdminDashboard({ 
    stats, 
    ipcrfStats, 
    pendingActions, 
    recentActivities,
    submissionsTrend,
    ratingsDistribution,
    monthlySubmissions,
    statusDistribution,
    topRatedTeachers,
    systemAlerts
}) {
    const [dateFilter, setDateFilter] = useState('7days');

    // Analytics Cards Data
    const analyticsCards = [
        {
            title: "Total Users",
            value: stats?.total_users || 0,
            icon: Users,
            color: "bg-blue-500",
            trend: "+12%",
            description: "All system users"
        },
        {
            title: "Teachers",
            value: stats?.total_teachers || 0,
            icon: GraduationCap,
            color: "bg-green-500",
            trend: "+8%",
            description: "Active teachers"
        },
        {
            title: "IPCRF Submissions",
            value: ipcrfStats?.total_submissions || 0,
            icon: FileText,
            color: "bg-purple-500",
            trend: "+15%",
            description: "Total submissions"
        },
        {
            title: "Pending Reviews",
            value: ipcrfStats?.pending_submissions || 0,
            icon: Clock,
            color: "bg-orange-500",
            trend: "-5%",
            description: "Awaiting review"
        },
        {
            title: "Completed Reviews",
            value: ipcrfStats?.reviewed_submissions || 0,
            icon: CheckCircle,
            color: "bg-teal-500",
            trend: "+20%",
            description: "Reviewed submissions"
        },
        {
            title: "Average Rating",
            value: ipcrfStats?.average_rating ? ipcrfStats.average_rating.toFixed(2) : '0.00',
            icon: Star,
            color: "bg-yellow-500",
            trend: "+0.3",
            description: "Overall performance"
        },
        {
            title: "Pending Actions",
            value: pendingActions?.total_pending || 0,
            icon: AlertCircle,
            color: "bg-red-500",
            trend: "-3",
            description: "Requires attention"
        },
        {
            title: "System Alerts",
            value: (systemAlerts?.unreviewed_submissions || 0) + (systemAlerts?.pending_approvals || 0),
            icon: Activity,
            color: "bg-pink-500",
            trend: "0",
            description: "Active alerts"
        }
    ];

    // Chart Colors
    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
    
    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-900">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <>
            <Head title="Admin Dashboard" />
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                        <div className="flex items-center gap-2 px-4 w-full justify-between">
                            <div className="flex items-center gap-2">
                                <SidebarTrigger className="-ml-1" />
                                <Separator orientation="vertical" className="mr-2 h-4" />
                                <Breadcrumb>
                                    <BreadcrumbList>
                                        <BreadcrumbItem>
                                            <BreadcrumbPage>Dashboard</BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </BreadcrumbList>
                                </Breadcrumb>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export Report
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {dateFilter === '7days' ? 'Last 7 Days' : 'Last 30 Days'}
                                </Button>
                            </div>
                        </div>
                    </header>
                    
                    <div className="flex flex-1 flex-col gap-6 p-4 pt-0 relative overflow-auto">
                        {/* Background Logo Watermark */}
                        <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-20">
                            <img 
                                src="/pictures/isat.jpg" 
                                alt="ISAT Background" 
                                className="w-[600px] h-[600px] object-contain"
                            />
                        </div>

                        {/* Content with higher z-index */}
                        <div className="relative z-10 space-y-6">
                            {/* Welcome Header */}
                            <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
                                <h1 className="text-3xl font-bold mb-2">Welcome to Admin Dashboard</h1>
                                <p className="text-green-100">Monitor system performance and make data-driven decisions</p>
                            </div>

                            {/* Analytics Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {analyticsCards.map((card, index) => {
                                    const Icon = card.icon;
                                    return (
                                        <Card key={index} className="hover:shadow-lg transition-shadow">
                                            <CardContent className="p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className={`${card.color} p-3 rounded-lg`}>
                                                        <Icon className="h-6 w-6 text-white" />
                                                    </div>
                                                    <span className={`text-sm font-semibold ${
                                                        card.trend.startsWith('+') ? 'text-green-600' : 
                                                        card.trend.startsWith('-') ? 'text-red-600' : 
                                                        'text-gray-600'
                                                    }`}>
                                                        {card.trend}
                                                    </span>
                                                </div>
                                                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                                                    {card.value}
                                                </h3>
                                                <p className="text-sm font-medium text-gray-600 mb-1">
                                                    {card.title}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {card.description}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            {/* Charts Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Submissions Trend - Area Chart */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    <LineChartIcon className="h-5 w-5 text-green-600" />
                                                    Submissions Trend
                                                </CardTitle>
                                                <CardDescription>Last 7 days activity</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {submissionsTrend && submissionsTrend.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={300}>
                                                <AreaChart data={submissionsTrend}>
                                                    <defs>
                                                        <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                    <XAxis dataKey="date" stroke="#6b7280" />
                                                    <YAxis stroke="#6b7280" />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Area 
                                                        type="monotone" 
                                                        dataKey="count" 
                                                        stroke="#10b981" 
                                                        fillOpacity={1} 
                                                        fill="url(#colorSubmissions)"
                                                        name="Submissions"
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <p className="text-gray-500 text-sm text-center py-20">No data available</p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Status Distribution - Pie Chart */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <PieChartIcon className="h-5 w-5 text-blue-600" />
                                            Status Distribution
                                        </CardTitle>
                                        <CardDescription>Submission status breakdown</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {statusDistribution && statusDistribution.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={300}>
                                                <PieChart>
                                                    <Pie
                                                        data={statusDistribution}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                                                        outerRadius={100}
                                                        fill="#8884d8"
                                                        dataKey="count"
                                                    >
                                                        {statusDistribution.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <p className="text-gray-500 text-sm text-center py-20">No data available</p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Monthly Submissions - Bar Chart */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5 text-purple-600" />
                                            Monthly Submissions
                                        </CardTitle>
                                        <CardDescription>Last 6 months overview</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {monthlySubmissions && monthlySubmissions.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={monthlySubmissions}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                    <XAxis dataKey="month" stroke="#6b7280" />
                                                    <YAxis stroke="#6b7280" />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Legend />
                                                    <Bar dataKey="count" fill="#8b5cf6" name="Submissions" radius={[8, 8, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <p className="text-gray-500 text-sm text-center py-20">No data available</p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Ratings Distribution - Pie Chart */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Star className="h-5 w-5 text-yellow-600" />
                                            Ratings Distribution
                                        </CardTitle>
                                        <CardDescription>Performance ratings breakdown</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {ratingsDistribution && ratingsDistribution.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={300}>
                                                <PieChart>
                                                    <Pie
                                                        data={ratingsDistribution}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ rating, percent }) => `${rating}★ ${(percent * 100).toFixed(0)}%`}
                                                        outerRadius={100}
                                                        fill="#8884d8"
                                                        dataKey="count"
                                                    >
                                                        {ratingsDistribution.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <p className="text-gray-500 text-sm text-center py-20">No data available</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Bottom Section - 3 Columns */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Top Rated Teachers */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5 text-green-600" />
                                            Top Rated Teachers
                                        </CardTitle>
                                        <CardDescription>Highest performing teachers</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {topRatedTeachers && topRatedTeachers.length > 0 ? (
                                                topRatedTeachers.map((teacher, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                                                index === 0 ? 'bg-yellow-500' : 
                                                                index === 1 ? 'bg-gray-400' : 
                                                                index === 2 ? 'bg-orange-600' : 
                                                                'bg-green-600'
                                                            }`}>
                                                                {index + 1}
                                                            </div>
                                                            <span className="font-medium text-gray-900">{teacher.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                            <span className="font-bold text-gray-900">{teacher.rating}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 text-sm text-center py-10">No ratings available yet</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Recent Activities */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Activity className="h-5 w-5 text-blue-600" />
                                            Recent Activities
                                        </CardTitle>
                                        <CardDescription>Latest system activities</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                            {recentActivities && recentActivities.length > 0 ? (
                                                recentActivities.slice(0, 8).map((activity) => (
                                                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                        <div className="w-2 h-2 rounded-full bg-green-600 mt-2 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {activity.description}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {activity.user_name} • {activity.created_at}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 text-sm text-center py-10">No recent activities</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Quick Stats Summary */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5 text-purple-600" />
                                            Quick Summary
                                        </CardTitle>
                                        <CardDescription>Key metrics at a glance</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {/* Completion Rate */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                                                    <span className="text-sm font-bold text-green-600">
                                                        {ipcrfStats?.total_submissions > 0 
                                                            ? Math.round((ipcrfStats.reviewed_submissions / ipcrfStats.total_submissions) * 100)
                                                            : 0}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className="bg-green-600 h-2 rounded-full transition-all duration-500"
                                                        style={{ 
                                                            width: `${ipcrfStats?.total_submissions > 0 
                                                                ? (ipcrfStats.reviewed_submissions / ipcrfStats.total_submissions) * 100
                                                                : 0}%` 
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Teacher Participation */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-700">Teacher Participation</span>
                                                    <span className="text-sm font-bold text-blue-600">
                                                        {stats?.total_teachers > 0 && ipcrfStats?.total_submissions > 0
                                                            ? Math.min(Math.round((ipcrfStats.total_submissions / stats.total_teachers) * 100), 100)
                                                            : 0}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                                        style={{ 
                                                            width: `${stats?.total_teachers > 0 && ipcrfStats?.total_submissions > 0
                                                                ? Math.min((ipcrfStats.total_submissions / stats.total_teachers) * 100, 100)
                                                                : 0}%` 
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Performance Metrics */}
                                            <div className="pt-4 border-t border-gray-200 space-y-3">
                                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                                    <span className="text-sm font-medium text-gray-700">Avg Rating</span>
                                                    <span className="text-lg font-bold text-green-600">
                                                        {ipcrfStats?.average_rating ? ipcrfStats.average_rating.toFixed(2) : '0.00'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                                    <span className="text-sm font-medium text-gray-700">Total Reviews</span>
                                                    <span className="text-lg font-bold text-blue-600">
                                                        {ipcrfStats?.reviewed_submissions || 0}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                                    <span className="text-sm font-medium text-gray-700">Pending</span>
                                                    <span className="text-lg font-bold text-orange-600">
                                                        {ipcrfStats?.pending_submissions || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* System Alerts */}
                            {systemAlerts && (systemAlerts.unreviewed_submissions > 0 || systemAlerts.pending_approvals > 0 || systemAlerts.teachers_without_ratings > 0) && (
                                <Card className="border-orange-200 bg-orange-50">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-orange-900">
                                            <AlertCircle className="h-5 w-5" />
                                            System Alerts
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {systemAlerts.unreviewed_submissions > 0 && (
                                                <div className="bg-white p-4 rounded-lg border border-orange-200">
                                                    <p className="text-2xl font-bold text-orange-600">{systemAlerts.unreviewed_submissions}</p>
                                                    <p className="text-sm text-gray-600">Unreviewed Submissions</p>
                                                </div>
                                            )}
                                            {systemAlerts.pending_approvals > 0 && (
                                                <div className="bg-white p-4 rounded-lg border border-orange-200">
                                                    <p className="text-2xl font-bold text-orange-600">{systemAlerts.pending_approvals}</p>
                                                    <p className="text-sm text-gray-600">Pending Approvals</p>
                                                </div>
                                            )}
                                            {systemAlerts.teachers_without_ratings > 0 && (
                                                <div className="bg-white p-4 rounded-lg border border-orange-200">
                                                    <p className="text-2xl font-bold text-orange-600">{systemAlerts.teachers_without_ratings}</p>
                                                    <p className="text-sm text-gray-600">Teachers Without Ratings</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}
