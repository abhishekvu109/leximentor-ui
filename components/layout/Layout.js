import Script from "next/script";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import NewSidebar from "./NewSidebar";
import {
    Menu,
    X as CloseIcon,
    User,
    Settings,
    CreditCard,
    LogOut,
    ChevronDown,
    LayoutDashboard,
    Bell,
    CheckCircle2
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Layout = ({ content }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const { logout, user } = useAuth();
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    // Helper to get initials
    const getInitials = (name) => {
        if (!name) return "AV";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const toggleSidebar = () => {
        const newState = !isSidebarOpen;
        setIsSidebarOpen(newState);
        if (typeof window !== "undefined") {
            localStorage.setItem('sidebar_open', JSON.stringify(newState));
        }
    };

    const toggleUserDropdown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("%c Toggling user dropdown", "color: blue; font-weight: bold", !isUserDropdownOpen);
        setIsUserDropdownOpen(prev => !prev);
    };

    useEffect(() => {
        console.log("Layout mounted");

        // Restore sidebar state from localStorage
        if (typeof window !== "undefined") {
            const savedState = localStorage.getItem('sidebar_open');
            if (savedState !== null) {
                setIsSidebarOpen(JSON.parse(savedState));
            }
        }

        if (typeof window !== "undefined" && window.initFlowbite) {
            window.initFlowbite();
        }
    }, []); // Only on mount

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isUserDropdownOpen &&
                dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target)) {
                setIsUserDropdownOpen(false);
            }
        };

        if (isUserDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isUserDropdownOpen]);

    console.log("Layout Render - isUserDropdownOpen:", isUserDropdownOpen);
    return <>
        <nav
            className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="px-3 py-3 lg:px-5 lg:pl-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-start">
                        <button
                            onClick={toggleSidebar}
                            className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <span className="sr-only">Toggle sidebar</span>
                            {isSidebarOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                        <Link href="/dashboard/dashboard2" className="flex ms-2 md:me-24 items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black italic">L</div>
                            <span className="self-center text-xl font-bold tracking-tight whitespace-nowrap dark:text-white">Lexi<span className="text-blue-600">Mentor</span></span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-1.5 border border-gray-100 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                            <input type="text" placeholder="Global search..." className="bg-transparent border-none text-xs focus:ring-0 w-32 md:w-48 placeholder-gray-400 font-medium" />
                            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md">⌘K</kbd>
                        </div>
                        <div className="flex items-center ms-3 relative" id="user-menu-container">
                            <div className="flex items-center gap-3">
                                {/* Notifications hub - purely aesthetic for now */}
                                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all hidden sm:flex">
                                    <Bell size={20} />
                                </button>

                                <button type="button"
                                    id="custom-user-menu-button"
                                    ref={buttonRef}
                                    onClick={toggleUserDropdown}
                                    className="flex items-center gap-2 p-1.5 pe-3 text-sm font-medium text-gray-900 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 transition-all border border-gray-100 dark:border-gray-600 shadow-sm"
                                    aria-expanded={isUserDropdownOpen}>
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                                        {getInitials(user?.username)}
                                    </div>
                                    <div className="hidden lg:flex flex-col items-start leading-tight">
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{user?.username || 'Abhishek V'}</span>
                                        <span className="text-[10px] text-green-500 font-bold flex items-center gap-1">
                                            <CheckCircle2 size={8} fill="currentColor" className="text-white" /> Online
                                        </span>
                                    </div>
                                    <ChevronDown size={14} className={`text-gray-400 ms-1 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                            </div>

                            <div
                                ref={dropdownRef}
                                style={{
                                    display: isUserDropdownOpen ? 'block' : 'none',
                                    position: 'absolute',
                                    top: 'calc(100% + 10px)',
                                    right: '0',
                                    zIndex: 9999
                                }}
                                className="text-base list-none bg-white divide-y divide-gray-100 rounded-2xl shadow-2xl dark:bg-gray-700 dark:divide-gray-600 border border-gray-100 dark:border-gray-600 min-w-[220px] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                                id="custom-user-dropdown">
                                <div className="px-4 py-4 bg-gray-50/50 dark:bg-gray-800/50" role="none">
                                    <div className="flex items-center gap-3 mb-2" role="none">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                            {getInitials(user?.username)}
                                        </div>
                                        <div role="none">
                                            <p className="text-sm font-black text-gray-900 dark:text-white" role="none">
                                                {user?.username || 'Abhishek V'}
                                            </p>
                                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider" role="none">
                                                Pro Member
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="py-2" role="none">
                                    <Link href="/dashboard/dashboard2"
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white transition-all group"
                                        role="menuitem">
                                        <LayoutDashboard size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                                        <span className="font-semibold">Dashboard</span>
                                    </Link>
                                    <Link href="/profile"
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white transition-all group"
                                        role="menuitem">
                                        <User size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                                        <span className="font-semibold">My Profile</span>
                                    </Link>
                                    <Link href="#"
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white transition-all group"
                                        role="menuitem">
                                        <Settings size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                                        <span className="font-semibold">Account Settings</span>
                                    </Link>
                                    <Link href="#"
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white transition-all group"
                                        role="menuitem">
                                        <CreditCard size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                                        <span className="font-semibold">Billing & Plans</span>
                                    </Link>
                                </div>
                                <div className="py-2" role="none">
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-all group"
                                        role="menuitem">
                                        <LogOut size={18} className="text-red-400 group-hover:translate-x-1 transition-transform" />
                                        <span className="font-bold">Sign out</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <NewSidebar isOpen={isSidebarOpen} />

        <div className={`p-0 transition-all duration-300 ease-in-out bg-gray-50/50 min-h-screen ${isSidebarOpen ? 'sm:ml-64' : 'ml-0'}`}>
            <main className="p-4 md:p-8 mt-14 max-w-[1600px] mx-auto">
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden p-6 md:p-8 min-h-[calc(100vh-160px)]">
                    {content}
                </div>
            </main>
        </div>
    </>
};

export default Layout;