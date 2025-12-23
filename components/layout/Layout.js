import Script from "next/script";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import NewSidebar from "./NewSidebar";
import { Menu, X as CloseIcon } from "lucide-react";

const Layout = ({ content }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        if (typeof window !== "undefined" && window.initFlowbite) {
            window.initFlowbite();
        }
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
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
                        <div className="flex items-center ms-3">
                            <div>
                                <button type="button"
                                    className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                                    aria-expanded="false" data-dropdown-toggle="dropdown-user">
                                    <span className="sr-only">Open user menu</span>
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white dark:ring-gray-700 shadow-sm">
                                        JD
                                    </div>
                                </button>
                            </div>
                            <div
                                className="z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-xl shadow-xl dark:bg-gray-700 dark:divide-gray-600 border border-gray-100 dark:border-gray-600"
                                id="dropdown-user">
                                <div className="px-4 py-3" role="none">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white" role="none">
                                        Abhishek V
                                    </p>
                                    <p className="text-xs font-medium text-gray-400 truncate tracking-tight"
                                        role="none">
                                        abhishek@leximentor.pro
                                    </p>
                                </div>
                                <ul className="py-1" role="none">
                                    <li>
                                        <a href="#"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                                            role="menuitem">Dashboard</a>
                                    </li>
                                    <li>
                                        <a href="#"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                                            role="menuitem">Settings</a>
                                    </li>
                                    <li>
                                        <a href="#"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                                            role="menuitem">Earnings</a>
                                    </li>
                                    <li>
                                        <a href="#"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                                            role="menuitem">Sign out</a>
                                    </li>
                                </ul>
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