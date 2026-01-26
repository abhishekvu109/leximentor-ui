import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import authService from '../services/auth.service';
import { AlertCircle, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthContext = createContext();

// Helper to parse JWT
const parseJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionExpired, setSessionExpired] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const storedUsername = typeof window !== 'undefined' ? localStorage.getItem('username') : null;
        if (token) {
            const decoded = parseJwt(token);
            setUser({
                authenticated: true,
                username: storedUsername || decoded?.sub || 'User',
                roles: decoded?.roles || [],
                profile: decoded?.profile || 'MEMBER'
            });
        }
        setLoading(false);

        const handleSessionExpiry = () => {
            setSessionExpired(true);
        };

        window.addEventListener('session-expired', handleSessionExpiry);
        return () => window.removeEventListener('session-expired', handleSessionExpiry);
    }, []);

    const login = async (username, password) => {
        try {
            const result = await authService.login(username, password);
            if (result.data && result.data.token) {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('token', result.data.token);
                    localStorage.setItem('refreshToken', result.data.refreshToken);
                    localStorage.setItem('username', username);
                }

                const decoded = parseJwt(result.data.token);
                setUser({
                    authenticated: true,
                    username,
                    roles: decoded?.roles || [],
                    profile: decoded?.profile || 'MEMBER'
                });

                router.push('/dashboard/dashboard2');
                return { success: true };
            } else {
                return { success: false, message: result.meta?.description || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: error.response?.data?.meta?.description || 'An error occurred during login' };
        }
    };

    const register = async (userData) => {
        try {
            await authService.register(userData);
            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: error.response?.data?.meta?.description || 'An error occurred during registration' };
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('username');
            }
            setUser(null);
            router.push('/auth/login');
        }
    };

    const handleConfirmExpiry = () => {
        setSessionExpired(false);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('username');
        }
        setUser(null);
        router.push('/auth/login');
    };

    const hasAccess = (appId) => {
        if (!user) return false;
        if (user.profile === 'ADMIN') return true;

        // Check if the appId matches any role (case-insensitive)
        const normalizedAppId = appId.toUpperCase();
        return user.roles.some(role => role.toUpperCase() === normalizedAppId);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, hasAccess }}>
            {/* Hide everything else when session expires for security and UI clarity */}
            {!sessionExpired && children}

            {/* Session Expired Modal */}
            <AnimatePresence>
                {sessionExpired && (
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
                        >
                            <div className="bg-red-500 p-8 text-white text-center">
                                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
                                    <AlertCircle size={40} className="text-white" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight">Session Expired</h2>
                                <p className="text-red-100 mt-2 font-medium">Your authorization has expired. Please log in again to continue.</p>
                            </div>
                            <div className="p-6 bg-slate-50">
                                <button
                                    onClick={handleConfirmExpiry}
                                    className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <LogOut size={20} />
                                    Return to Login
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
