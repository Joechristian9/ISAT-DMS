import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Home, FileText, User, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TeacherLayout({ children, user = { name: 'User', email: 'user@example.com' } }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    const handleLogout = () => {
        router.post(route('logout'));
    };

    const navigation = [
        { name: 'Dashboard', href: route('teacher.dashboard'), icon: Home },
        { name: 'IPCRF Tool', href: route('teacher.ipcrf'), icon: FileText },
    ];

    const isActive = (href) => {
        return window.location.pathname === new URL(href).pathname;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-50 to-green-100">
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/50 z-[45] transition-opacity duration-300 ${
                    sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setSidebarOpen(false)}
            ></div>

            {/* Toggle Button - Always visible on left edge */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`fixed top-1/2 -translate-y-1/2 z-50 bg-white hover:bg-gray-50 shadow-lg rounded-r-2xl transition-all duration-300 ${
                    sidebarOpen ? 'left-64' : 'left-0'
                }`}
                style={{ padding: '20px 12px' }}
            >
                {sidebarOpen ? (
                    <ChevronLeft className="h-6 w-6 text-gray-700" />
                ) : (
                    <ChevronRight className="h-6 w-6 text-gray-700" />
                )}
            </button>

            {/* Sidebar Drawer - Slides from left */}
            <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white/95 backdrop-blur-lg shadow-xl border-r border-green-100 transform transition-transform duration-300 ease-in-out ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3 p-6 border-b border-green-100">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-green-600 rounded-full blur opacity-25"></div>
                            <img 
                                src="/pictures/isat.jpg" 
                                alt="ISAT" 
                                className="relative h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-lg"
                            />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-600">
                                ISAT DMS
                            </h2>
                            <p className="text-xs text-gray-600 font-medium">Teacher Portal</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                        active
                                            ? 'bg-gradient-to-r from-green-600 to-green-600 text-white shadow-lg'
                                            : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                                    }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Section */}
                    <div className="p-4 border-t border-green-100">
                        <div className="relative">
                            <button
                                onClick={() => setShowUserDropdown(!showUserDropdown)}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-green-50 transition-colors"
                            >
                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-green-100 to-green-200 flex-shrink-0">
                                    {user.photo ? (
                                        <img
                                            src={`/storage/${user.photo}`}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-lg font-bold text-green-600">
                                                {user.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                    <p className="text-xs text-gray-600 truncate">{user.email}</p>
                                </div>
                            </button>

                            {/* User Dropdown */}
                            {showUserDropdown && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-10" 
                                        onClick={() => setShowUserDropdown(false)}
                                    ></div>
                                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-20 animate-in slide-in-from-bottom-2 duration-200">
                                        <Link
                                            href={route('profile.edit')}
                                            className="flex items-center gap-3 px-4 py-2 hover:bg-green-50 transition-colors"
                                            onClick={() => {
                                                setShowUserDropdown(false);
                                                setSidebarOpen(false);
                                            }}
                                        >
                                            <Settings className="h-4 w-4 text-gray-600" />
                                            <span className="text-sm text-gray-700">Profile Settings</span>
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setShowUserDropdown(false);
                                                setSidebarOpen(false);
                                                handleLogout();
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition-colors text-left"
                                        >
                                            <LogOut className="h-4 w-4 text-red-600" />
                                            <span className="text-sm text-red-600 font-medium">Logout</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div>
                {/* Page Content */}
                <main>
                    {children}
                </main>
            </div>
        </div>
    );
}
