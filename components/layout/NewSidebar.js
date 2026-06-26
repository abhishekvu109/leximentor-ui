import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, User, BookOpen, PenTool, Dumbbell, ShoppingBag,
    ChevronDown, Zap, List, Trophy, BarChart3, Activity, ClipboardList,
    Settings, Grid, Plus, UtensilsCrossed, Tags, Layers, Download
} from 'lucide-react';

// Per-module accent colors for the icon pill
const MODULE_COLORS = {
    leximentor: { pill: 'bg-blue-500/15',    icon: 'text-blue-400'    },
    writewise:  { pill: 'bg-violet-500/15',  icon: 'text-violet-400'  },
    fitmate:    { pill: 'bg-emerald-500/15', icon: 'text-emerald-400' },
    cashflow:   { pill: 'bg-orange-500/15',  icon: 'text-orange-400'  },
    synapster:  { pill: 'bg-amber-500/15',   icon: 'text-amber-400'   },
    flashcards: { pill: 'bg-rose-500/15',    icon: 'text-rose-400'    },
};

const MENU = [
    { type: 'link',  label: 'Dashboard',  icon: LayoutDashboard, href: '/dashboard/dashboard2' },
    { type: 'link',  label: 'My Profile', icon: User,             href: '/profile' },
    { type: 'label', text: 'Apps' },
    {
        type: 'category', label: 'LexiMentor', icon: BookOpen, id: 'leximentor',
        subItems: [
            { label: 'Dashboard',  href: '/dashboard/dashboard2',      icon: Activity  },
            { label: 'Drills',     href: '/drills/drills/list-drills', icon: List      },
            { label: 'Challenges', href: '#',                           icon: Trophy    },
            { label: 'Analytics',  href: '/analytics/primal',           icon: BarChart3 },
        ]
    },
    {
        type: 'category', label: 'Writewise', icon: PenTool, id: 'writewise',
        subItems: [
            { label: 'Dashboard',  href: '/writewise/dashboard',                    icon: Activity  },
            { label: 'Topics',     href: '/writewise/topics',                       icon: List      },
            { label: 'Challenges', href: '/writewise/topics/topic/evaluation-view', icon: Trophy    },
            { label: 'Analytics',  href: '/writewise/analytics',                    icon: BarChart3 },
        ]
    },
    {
        type: 'category', label: 'Fitmate', icon: Dumbbell, id: 'fitmate',
        subItems: [
            { label: 'Dashboard', href: '/fitmate/dashboard/dashboard', icon: Activity      },
            { label: 'Routine',   href: '/fitmate/routine/routine',     icon: ClipboardList },
            { label: 'Exercise',  href: '/fitmate/exercise/exercise',   icon: Dumbbell      },
            { label: 'Log',       href: '/fitmate/logs',                icon: List          },
            {
                type: 'nested', label: 'Nutrition', icon: UtensilsCrossed, id: 'fitmate-nutrition',
                subItems: [
                    { label: 'Dashboard', href: '/fitmate/nutrition',           icon: Activity  },
                    { label: 'Batch Log', href: '/fitmate/nutrition/batch-log', icon: Plus      },
                    { label: 'History',   href: '/fitmate/nutrition/history',   icon: List      },
                    { label: 'Trends',    href: '/fitmate/nutrition/trends',    icon: BarChart3 },
                    { label: 'Settings',  href: '/fitmate/nutrition/settings',  icon: Settings  },
                ]
            },
            { label: 'Analytics',          href: '/fitmate/analytics/exercise', icon: BarChart3 },
            { label: 'Advanced Analytics', href: '/fitmate/advanced-analytics', icon: BarChart3 },
            { label: 'Export',             href: '/fitmate/export',              icon: Download  },
        ]
    },
    {
        type: 'category', label: 'Cashflow', icon: ShoppingBag, id: 'cashflow',
        subItems: [
            { label: 'Dashboard',    href: '/cashflow',            icon: Activity  },
            { label: 'Households',   href: '/cashflow/households', icon: Grid      },
            { label: 'Categories',   href: '/cashflow/categories', icon: Tags      },
            { label: 'Expense Logs', href: '/cashflow/logs',       icon: List      },
            { label: 'Earnings',     href: '/cashflow/earnings',   icon: Activity  },
            { label: 'Export',       href: '/cashflow/export',     icon: Download  },
        ]
    },
    { type: 'label', text: 'Tools' },
    {
        type: 'category', label: 'Synapster', icon: Zap, id: 'synapster',
        subItems: [
            { label: 'Dashboard', href: '/synapster/subject/list-subjects', icon: Activity },
            { label: 'Subjects',  href: '/synapster/subject/list-subjects', icon: List     },
            { label: 'Create',    href: '/synapster/subject/subject',       icon: Plus     },
        ]
    },
    {
        type: 'category', label: 'Flashcards', icon: Layers, id: 'flashcards',
        subItems: [
            { label: 'Dashboard',         href: '/flashcards',                   icon: Activity },
            { label: 'Browse Categories', href: '/flashcards/categories',        icon: Grid     },
            { label: 'Manage Categories', href: '/flashcards/categories-manage', icon: Settings },
            { label: 'My Decks',          href: '/flashcards/decks',             icon: List     },
            { label: 'Create Deck',       href: '/flashcards/decks/create',      icon: Plus     },
        ]
    },
];

const NewSidebar = ({ isOpen }) => {
    const { hasAccess } = useAuth();
    const { pathname } = useRouter();
    const [openSections, setOpenSections] = useState({});

    const isLinkActive = (href) => {
        if (!href || href === '#') return false;
        if (pathname === href) return true;
        const hSegs = href.split('/').filter(Boolean);
        const pSegs = pathname.split('/').filter(Boolean);
        if (hSegs.length >= 2 && pSegs.length >= 2) {
            return pSegs.slice(0, 2).join('/') === hSegs.slice(0, 2).join('/');
        }
        return false;
    };

    const isSectionActive = (subItems) =>
        subItems?.some(s =>
            s.type === 'nested'
                ? s.subItems?.some(ns => isLinkActive(ns.href))
                : isLinkActive(s.href)
        );

    const toggle = (id) => {
        setOpenSections(prev => {
            const next = { ...prev, [id]: !prev[id] };
            if (typeof window !== 'undefined') localStorage.setItem('sidebar_sections', JSON.stringify(next));
            return next;
        });
    };

    useEffect(() => {
        try {
            const saved = localStorage.getItem('sidebar_sections');
            if (saved) setOpenSections(JSON.parse(saved));
        } catch {}
    }, []);

    // Auto-expand section that owns the current route
    useEffect(() => {
        const updates = {};
        MENU.forEach(item => {
            if (item.type === 'category' && isSectionActive(item.subItems)) {
                updates[item.id] = true;
            }
        });
        if (Object.keys(updates).length) {
            setOpenSections(prev => ({ ...prev, ...updates }));
        }
    }, [pathname]);

    return (
        <aside className={`fixed top-0 left-0 z-40 w-64 h-screen border-r transition-transform duration-300 ease-in-out
            bg-white border-gray-100 dark:bg-[#0d0f14] dark:border-white/[0.06]
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex flex-col h-full overflow-hidden pt-16">

                {/* Scrollable nav */}
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5" style={{ scrollbarWidth: 'none' }}>
                    {MENU.map((item, idx) => {

                        /* ── Section label ── */
                        if (item.type === 'label') return (
                            <div key={idx} className="px-3 pt-5 pb-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 dark:text-slate-600">
                                    {item.text}
                                </span>
                            </div>
                        );

                        /* ── Direct link ── */
                        if (item.type === 'link') {
                            const Icon = item.icon;
                            const active = isLinkActive(item.href);
                            return (
                                <Link key={idx} href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group
                                        ${active
                                            ? 'bg-blue-50 text-blue-700 dark:bg-white/10 dark:text-white'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-500 dark:hover:text-slate-200 dark:hover:bg-white/5'
                                        }`}>
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors
                                        ${active
                                            ? 'bg-blue-100 dark:bg-white/10'
                                            : 'group-hover:bg-gray-100 dark:group-hover:bg-white/5'
                                        }`}>
                                        <Icon size={14} className={active
                                            ? 'text-blue-600 dark:text-white'
                                            : 'text-gray-400 group-hover:text-gray-600 dark:text-slate-600 dark:group-hover:text-slate-400'
                                        } />
                                    </div>
                                    <span>{item.label}</span>
                                </Link>
                            );
                        }

                        /* ── Category (collapsible) ── */
                        if (item.type === 'category') {
                            if (!hasAccess(item.id)) return null;
                            const Icon = item.icon;
                            const colors = MODULE_COLORS[item.id] || MODULE_COLORS.leximentor;
                            const expanded = !!openSections[item.id];
                            const sectionActive = isSectionActive(item.subItems);

                            return (
                                <div key={idx}>
                                    <button type="button" onClick={() => toggle(item.id)}
                                        className={`group flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm transition-all
                                            ${expanded || sectionActive
                                                ? 'text-gray-900 font-semibold dark:text-slate-200'
                                                : 'text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-white/5'
                                            }`}>
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${colors.pill}`}>
                                            <Icon size={14} className={colors.icon} />
                                        </div>
                                        <span className="flex-1 text-left">{item.label}</span>
                                        <ChevronDown size={13} className={`transition-transform duration-200 shrink-0 text-gray-400 dark:text-slate-600 ${expanded ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Sub-items accordion */}
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <ul className="mt-0.5 ml-[1.1rem] pl-4 border-l py-1 space-y-0.5 border-gray-100 dark:border-white/[0.07]">
                                            {item.subItems.map((sub, si) => {

                                                /* ── Nested collapsible ── */
                                                if (sub.type === 'nested') {
                                                    const SubIcon = sub.icon;
                                                    const nestedExpanded = !!openSections[sub.id];
                                                    const nestedActive = sub.subItems?.some(ns => isLinkActive(ns.href));
                                                    return (
                                                        <li key={si}>
                                                            <button type="button"
                                                                onClick={(e) => { e.stopPropagation(); toggle(sub.id); }}
                                                                className={`flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-xs transition-all
                                                                    ${nestedActive
                                                                        ? 'text-gray-800 font-semibold dark:text-slate-200'
                                                                        : 'text-gray-500 font-medium hover:text-gray-700 hover:bg-gray-50 dark:text-slate-600 dark:hover:text-slate-300 dark:hover:bg-white/5'
                                                                    }`}>
                                                                <SubIcon size={12} className="shrink-0" />
                                                                <span className="flex-1 text-left">{sub.label}</span>
                                                                <ChevronDown size={11} className={`transition-transform duration-200 text-gray-400 dark:text-slate-700 ${nestedExpanded ? 'rotate-180' : ''}`} />
                                                            </button>
                                                            <div className={`overflow-hidden transition-all duration-300 ${nestedExpanded ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
                                                                <ul className="ml-3 pl-3 border-l py-0.5 space-y-0.5 border-gray-100 dark:border-white/[0.05]">
                                                                    {sub.subItems.map((ns, ni) => {
                                                                        const NsIcon = ns.icon;
                                                                        const nsActive = isLinkActive(ns.href);
                                                                        return (
                                                                            <li key={ni}>
                                                                                <Link href={ns.href}
                                                                                    className={`flex items-center gap-2 px-3 py-1 rounded-md text-[11px] transition-all
                                                                                        ${nsActive
                                                                                            ? 'bg-blue-50 text-blue-700 font-semibold dark:bg-white/10 dark:text-white'
                                                                                            : 'text-gray-500 font-medium hover:text-gray-700 hover:bg-gray-50 dark:text-slate-600 dark:hover:text-slate-300 dark:hover:bg-white/5'
                                                                                        }`}>
                                                                                    <NsIcon size={11} className={`shrink-0 ${nsActive ? colors.icon : ''}`} />
                                                                                    {ns.label}
                                                                                </Link>
                                                                            </li>
                                                                        );
                                                                    })}
                                                                </ul>
                                                            </div>
                                                        </li>
                                                    );
                                                }

                                                /* ── Regular sub-link ── */
                                                const SubIcon = sub.icon;
                                                const subActive = isLinkActive(sub.href);
                                                return (
                                                    <li key={si}>
                                                        <Link href={sub.href}
                                                            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-all
                                                                ${subActive
                                                                    ? 'bg-blue-50 text-blue-700 font-semibold dark:bg-white/10 dark:text-white'
                                                                    : 'text-gray-500 font-medium hover:text-gray-800 hover:bg-gray-50 dark:text-slate-600 dark:hover:text-slate-300 dark:hover:bg-white/5'
                                                                }`}>
                                                            <SubIcon size={12} className={`shrink-0 ${subActive ? colors.icon : ''}`} />
                                                            {sub.label}
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            );
                        }

                        return null;
                    })}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-gray-100 dark:border-white/[0.06] shrink-0">
                    <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-700">
                        LexiMentor · v2.0
                    </p>
                </div>
            </div>
        </aside>
    );
};

export default NewSidebar;
