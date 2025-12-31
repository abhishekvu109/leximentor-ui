import { useState } from 'react';
import Head from 'next/head';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        fullName: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login, register } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (isLogin) {
            const result = await login(formData.username, formData.password);
            if (!result.success) {
                setError(result.message);
            }
        } else {
            const result = await register({
                username: formData.username,
                password: formData.password,
                email: formData.email,
                fullName: formData.fullName
            });
            if (result.success) {
                setIsLogin(true);
                setError('Registration successful! Please login.');
            } else {
                setError(result.message);
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 selection:bg-blue-500/30">
            <Head>
                <title>{isLogin ? 'Login' : 'Register'} | LexiMentor</title>
            </Head>

            {/* Background Blob Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse delay-700" />
            </div>

            <div className="w-full max-w-md relative">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black italic shadow-lg shadow-blue-500/20 text-2xl">L</div>
                        <span className="text-3xl font-bold tracking-tight text-white">Lexi<span className="text-blue-500">Mentor</span></span>
                    </div>
                    <p className="text-slate-400 font-medium">Elevate your vocabulary and language skills</p>
                </div>

                {/* Card */}
                <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl overflow-hidden relative group">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                    <div className="flex bg-slate-900/50 p-1 rounded-xl mb-8 border border-slate-700/30">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isLogin ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'}`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${!isLogin ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'}`}
                        >
                            Register
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        {!isLogin && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            required={!isLogin}
                                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required={!isLogin}
                                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                            placeholder="name@example.com"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                    placeholder="yourusername"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                                {isLogin && <a href="#" className="text-[11px] font-bold text-blue-500 hover:text-blue-400 transition-colors">Forgot password?</a>}
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-slate-700/50 pt-6">
                        <p className="text-slate-500 text-sm">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-blue-500 font-bold hover:text-blue-400 transition-all"
                            >
                                {isLogin ? 'Register now' : 'Sign in instead'}
                            </button>
                        </p>
                    </div>
                </div>

                {/* Footer simple link */}
                <div className="mt-8 text-center flex items-center justify-center gap-6 text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                    <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-slate-400 transition-colors">Help Center</a>
                </div>
            </div>
        </div>
    );
}
