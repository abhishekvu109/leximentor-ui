import React, { useState } from 'react';
import Link from 'next/link';
import {
    LayoutDashboard,
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
    MessageSquare
} from 'lucide-react';

const NewSidebar = () => {
    const [openSections, setOpenSections] = useState({});

    const toggleSection = (name) => {
        setOpenSections(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    const menuItems = [
        {
            type: 'link',
            label: 'Dashboard',
            icon: LayoutDashboard,
            href: '/dashboard/dashboard2'
        },
        {
            type: 'category', // Collapsible
            label: 'LexiMentor',
            icon: BookOpen,
            id: 'leximentor',
            subItems: [
                { label: 'Dashboard', href: '/dashboard/dashboard2' },
                { label: 'Drills', href: '/drills/drills/list-drills' },
                { label: 'Challenges', href: '#' },
                { label: 'Analytics', href: '/analytics/primal' }
            ]
        },
        {
            type: 'category',
            label: 'Writewise',
            icon: PenTool,
            id: 'writewise',
            subItems: [
                { label: 'Dashboard', href: '/writewise/topics/generate-topics' },
                { label: 'Drills', href: '#' },
                { label: 'Challenges', href: '#' },
                { label: 'Analytics', href: '#' }
            ]
        },
        {
            type: 'category',
            label: 'Fitmate',
            icon: Dumbbell,
            id: 'fitmate',
            subItems: [
                { label: 'Dashboard', href: '/fitmate/dashboard/dashboard' },
                { label: 'Routine', href: '/fitmate/routine/routine' },
                { label: 'Exercise', href: '/fitmate/exercise/exercise' },
                { label: 'Challenges', href: '#' },
                { label: 'Analytics', href: '#' }
            ]
        },
        {
            type: 'divider'
        },
        /*
        {
            type: 'link',
            label: 'Synapster',
            icon: Zap,
            href: '#'
        },
        {
            type: 'link',
            label: 'Products',
            icon: ShoppingBag,
            href: '#'
        },
        {
            type: 'divider'
        },
        {
            type: 'link',
            label: 'Sign In',
            icon: LogIn,
            href: '#'
        },
        {
            type: 'link',
            label: 'Sign Up',
            icon: UserPlus,
            href: '#'
        }
        */
    ];

    return (
        <aside className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-slate-200 sm:translate-x-0 dark:bg-slate-900 dark:border-slate-800">
            <div className="h-full px-4 pb-4 overflow-y-auto">
                <ul className="space-y-1 font-medium">
                    {menuItems.map((item, index) => {
                        if (item.type === 'divider') {
                            return <li key={index} className="my-4 border-t border-slate-100 dark:border-slate-800" />;
                        }

                        if (item.type === 'category') {
                            const isOpen = openSections[item.id];
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
                                        {isOpen ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                                    </button>

                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <ul className="py-2 space-y-1">
                                            {item.subItems.map((sub, subIdx) => (
                                                <li key={subIdx}>
                                                    <Link
                                                        href={sub.href}
                                                        className="flex items-center w-full p-2 text-sm text-slate-600 transition duration-75 rounded-lg pl-11 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                                                    >
                                                        {sub.label}
                                                    </Link>
                                                </li>
                                            ))}
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
