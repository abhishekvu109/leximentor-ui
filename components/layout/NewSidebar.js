import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    User,
    BookOpen,
    PenTool,
    Dumbbell,
    Users,
    ShoppingBag,
    LogIn,
    UserPlus,
    ChevronDown,
    ChevronRight,
    Search,
    Zap,
    MessageSquare,
    List,
    Trophy,
    BarChart3,
    Activity,
    ClipboardList,
    Settings,
    Grid,
    Plus,
    Activity as ActivityIcon
} from 'lucide-react';

const NewSidebar = ({ isOpen }) => {
    const { hasAccess } = useAuth();
    const [openSections, setOpenSections] = useState({});

    const toggleSection = (name) => {
        setOpenSections(prev => {
            const newState = {
                ...prev,
                [name]: !prev[name]
            };
            if (typeof window !== "undefined") {
                localStorage.setItem('sidebar_sections', JSON.stringify(newState));
            }
            return newState;
        });
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedSections = localStorage.getItem('sidebar_sections');
            if (savedSections) {
                try {
                    setOpenSections(JSON.parse(savedSections));
                } catch (e) {
                    console.error("Failed to parse sidebar sections", e);
                }
            }
        }
    }, []);

    const menuItems = [
        {
            type: 'link',
            label: 'Dashboard',
            icon: LayoutDashboard,
            href: '/dashboard/dashboard2'
        },
        {
            type: 'link',
            label: 'My Profile',
            icon: User,
            href: '/profile'
        },
        {
            type: 'category', // Collapsible
            label: 'LexiMentor',
            icon: BookOpen,
            id: 'leximentor',
            subItems: [
                { label: 'Dashboard', href: '/dashboard/dashboard2', icon: Activity },
                { label: 'Drills', href: '/drills/drills/list-drills', icon: List },
                { label: 'Challenges', href: '#', icon: Trophy },
                { label: 'Analytics', href: '/analytics/primal', icon: BarChart3 }
            ]
        },
        {
            type: 'category',
            label: 'Writewise',
            icon: PenTool,
            id: 'writewise',
            subItems: [
                { label: 'Dashboard', href: '/writewise/topics/generate-topics', icon: Activity },
                { label: 'Topics', href: '/writewise/topics/list-topics', icon: List },
                { label: 'Challenges', href: '/writewise/topics/topic/evaluation-view', icon: Trophy },
                { label: 'Analytics', href: '#', icon: BarChart3 }
            ]
        },
        {
            type: 'category',
            label: 'Fitmate',
            icon: Dumbbell,
            id: 'fitmate',
            subItems: [
                { label: 'Dashboard', href: '/fitmate/dashboard/dashboard', icon: Activity },
                { label: 'Routine', href: '/fitmate/routine/routine', icon: ClipboardList },
                { label: 'Exercise', href: '/fitmate/exercise/exercise', icon: Dumbbell },
                { label: 'Log', href: '/fitmate/logs', icon: List },
                { label: 'Analytics', href: '/fitmate/analytics/exercise', icon: BarChart3 }
            ]
        },
        {
            type: 'category',
            label: 'Cashflow',
            icon: ShoppingBag,
            id: 'cashflow',
            subItems: [
                { label: 'Dashboard', href: '/cashflow', icon: Activity },
                { label: 'Households', href: '/cashflow/households', icon: Grid },
                { label: 'Expense Logs', href: '/cashflow/logs', icon: List },
                { label: 'Earnings', href: '/cashflow/earnings', icon: Activity }
            ]
        },
        {
            type: 'divider'
        },
        {
            type: 'category',
            label: 'Synapster',
            icon: Zap,
            id: 'synapster',
            subItems: [
                { label: 'Dashboard', href: '/synapster/subject/list-subjects', icon: ActivityIcon },
                { label: 'Subjects', href: '/synapster/subject/list-subjects', icon: List },
                { label: 'Create', href: '/synapster/subject/subject', icon: Plus }
            ]
        },
    ];

    return (
        <aside className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform duration-300 ease-in-out bg-white border-r border-slate-200 dark:bg-slate-900 dark:border-slate-800 ${isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full shadow-none'}`}>
            <div className="h-full px-4 pb-4 overflow-y-auto">
                <ul className="space-y-1 font-medium">
                    {menuItems.map((item, index) => {
                        if (item.type === 'divider') {
                            return <li key={index} className="my-4 border-t border-slate-100 dark:border-slate-800" />;
                        }

                        // Check access for category types using their ID
                        if (item.type === 'category') {
                            if (!hasAccess(item.id)) return null;

                            const isSectionOpen = openSections[item.id];
                            const Icon = item.icon;

                            return (
                                <li key={index}>
                                    <button
                                        type="button"
                                        onClick={() => toggleSection(item.id)}
                                        className="flex items-center w-full p-2.5 text-slate-700 rounded-lg group hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <Icon className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300 transition-colors" />
                                        <span className="flex-1 ms-3 text-left whitespace-nowrap">{item.label}</span>
                                        {isSectionOpen ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                                    </button>

                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSectionOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <ul className="py-2 space-y-1">
                                            {item.subItems.map((sub, subIdx) => {
                                                const SubIcon = sub.icon;
                                                return (
                                                    <li key={subIdx}>
                                                        <Link
                                                            href={sub.href}
                                                            className="flex items-center w-full p-2 text-sm text-slate-600 transition duration-75 rounded-lg pl-11 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 group/sub"
                                                        >
                                                            {SubIcon && <SubIcon className="w-3.5 h-3.5 me-2.5 text-slate-400 group-hover/sub:text-slate-600 transition-colors" />}
                                                            <span>{sub.label}</span>
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </li>
                            );
                        }

                        // Link type
                        const Icon = item.icon;
                        return (
                            <li key={index}>
                                <Link
                                    href={item.href}
                                    className="flex items-center p-2.5 text-slate-700 rounded-lg dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 group transition-colors"
                                >
                                    <Icon className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300 transition-colors" />
                                    <span className="flex-1 ms-3 whitespace-nowrap">{item.label}</span>
                                    {item.badge && (
                                        <span className={`inline-flex items-center justify-center px-2 py-0.5 ms-3 text-xs font-medium rounded-full ${item.badge.color}`}>
                                            {item.badge.text}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </aside>
    );
};

export default NewSidebar;
