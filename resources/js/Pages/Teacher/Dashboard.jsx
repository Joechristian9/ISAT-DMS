import { Head } from '@inertiajs/react';
import TeacherLayout from '@/Layouts/TeacherLayout';
import { FileText, ArrowRight, Sparkles, Target, TrendingUp, Award, CheckCircle2, Clock, BarChart3, Upload, Eye, Star, Zap, ArrowDown } from 'lucide-react';

export default function TeacherDashboard({ user }) {
    return (
        <TeacherLayout user={user}>
            <Head title="Teacher Dashboard" />
            
            <div className="min-h-screen bg-gray-100">
                {/* Header */}
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <img 
                                src="/pictures/isat.jpg" 
                                alt="ISAT" 
                                className="h-12 w-12 rounded-lg object-cover"
                            />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">ISAT DMS</h1>
                                <p className="text-sm text-gray-600">Teacher Portal</p>
                            </div>
                        </div>
                    </div>

                    {/* Step-by-Step Guide */}
                    <div className="max-w-5xl mx-auto mb-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Step 1 */}
                            <div className="relative bg-white rounded-2xl p-6 shadow-lg border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                                <div className="absolute -top-4 -left-4 bg-gradient-to-br from-green-500 to-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-lg ring-4 ring-white">
                                    1
                                </div>
                                <div className="mt-4">
                                    <div className="bg-green-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4 mx-auto">
                                        <Upload className="h-7 w-7 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Open IPCRF Tool</h3>
                                    <p className="text-sm text-gray-600 text-center mb-4">
                                        Click the green button below to access your performance dashboard
                                    </p>
                                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                                        <p className="text-xs text-green-700 font-medium text-center">
                                            Takes 2 seconds
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="relative bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                                <div className="absolute -top-4 -left-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-lg ring-4 ring-white">
                                    2
                                </div>
                                <div className="mt-4">
                                    <div className="bg-purple-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4 mx-auto">
                                        <FileText className="h-7 w-7 text-purple-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Upload Evidence</h3>
                                    <p className="text-sm text-gray-600 text-center mb-4">
                                        Submit your documents and evidence for each objective
                                    </p>
                                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                                        <p className="text-xs text-purple-700 font-medium text-center">
                                            PDF files accepted
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="relative bg-white rounded-2xl p-6 shadow-lg border-2 border-amber-200 hover:border-amber-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                                <div className="absolute -top-4 -left-4 bg-gradient-to-br from-amber-500 to-amber-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-lg ring-4 ring-white">
                                    3
                                </div>
                                <div className="mt-4">
                                    <div className="bg-amber-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4 mx-auto">
                                        <Eye className="h-7 w-7 text-amber-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Track Progress</h3>
                                    <p className="text-sm text-gray-600 text-center mb-4">
                                        Monitor your ratings and feedback from administrators
                                    </p>
                                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                                        <p className="text-xs text-amber-700 font-medium text-center">
                                            Real-time updates
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="max-w-5xl mx-auto mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your Performance Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Performance Card */}
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-blue-400">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                                        <BarChart3 className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-blue-100 font-medium">Current Rating</p>
                                        <p className="text-3xl font-bold text-white">--</p>
                                    </div>
                                </div>
                                <div className="bg-white/20 rounded-lg p-3">
                                    <p className="text-xs text-white font-medium">Awaiting submissions</p>
                                </div>
                            </div>

                            {/* Submissions Card */}
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-purple-400">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                                        <CheckCircle2 className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-purple-100 font-medium">Submitted</p>
                                        <p className="text-3xl font-bold text-white">0</p>
                                    </div>
                                </div>
                                <div className="bg-white/20 rounded-lg p-3">
                                    <p className="text-xs text-white font-medium">Documents uploaded</p>
                                </div>
                            </div>

                            {/* Goals Card */}
                            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-amber-400">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                                        <Target className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-amber-100 font-medium">Total Goals</p>
                                        <p className="text-3xl font-bold text-white">14</p>
                                    </div>
                                </div>
                                <div className="bg-white/20 rounded-lg p-3">
                                    <p className="text-xs text-white font-medium">Objectives to complete</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Why Use IPCRF Section */}
                    <div className="max-w-5xl mx-auto mb-10">
                        <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl p-8 border-2 border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Use the IPCRF Tool?</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                                        <TrendingUp className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Track Growth</h3>
                                    <p className="text-sm text-gray-600">Monitor your professional development and see your progress in real-time</p>
                                </div>

                                <div className="text-center">
                                    <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                                        <Clock className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Save Time</h3>
                                    <p className="text-sm text-gray-600">Streamlined submission process makes documentation quick and easy</p>
                                </div>

                                <div className="text-center">
                                    <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                                        <Award className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Achieve Excellence</h3>
                                    <p className="text-sm text-gray-600">Reach your professional goals with structured performance management</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Help Section */}
                    <div className="text-center max-w-2xl mx-auto">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Need Help Getting Started?</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Our administrators are here to support you every step of the way. Don't hesitate to reach out if you have questions.
                            </p>
                            <div className="inline-flex items-center gap-2 text-green-600 font-semibold text-sm">
                                <Sparkles className="h-4 w-4" />
                                <span>Contact your administrator for guidance</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-t-4 border-green-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <p className="text-sm font-medium mb-2">
                            © {new Date().getFullYear()} ISAT Document Management System
                        </p>
                        <p className="text-xs text-gray-400">
                            Empowering educators through excellence
                        </p>
                    </div>
                </div>
            </footer>
        </TeacherLayout>
    );
}
