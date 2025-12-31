import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { API_LOGIN_URL, API_REGISTER_URL, API_LOGOUT_URL } from '../constants';
import { setTokens, clearTokens, getAuthToken, fetchWithAuth } from '../dataService';
import { AlertCircle, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionExpired, setSessionExpired] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = getAuthToken();
        if (token) {
            setUser({ authenticated: true });
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
            const response = await fetch(API_LOGIN_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();
            if (response.ok && result.data && result.data.token) {
                setTokens(result.data.token, result.data.refreshToken);
                setUser({ authenticated: true, username });
                router.push('/dashboard/dashboard2');
                return { success: true };
            } else {
                return { success: false, message: result.meta?.description || 'Login failed' };
            }
        } catch (error) {
            return { success: false, message: 'An error occurred during login' };
        }
    };

    const register = async (userData) => {
        try {
            const response = await fetch(API_REGISTER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            const result = await response.json();
            if (response.ok) {
                return { success: true };
            } else {
                return { success: false, message: result.meta?.description || 'Registration failed' };
            }
        } catch (error) {
            return { success: false, message: 'An error occurred during registration' };
        }
    };

    const logout = async () => {
        try {
            // Send request to logout endpoint
            await fetchWithAuth(API_LOGOUT_URL, { method: 'POST' });
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            clearTokens();
            setUser(null);
            router.push('/auth/login');
        }
    };

    const handleConfirmExpiry = () => {
        setSessionExpired(false);
        clearTokens();
        setUser(null);
        router.push('/auth/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}

            {/* Session Expired Modal */}
            <AnimatePresence>
                {sessionExpired && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
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
