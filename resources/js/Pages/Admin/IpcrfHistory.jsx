import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { History, Search, Filter, TrendingUp, Award, FileText } from 'lucide-react';
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';

export default function IpcrfHistory({ ratings, schoolYears, teachers, filters, stats }) {
    const [filterYear, setFilterYear] = useState(filters.school_year || '');
    const [filterTeacher, setFilterTeacher] = useState(filters.teacher_id || '');

    const handleFilter = () => {
        router.get(route('admin.ipcrf-history'), {
            school_year: filterYear,
            teacher_id: filterTeacher,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getPerformanceColor = (level) => {
        const colors = {
            'Outstanding': 'bg-purple-100 text-purple-800 border-purple-300',
            'Very Satisfactory': 'bg-blue-100 text-blue-800 border-blue-300',
            'Satisfactory': 'bg-green-100 text-green-800 border-green-300',
            'Unsatisfactory': 'bg-yellow-100 text-yellow-800 border-yellow-300',
            'Poor': 'bg-red-100 text-red-800 border-red-300',
        };
        return colors[level] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <Head title="IPCRF History - Admin" />
                
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbPage>IPCRF History</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                <div className="flex-1 p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
                    {/* Background Logo Watermark */}
                    <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-20">
                        <img 
                            src="/pictures/isat.tmp" 
                            alt="ISAT Background" 
                            className="w-[600px] h-[600px] object-contain"
                        />
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 relative z-10">
                        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-green-600" />
                                </div>
                                <p className="text-sm font-semibold text-gray-600">Total Submissions</p>
                            </div>
                            <p className="text-3xl font-bold text-green-600">{stats.total_submissions}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-emerald-200">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <Award className="h-5 w-5 text-emerald-600" />
                                </div>
                                <p className="text-sm font-semibold text-gray-600">Total Ratings</p>
                            </div>
                            <p className="text-3xl font-bold text-emerald-600">{stats.total_ratings}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-teal-200">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-teal-600" />
                                </div>
                                <p className="text-sm font-semibold text-gray-600">Average Rating</p>
                            </div>
                            <p className="text-3xl font-bold text-teal-600">
                                {stats.average_rating ? Number(stats.average_rating).toFixed(2) : 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-gray-200 relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <Filter className="h-5 w-5 text-gray-600" />
                            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    School Year
                                </label>
                                <select
                                    value={filterYear}
                                    onChange={(e) => setFilterYear(e.target.value)}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">All Years</option>
                                    {schoolYears.map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Teacher
                                </label>
                                <select
                                    value={filterTeacher}
                                    onChange={(e) => setFilterTeacher(e.target.value)}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">All Teachers</option>
                                    {teachers.map((teacher) => (
                                        <option key={teacher.id} value={teacher.id}>
                                            {teacher.name} ({teacher.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    onClick={handleFilter}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                >
                                    <Search className="h-4 w-4 mr-2" />
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Ratings List */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 relative z-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Rating Records</h2>

                        {ratings.length === 0 ? (
                            <div className="text-center py-12">
                                <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 text-lg">No records found</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {ratings.map((rating) => (
                                    <div key={rating.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-green-300 transition-all">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-bold text-gray-900">
                                                        {rating.teacher.name}
                                                    </h3>
                                                    <span className="text-sm text-gray-600">
                                                        SY {rating.rating_period}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${getPerformanceColor(rating.performance_level)}`}>
                                                        {rating.performance_level || 'N/A'}
                                                    </span>
                                                </div>
                                                
                                                <div className="grid grid-cols-3 gap-4 mt-4">
                                                    <div>
                                                        <p className="text-sm text-gray-600">Average Rating</p>
                                                        <p className="text-2xl font-bold text-green-600">
                                                            {rating.numerical_rating ? Number(rating.numerical_rating).toFixed(2) : 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Total Score</p>
                                                        <p className="text-2xl font-bold text-emerald-600">
                                                            {rating.total_score ? Number(rating.total_score).toFixed(2) : 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Status</p>
                                                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                                                            {rating.status}
                                                        </span>
                                                    </div>
                                                </div>

                                                <p className="text-sm text-gray-500 mt-3">
                                                    Submitted: {new Date(rating.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Total Count Info */}
                        {ratings && ratings.length > 0 && (
                            <div className="mt-6 text-center text-sm text-gray-600">
                                Showing all {ratings.length} rating{ratings.length !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
