import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { 
    FileText, 
    Users, 
    Shield, 
    BarChart3, 
    CheckCircle, 
    Clock,
    Award,
    Lock,
    TrendingUp,
    Settings,
    ArrowRight,
    Zap,
    Target,
    Eye,
    X
} from 'lucide-react';

export default function Welcome({ auth }) {
    const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);
    const features = [
        {
            icon: FileText,
            title: "IPCRF Management",
            description: "Comprehensive Individual Performance Commitment and Review Form management with digital submission and rating system.",
            color: "bg-blue-500"
        },
        {
            icon: Users,
            title: "Teacher Management",
            description: "Complete teacher profile management, position tracking, and promotion history with role-based access control.",
            color: "bg-green-500"
        },
        {
            icon: BarChart3,
            title: "Analytics Dashboard",
            description: "Real-time insights with interactive charts, submission trends, ratings distribution, and performance metrics.",
            color: "bg-purple-500"
        },
        {
            icon: Shield,
            title: "Audit Trail",
            description: "Complete activity logging and audit trail for accountability, transparency, and compliance tracking.",
            color: "bg-red-500"
        },
        {
            icon: Award,
            title: "Performance Rating",
            description: "Structured KRA-based evaluation system with configurable objectives and comprehensive rating workflows.",
            color: "bg-yellow-500"
        },
        {
            icon: Settings,
            title: "Flexible Configuration",
            description: "Year-specific KRA and objective configuration allowing adaptation to changing evaluation requirements.",
            color: "bg-indigo-500"
        }
    ];

    const userRoles = [
        {
            title: "Super Admin",
            description: "Full system access with approval workflows and configuration management",
            icon: Shield
        },
        {
            title: "Admin/Evaluator",
            description: "Review submissions, rate performance, and manage teacher records",
            icon: CheckCircle
        },
        {
            title: "Teachers",
            description: "Submit IPCRF documents, track submissions, and view evaluation results",
            icon: Users
        }
    ];

    const workflow = [
        {
            step: "1",
            title: "Submit",
            description: "Teachers upload IPCRF documents",
            icon: FileText
        },
        {
            step: "2",
            title: "Review",
            description: "Admins review and validate submissions",
            icon: Clock
        },
        {
            step: "3",
            title: "Rate",
            description: "Evaluate performance using KRA framework",
            icon: Award
        },
        {
            step: "4",
            title: "Track",
            description: "Monitor progress and generate reports",
            icon: TrendingUp
        }
    ];

    return (
        <>
            <Head title="Welcome to ISAT DMS" />
            
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
                {/* Navigation */}
                <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center gap-3">
                                <img 
                                    src="/pictures/isat.jpg" 
                                    alt="ISAT Logo" 
                                    className="h-10 w-10 rounded-lg object-cover"
                                />
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">ISAT DMS</h1>
                                    <p className="text-xs text-gray-600">Document Management System</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Go to Dashboard
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('login')}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Log in
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
                    {/* Background Decoration */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                        <div className="absolute bottom-0 left-1/2 w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
                    </div>

                    <div className="max-w-7xl mx-auto relative">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            {/* Left Content */}
                            <div className="text-left space-y-8">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium animate-fade-in">
                                    <Zap className="h-4 w-4" />
                                    Secure & Efficient Document Management
                                </div>
                                
                                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight animate-slide-up">
                                    ISAT Document
                                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 mt-2">
                                        Management System
                                    </span>
                                </h1>
                                
                                <p className="text-xl text-gray-600 leading-relaxed animate-slide-up animation-delay-200">
                                    Streamline your IPCRF evaluation process with our comprehensive digital platform. 
                                    Manage submissions, track performance, and generate insights—all in one place.
                                </p>
                                
                                <div className="flex flex-col sm:flex-row items-start gap-4 animate-slide-up animation-delay-400">
                                    {!auth.user ? (
                                        <>
                                            <Link
                                                href={route('login')}
                                                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 hover:shadow-xl font-semibold"
                                            >
                                                Sign In to Get Started
                                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                            <button 
                                                onClick={() => setIsLearnMoreOpen(true)}
                                                className="inline-flex items-center px-8 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all border-2 border-gray-200 hover:border-green-300 font-semibold"
                                            >
                                                <Eye className="mr-2 h-5 w-5" />
                                                Learn More
                                            </button>
                                        </>
                                    ) : (
                                        <Link
                                            href={route('dashboard')}
                                            className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 hover:shadow-xl font-semibold"
                                        >
                                            Go to Dashboard
                                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200 animate-fade-in animation-delay-600">
                                    <div>
                                        <div className="text-3xl font-bold text-green-600">100%</div>
                                        <div className="text-sm text-gray-600 mt-1">Secure</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-blue-600">24/7</div>
                                        <div className="text-sm text-gray-600 mt-1">Access</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-purple-600">Fast</div>
                                        <div className="text-sm text-gray-600 mt-1">Processing</div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Content - Image/Illustration */}
                            <div className="relative animate-fade-in animation-delay-400">
                                <div className="relative">
                                    {/* Main Image Container */}
                                    <div className="relative bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-transform duration-500">
                                        <img 
                                            src="/pictures/isat.jpg" 
                                            alt="ISAT" 
                                            className="w-full h-auto rounded-2xl shadow-lg"
                                        />
                                        
                                        {/* Floating Cards */}
                                        <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-xl p-4 animate-float">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">Verified</div>
                                                    <div className="text-xs text-gray-500">Secure System</div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 animate-float animation-delay-2000">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <Award className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">Excellence</div>
                                                    <div className="text-xs text-gray-500">Top Rated</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16 animate-fade-in">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
                                <Target className="h-4 w-4" />
                                Powerful Features
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                Everything You Need
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Comprehensive tools designed to streamline teacher performance evaluations
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div 
                                        key={index}
                                        className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border-2 border-gray-100 hover:border-green-300 transition-all hover:shadow-2xl transform hover:-translate-y-2 duration-300 animate-fade-in"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        {/* Gradient overlay on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                                        
                                        <div className="relative">
                                            <div className={`${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                                                <Icon className="h-7 w-7 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                                                {feature.title}
                                            </h3>
                                            <p className="text-gray-600 leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Workflow Section */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-blue-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Simple Workflow
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Streamlined process from submission to evaluation
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {workflow.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <div key={index} className="relative">
                                        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-green-300 transition-all hover:shadow-lg text-center">
                                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                                                {item.step}
                                            </div>
                                            <Icon className="h-8 w-8 text-green-600 mx-auto mb-3" />
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                {item.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm">
                                                {item.description}
                                            </p>
                                        </div>
                                        {index < workflow.length - 1 && (
                                            <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                                                <ArrowRight className="h-6 w-6 text-gray-300" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* User Roles Section */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Built for Everyone
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Role-based access ensures the right tools for the right users
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {userRoles.map((role, index) => {
                                const Icon = role.icon;
                                return (
                                    <div 
                                        key={index}
                                        className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-8 border-2 border-gray-200 hover:border-green-300 transition-all hover:shadow-xl text-center"
                                    >
                                        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Icon className="h-8 w-8 text-green-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                            {role.title}
                                        </h3>
                                        <p className="text-gray-600">
                                            {role.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <img 
                                        src="/pictures/isat.jpg" 
                                        alt="ISAT Logo" 
                                        className="h-10 w-10 rounded-lg object-cover"
                                    />
                                    <div>
                                        <h3 className="text-white font-bold">ISAT DMS</h3>
                                        <p className="text-xs text-gray-400">Document Management System</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400">
                                    Empowering educational institutions with efficient document management and performance evaluation tools.
                                </p>
                            </div>
                            
                            <div>
                                <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><Link href={route('login')} className="hover:text-white transition-colors">Login</Link></li>
                                    {auth.user && (
                                        <li><Link href={route('dashboard')} className="hover:text-white transition-colors">Dashboard</Link></li>
                                    )}
                                </ul>
                            </div>
                            
                            <div>
                                <h4 className="text-white font-semibold mb-4">System Info</h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        Secure & Encrypted
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        Role-Based Access
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        Audit Trail Enabled
                                    </li>
                                </ul>
                            </div>
                        </div>
                        
                        <div className="border-t border-gray-800 pt-8 text-center text-sm">
                            <p>&copy; {new Date().getFullYear()} ISAT Document Management System. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Learn More Modal */}
            {isLearnMoreOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div 
                            className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75"
                            onClick={() => setIsLearnMoreOpen(false)}
                        ></div>

                        {/* Modal panel */}
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <img 
                                            src="/pictures/isat.jpg" 
                                            alt="ISAT Logo" 
                                            className="h-12 w-12 rounded-lg object-cover"
                                        />
                                        <div>
                                            <h3 className="text-2xl font-bold text-white">About ISAT</h3>
                                            <p className="text-green-100 text-sm">Vision, Mission, Goals & Objectives</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsLearnMoreOpen(false)}
                                        className="text-white hover:text-gray-200 transition-colors"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-8">
                                    {/* Vision */}
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Eye className="h-5 w-5 text-white" />
                                            </div>
                                            <h4 className="text-xl font-bold text-blue-900">VISION</h4>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed pl-13">
                                            "A center of excellence geared towards developing Filipino workforce that initiates transformational approaches receptive to the changing needs of time."
                                        </p>
                                    </div>

                                    {/* Mission */}
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Target className="h-5 w-5 text-white" />
                                            </div>
                                            <h4 className="text-xl font-bold text-green-900">MISSION</h4>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed pl-13">
                                            "ISAT commits to produce highly skilled workforce with positive work values and green skills through quality training, innovative research and responsive community engagement."
                                        </p>
                                    </div>

                                    {/* Goals */}
                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Award className="h-5 w-5 text-white" />
                                            </div>
                                            <h4 className="text-xl font-bold text-purple-900">GOALS</h4>
                                        </div>
                                        <ul className="space-y-2 pl-13">
                                            <li className="flex items-start gap-2 text-gray-700">
                                                <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                                <span>Continuously commit to service excellence in skills training in all registered qualifications/programs</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-gray-700">
                                                <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                                <span>Extend skills training opportunities to a greater number of people</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-gray-700">
                                                <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                                <span>Intensify and strengthen linkages with industries known for their international standards</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-gray-700">
                                                <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                                <span>Intensify and strengthen stakeholder's linkages</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-gray-700">
                                                <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                                <span>Improve capability in income generating project production and entrepreneurship</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-gray-700">
                                                <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                                <span>Greening ISAT</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-gray-700">
                                                <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                                <span>Construction of new training laboratories</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-gray-700">
                                                <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                                <span>Implement flexible learning delivery</span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Objectives */}
                                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200">
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <TrendingUp className="h-5 w-5 text-white" />
                                            </div>
                                            <h4 className="text-xl font-bold text-orange-900">OBJECTIVES</h4>
                                        </div>
                                        <ul className="space-y-2 pl-13">
                                            <li className="flex items-start gap-2 text-gray-700">
                                                <ArrowRight className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                                <span>To strive for excellence in skills training strategy</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-gray-700">
                                                <ArrowRight className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                                <span>To upgrade programs in skills training for trainers to be globally competent</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-gray-700">
                                                <ArrowRight className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                                <span>To conduct TVET research</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-gray-700">
                                                <ArrowRight className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                                <span>To produce globally competitive trainees</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-gray-700">
                                                <ArrowRight className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                                <span>To conduct skills training to be identified areas</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-gray-700">
                                                <ArrowRight className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                                <span>To produce globally competitive skilled workforce</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-gray-700">
                                                <ArrowRight className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                                <span>To establish a strong relationship with different stakeholders of the school</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-gray-700">
                                                <ArrowRight className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                                <span>To encourage trainers of all qualifications to venture into IGP</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-gray-700">
                                                <ArrowRight className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                                <span>To serve quality and different variety of products</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-gray-700">
                                                <ArrowRight className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                                <span>To achieve 100% ARTA/CUSAT positive comments on services and products</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-gray-700">
                                                <ArrowRight className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                                <span>To increase the marketability of products and services</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-gray-700">
                                                <ArrowRight className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                                <span>To re-orient existing education programs to address sustainable development</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-gray-700">
                                                <ArrowRight className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                                <span>Construct additional training laboratories that conforms to the international standards</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-gray-700">
                                                <ArrowRight className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                                <span>Offer programs relevant to the new normal situation/condition and in demand in the locality</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-gray-700">
                                                <ArrowRight className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                                <span>Continues implementation of disrupted programs</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                                <button
                                    onClick={() => setIsLearnMoreOpen(false)}
                                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all font-semibold"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out forwards;
                }
                @keyframes slide-up {
                    from { 
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.6s ease-out forwards;
                }
                .animation-delay-200 {
                    animation-delay: 0.2s;
                    opacity: 0;
                }
                .animation-delay-400 {
                    animation-delay: 0.4s;
                    opacity: 0;
                }
                .animation-delay-600 {
                    animation-delay: 0.6s;
                    opacity: 0;
                }
            `}</style>
        </>
    );
}
