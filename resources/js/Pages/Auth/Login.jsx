import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, Lock, LogIn, Eye, EyeOff, Shield } from 'lucide-react';
import { useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log in" />
            
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-green-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                    <div className="absolute top-40 left-40 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
                </div>

                <div className="max-w-md w-full space-y-8 relative z-10">
                    {/* Logo and Header */}
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-green-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                                <img 
                                    src="/pictures/isat.jpg" 
                                    alt="ISAT Logo" 
                                    className="relative h-28 w-28 rounded-full shadow-2xl ring-4 ring-white transform transition duration-500 group-hover:scale-110"
                                />
                                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full p-2.5 shadow-lg transform transition duration-500 group-hover:rotate-12">
                                    <LogIn className="h-5 w-5 text-white" />
                                </div>
                            </div>
                        </div>
                        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-600 mb-2">
                            Welcome Back
                        </h2>
                        <p className="text-base font-semibold text-gray-700">
                            ISAT Document Management System
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Sign in to access your account
                        </p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-6 border border-white/20">
                        {status && (
                            <div className="bg-gradient-to-r from-green-50 to-green-50 border-l-4 border-green-500 p-4 rounded-r-xl animate-fade-in">
                                <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    {status}
                                </p>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            {/* Email Field */}
                            <div className="relative">
                                <div className="relative">
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="peer pl-4 block w-full rounded-xl border-2 border-gray-300 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 hover:border-green-400 h-14"
                                        autoComplete="username"
                                        isFocused={true}
                                        placeholder=" "
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    <label 
                                        htmlFor="email"
                                        className="absolute left-3 top-1/2 -translate-y-1/2 px-2 bg-white text-gray-500 text-base transition-all duration-200 pointer-events-none flex items-center gap-2 peer-focus:top-0 peer-focus:text-xs peer-focus:text-green-600 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-600"
                                    >
                                        <Mail className="h-4 w-4" />
                                        <span>Email Address</span>
                                    </label>
                                </div>
                                <InputError message={errors.email} className="mt-2 animate-shake" />
                            </div>

                            {/* Password Field */}
                            <div className="relative">
                                <div className="relative">
                                    <TextInput
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={data.password}
                                        className="peer pl-4 pr-12 block w-full rounded-xl border-2 border-gray-300 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 hover:border-green-400 h-14 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                                        autoComplete="current-password"
                                        placeholder=" "
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <label 
                                        htmlFor="password"
                                        className="absolute left-3 top-1/2 -translate-y-1/2 px-2 bg-white text-gray-500 text-base transition-all duration-200 pointer-events-none flex items-center gap-2 peer-focus:top-0 peer-focus:text-xs peer-focus:text-green-600 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-600"
                                    >
                                        <Lock className="h-4 w-4" />
                                        <span>Password</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors z-10"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} className="mt-2 animate-shake" />
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center group cursor-pointer">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="rounded-md border-gray-300 text-green-600 shadow-sm focus:ring-green-500 transition-all"
                                    />
                                    <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors font-medium">
                                        Remember me
                                    </span>
                                </label>

                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="group relative w-full flex justify-center items-center gap-3 py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-green-600 via-green-700 to-green-600 bg-size-200 bg-pos-0 hover:bg-pos-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
                                >
                                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-green-400 to-green-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Signing in...</span>
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                                            <span>Sign In to Continue</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Security Badge */}
                        <div className="pt-6 border-t border-gray-200">
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                <Shield className="h-4 w-4 text-green-600" />
                                <span>Protected by ISAT DMS Security</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs text-gray-600">
                        © {new Date().getFullYear()} ISAT Document Management System. All rights reserved.
                    </p>
                </div>
            </div>

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
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
                .bg-size-200 {
                    background-size: 200%;
                }
                .bg-pos-0 {
                    background-position: 0%;
                }
                .bg-pos-100 {
                    background-position: 100%;
                }
            `}</style>
        </>
    );
}
