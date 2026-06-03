import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { 
    CheckCircle, 
    Award,
    ArrowRight,
    Target,
    Eye,
    X,
    ChevronDown,
    Sparkles,
    TrendingUp
} from 'lucide-react';

export default function Welcome({ auth }) {
    const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);
    const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [isVisible, setIsVisible] = useState({});
    const observerRef = useRef(null);
    const dropdownRef = useRef(null);

    // Scroll handler for parallax and sticky nav
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Intersection Observer for scroll-triggered animations
    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible((prev) => ({
                            ...prev,
                            [entry.target.id]: true,
                        }));
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
        );

        // Observe all sections
        const sections = document.querySelectorAll('[data-animate]');
        sections.forEach((section) => {
            if (observerRef.current) {
                observerRef.current.observe(section);
            }
        });

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsAboutDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            <Head title="Welcome to ISAT e-TRACES" />
            
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
                {/* Navigation - Enhanced with glassmorphism and smooth transitions */}
                <nav 
                    className={`bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 transition-all duration-300 ${
                        scrollY > 50 ? 'shadow-lg' : ''
                    }`}
                    style={{
                        transform: scrollY > 50 ? 'translateY(0)' : 'translateY(0)',
                    }}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center gap-3 group cursor-pointer">
                                <div className="relative">
                                    <img 
                                        src="/pictures/isat.tmp" 
                                        alt="ISAT Logo" 
                                        className="h-10 w-10 rounded-lg object-cover transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                                    />
                                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-green-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-green-600">
                                        ISAT e-TRACES
                                    </h1>
                                    <p className="text-xs text-gray-600">Document Management System</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                {/* About ISAT Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsAboutDropdownOpen(!isAboutDropdownOpen)}
                                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[#1a5f3a] transition-colors duration-300 font-medium"
                                    >
                                        About ISAT
                                        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isAboutDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    {isAboutDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 animate-fade-in">
                                            <Link
                                                href="/vision"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#1a5f3a]/10 hover:text-[#1a5f3a] transition-colors duration-200"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Eye className="h-4 w-4" />
                                                    Vision
                                                </div>
                                            </Link>
                                            <Link
                                                href="/mission"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#1a5f3a]/10 hover:text-[#1a5f3a] transition-colors duration-200"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Target className="h-4 w-4" />
                                                    Mission
                                                </div>
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* Login/Dashboard Button */}
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="group inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-[#1a5f3a] to-[#1a5f3a]/90 text-white rounded-lg hover:from-[#1a5f3a]/90 hover:to-[#1a5f3a] transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                                    >
                                        Dashboard
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('login')}
                                        className="group px-6 py-2.5 bg-gradient-to-r from-[#1a5f3a] to-[#1a5f3a]/90 text-white rounded-lg hover:from-[#1a5f3a]/90 hover:to-[#1a5f3a] transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                                    >
                                        Log in
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section - Enhanced with parallax */}
                <section 
                    className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[90vh] flex items-center"
                    id="hero"
                    data-animate
                >
                    {/* Background Decoration with parallax */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div 
                            className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1a5f3a]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"
                            style={{ transform: `translateY(${scrollY * 0.1}px)` }}
                        ></div>
                        <div 
                            className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#fbbf24]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"
                            style={{ transform: `translateY(${scrollY * 0.15}px)` }}
                        ></div>
                        <div 
                            className="absolute bottom-0 left-1/2 w-[500px] h-[500px] bg-[#1a5f3a]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"
                            style={{ transform: `translateY(${scrollY * 0.05}px)` }}
                        ></div>
                    </div>

                    <div className="max-w-7xl mx-auto relative">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            {/* Left Content - Enhanced animations */}
                            <div className="text-left space-y-8">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1a5f3a]/10 to-[#fbbf24]/10 text-[#1a5f3a] rounded-full text-sm font-medium animate-fade-in border border-[#1a5f3a]/30 hover:shadow-md transition-all duration-300">
                                    <Sparkles className="h-4 w-4 animate-pulse" />
                                    For Teachers, By Educators
                                </div>
                                
                                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight animate-slide-up">
                                    Empower Your
                                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#1a5f3a] via-[#fbbf24] to-[#1a5f3a] mt-2 animate-gradient">
                                        Teaching Career
                                    </span>
                                </h1>
                                
                                <p className="text-xl text-gray-600 leading-relaxed animate-slide-up animation-delay-200">
                                    Digital IPCRF submission and performance tracking made simple. 
                                    Focus on teaching while we handle your professional documentation.
                                </p>
                                
                                <div className="flex flex-col sm:flex-row items-start gap-4 animate-slide-up animation-delay-400">
                                    {!auth.user ? (
                                        <Link
                                            href={route('login')}
                                            className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#1a5f3a] to-[#1a5f3a]/90 text-white rounded-xl hover:from-[#1a5f3a]/90 hover:to-[#1a5f3a] transition-all transform hover:scale-105 hover:shadow-2xl font-semibold overflow-hidden"
                                        >
                                            <span className="absolute inset-0 w-full h-full bg-[#fbbf24]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                            <span className="relative">Get Started</span>
                                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform relative" />
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route('dashboard')}
                                            className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#1a5f3a] to-[#1a5f3a]/90 text-white rounded-xl hover:from-[#1a5f3a]/90 hover:to-[#1a5f3a] transition-all transform hover:scale-105 hover:shadow-2xl font-semibold overflow-hidden"
                                        >
                                            <span className="absolute inset-0 w-full h-full bg-[#fbbf24]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                            <span className="relative">Go to My Dashboard</span>
                                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform relative" />
                                        </Link>
                                    )}
                                </div>
                                
                                {/* Scroll indicator */}
                                <div className="flex justify-center pt-8 animate-bounce">
                                    <ChevronDown className="h-8 w-8 text-gray-400" />
                                </div>
                            </div>

                            {/* Right Content - Enhanced with 3D effect */}
                            <div className="relative animate-fade-in animation-delay-400">
                                <div className="relative perspective-1000">
                                    {/* Main Image Container with glassmorphism */}
                                    <div className="relative bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-500 hover:rotate-1 backdrop-blur-sm">
                                        <div className="relative overflow-hidden rounded-2xl">
                                            <img 
                                                src="/pictures/isat.tmp" 
                                                alt="ISAT" 
                                                className="w-full h-auto shadow-lg transition-transform duration-700 hover:scale-110"
                                                loading="eager"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                                        </div>
                                        
                                        {/* Floating Cards with enhanced animations */}
                                        <div className="absolute -top-6 -right-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 animate-float hover:shadow-2xl transition-shadow duration-300 border border-green-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">Verified</div>
                                                    <div className="text-xs text-gray-500">Secure System</div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 animate-float animation-delay-2000 hover:shadow-2xl transition-shadow duration-300 border border-blue-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
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

                {/* Campus Gallery Section - ISAT Branding */}
                <section 
                    className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-[#1a5f3a]/5 relative overflow-hidden"
                    id="gallery"
                    data-animate
                >
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#1a5f3a]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#fbbf24]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                    
                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a5f3a]/10 text-[#1a5f3a] rounded-full text-sm font-medium mb-4 border border-[#1a5f3a]/30">
                                <Eye className="h-4 w-4" />
                                Our Campus
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Isabela School of Arts and Trades
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                A glimpse into our vibrant learning environment where excellence meets innovation
                            </p>
                        </div>

                        {/* Image Grid with hover effects */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Main featured image - larger */}
                            <div className={`lg:col-span-2 lg:row-span-2 group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                                isVisible.gallery ? 'animate-fade-in-up' : 'opacity-0'
                            }`}>
                                <div className="relative h-full min-h-[400px] overflow-hidden">
                                    <img 
                                        src="/pictures/pic1.jpg" 
                                        alt="ISAT Campus Main Building" 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                        <h3 className="text-2xl font-bold mb-2">Main Campus</h3>
                                        <p className="text-sm text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                            Where innovation and tradition meet to shape future leaders
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Secondary images - grid layout */}
                            {[
                                { src: '/pictures/pic2.jpg', title: 'Learning Facilities', desc: 'State-of-the-art classrooms' },
                                { src: '/pictures/pic3.jpg', title: 'Campus Grounds', desc: 'Beautiful learning environment' },
                                { src: '/pictures/pic4.jpg', title: 'Student Activities', desc: 'Vibrant campus life' },
                                { src: '/pictures/pic5.jpg', title: 'Academic Excellence', desc: 'Committed to quality education' },
                                { src: '/pictures/pic6.jpg', title: 'Community', desc: 'Building tomorrow together' }
                            ].map((image, index) => (
                                <div 
                                    key={index}
                                    className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                                        isVisible.gallery ? 'animate-fade-in-up' : 'opacity-0'
                                    }`}
                                    style={{ animationDelay: `${(index + 1) * 150}ms` }}
                                >
                                    <div className="relative h-64 overflow-hidden">
                                        <img 
                                            src={image.src}
                                            alt={image.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            <h3 className="text-lg font-bold mb-1">{image.title}</h3>
                                            <p className="text-xs text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                                {image.desc}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-[#2c3e50] text-gray-300 py-4 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                            <p className="text-sm text-gray-400">
                                © {new Date().getFullYear()} ISAT e-TRACES. All rights reserved.
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                                <Award className="h-4 w-4 text-[#fbbf24]" />
                                <span className="text-gray-400">
                                    Isabela School of Arts and Trades
                                </span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Learn More Modal - Enhanced */}
            {isLearnMoreOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay with blur */}
                        <div 
                            className="fixed inset-0 transition-all duration-300 bg-gray-900/80 backdrop-blur-sm"
                            onClick={() => setIsLearnMoreOpen(false)}
                            style={{ animation: 'fade-in 0.3s ease-out' }}
                        ></div>

                        {/* Modal panel with scale animation */}
                        <div 
                            className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
                            style={{ animation: 'scale-in 0.3s ease-out' }}
                        >
                            {/* Header - Enhanced */}
                            <div className="bg-gradient-to-r from-[#1a5f3a] via-[#fbbf24] to-[#1a5f3a] px-6 py-6 relative overflow-hidden">
                                {/* Animated background pattern */}
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
                                </div>
                                
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="relative group">
                                            <img 
                                                src="/pictures/isat.tmp" 
                                                alt="ISAT Logo" 
                                                className="h-12 w-12 rounded-lg object-cover transition-transform duration-300 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 rounded-lg bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white">About ISAT</h3>
                                            <p className="text-green-100 text-sm">Vision, Mission, Goals & Objectives</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsLearnMoreOpen(false)}
                                        className="text-white hover:text-gray-200 transition-all duration-300 hover:rotate-90 hover:scale-110 p-2 rounded-lg hover:bg-white/10"
                                        aria-label="Close modal"
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

                            {/* Footer - Enhanced */}
                            <div className="bg-gradient-to-r from-gray-50 to-[#fbbf24]/10 px-6 py-4 border-t border-gray-200">
                                <button
                                    onClick={() => setIsLearnMoreOpen(false)}
                                    className="group w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#1a5f3a] to-[#1a5f3a]/90 text-white rounded-lg hover:from-[#1a5f3a]/90 hover:to-[#1a5f3a] transition-all font-semibold transform hover:scale-105 hover:shadow-lg relative overflow-hidden"
                                >
                                    <span className="absolute inset-0 w-full h-full bg-[#fbbf24]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                    <span className="relative">Close</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                /* Performance-optimized animations using GPU acceleration */
                @keyframes blob {
                    0% { 
                        transform: translate3d(0px, 0px, 0) scale(1);
                    }
                    33% { 
                        transform: translate3d(30px, -50px, 0) scale(1.1);
                    }
                    66% { 
                        transform: translate3d(-20px, 20px, 0) scale(0.9);
                    }
                    100% { 
                        transform: translate3d(0px, 0px, 0) scale(1);
                    }
                }
                
                .animate-blob {
                    animation: blob 7s infinite;
                    will-change: transform;
                }
                
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                
                @keyframes float {
                    0%, 100% { 
                        transform: translateY(0px) translateZ(0);
                    }
                    50% { 
                        transform: translateY(-20px) translateZ(0);
                    }
                }
                
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                    will-change: transform;
                }
                
                @keyframes fade-in {
                    from { 
                        opacity: 0;
                        transform: translateZ(0);
                    }
                    to { 
                        opacity: 1;
                        transform: translateZ(0);
                    }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out forwards;
                }
                
                @keyframes slide-up {
                    from { 
                        opacity: 0;
                        transform: translate3d(0, 30px, 0);
                    }
                    to { 
                        opacity: 1;
                        transform: translate3d(0, 0, 0);
                    }
                }
                
                .animate-slide-up {
                    animation: slide-up 0.6s ease-out forwards;
                    will-change: transform, opacity;
                }
                
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translate3d(0, 40px, 0);
                    }
                    to {
                        opacity: 1;
                        transform: translate3d(0, 0, 0);
                    }
                }
                
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                    will-change: transform, opacity;
                }
                
                @keyframes gradient {
                    0%, 100% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                }
                
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 3s ease infinite;
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
                
                /* 3D perspective for cards */
                .perspective-1000 {
                    perspective: 1000px;
                }
                
                /* Smooth scroll behavior */
                html {
                    scroll-behavior: smooth;
                }
                
                /* Accessibility: Respect user's motion preferences */
                @media (prefers-reduced-motion: reduce) {
                    *,
                    *::before,
                    *::after {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                        scroll-behavior: auto !important;
                    }
                    
                    .animate-blob,
                    .animate-float,
                    .animate-pulse,
                    .animate-bounce {
                        animation: none !important;
                    }
                }
                
                /* Loading optimization */
                img {
                    content-visibility: auto;
                }
                
                /* GPU acceleration hints */
                .transform,
                .transition-transform,
                .hover\\:scale-105,
                .hover\\:scale-110,
                .group-hover\\:scale-110 {
                    will-change: transform;
                }
                
                /* Remove will-change after animation completes */
                .animate-fade-in,
                .animate-slide-up,
                .animate-fade-in-up {
                    animation-fill-mode: forwards;
                }
                
                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
                
                /* Focus visible for accessibility */
                *:focus-visible {
                    outline: 2px solid #1a5f3a;
                    outline-offset: 2px;
                    border-radius: 4px;
                }
                
                /* High contrast mode support */
                @media (prefers-contrast: high) {
                    .bg-gradient-to-r,
                    .bg-gradient-to-br {
                        background: #1a5f3a !important;
                    }
                }
                
                /* Modal animations */
                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateZ(0);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateZ(0);
                    }
                }
                
                @keyframes shimmer {
                    from {
                        transform: translateX(-100%);
                    }
                    to {
                        transform: translateX(100%);
                    }
                }
                
                .animate-shimmer {
                    animation: shimmer 3s infinite;
                }
            `}</style>
            
            {/* Scroll to top button */}
            {scrollY > 500 && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-8 right-8 z-40 p-4 bg-gradient-to-r from-[#1a5f3a] to-[#1a5f3a]/90 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 animate-fade-in group"
                    aria-label="Scroll to top"
                >
                    <ChevronDown className="h-6 w-6 rotate-180 group-hover:-translate-y-1 transition-transform duration-300" />
                </button>
            )}
        </>
    );
}
