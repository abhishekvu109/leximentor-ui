import Head from 'next/head';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
    User,
    Mail,
    Shield,
    Award,
    Zap,
    Clock,
    ChevronRight,
    Edit3,
    Camera,
    Github,
    Twitter,
    Globe,
    CheckCircle2,
    Calendar,
    Target,
    BarChart3
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

// Dynamic import for ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const ProfilePage = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

    // Mounting check for client-side components like ApexCharts
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Dummy data for visual excellence
    const stats = [
        { label: 'Calculated IQ', value: '132', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50' },
        { label: 'Words Mastered', value: '1,284', icon: Award, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Learning Streak', value: '12 Days', icon: Calendar, color: 'text-orange-500', bg: 'bg-orange-50' },
        { label: 'Total Practice', value: '48.5h', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-50' },
    ];

    const chartOptions = {
        chart: {
            toolbar: { show: false },
            sparkline: { enabled: false },
        },
        stroke: { curve: 'smooth', width: 2 },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [20, 100, 100, 100]
            }
        },
        xaxis: {
            categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            labels: { style: { colors: '#94a3b8' } }
        },
        yaxis: { show: false },
        colors: ['#2563eb'],
        grid: { show: false }
    };

    const chartSeries = [{
        name: 'Weekly Progress',
        data: [31, 40, 28, 51, 42, 109, 100]
    }];

    const skills = [
        { name: 'Vocabulary', level: 85, color: 'bg-blue-600' },
        { name: 'Grammar', level: 72, color: 'bg-indigo-600' },
        { name: 'Reading Speed', level: 94, color: 'bg-purple-600' },
        { name: 'Complexity Mastery', level: 64, color: 'bg-blue-400' },
    ];

    return (
        <Layout content={
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Head>
                    <title>My Profile | LexiMentor</title>
                </Head>

                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-blue-900 p-8 md:p-12 text-white">
                    <div className="absolute top-0 right-0 -m-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -m-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>

                    <div className="relative flex flex-col md:flex-row items-center gap-8">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-4xl font-black shadow-2xl ring-4 ring-white/10 overflow-hidden">
                                {user?.username?.[0]?.toUpperCase() || 'A'}
                            </div>
                            <button className="absolute -bottom-2 -right-2 p-2 bg-white text-blue-600 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110">
                                <Camera size={18} />
                            </button>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                                <h1 className="text-3xl font-black tracking-tight">{user?.username || 'Abhishek V'}</h1>
                                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-widest rounded-full border border-blue-500/30">Pro Member</span>
                            </div>
                            <p className="text-blue-100/70 font-medium mb-6 flex items-center justify-center md:justify-start gap-2">
                                <Mail size={16} /> {user?.email || 'abhishek@leximentor.pro'}
                            </p>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-white text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20 active:scale-95"
                                >
                                    <Edit3 size={18} />
                                    Edit Profile
                                </button>
                                <div className="flex gap-2">
                                    <button className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><Github size={20} /></button>
                                    <button className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><Twitter size={20} /></button>
                                    <button className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><Globe size={20} /></button>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                            {stats.slice(0, 4).map((stat, idx) => (
                                <div key={idx} className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center text-center min-w-[120px]">
                                    <stat.icon className={`mb-1 ${stat.color}`} size={20} />
                                    <span className="text-lg font-bold">{stat.value}</span>
                                    <span className="text-[10px] uppercase tracking-wider text-blue-100/50">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Progress Overview */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600">
                                        <BarChart3 size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold dark:text-white">Performance Analytics</h2>
                                </div>
                                <select className="bg-gray-50 dark:bg-gray-900 border-none text-xs font-bold rounded-xl px-4 py-2 ring-1 ring-gray-200 dark:ring-gray-700">
                                    <option>Last 7 Days</option>
                                    <option>Last 30 Days</option>
                                </select>
                            </div>
                            <div className="h-[300px] w-full mt-4">
                                {isMounted && chartSeries[0].data.length > 0 ? (
                                    <Chart options={chartOptions} series={chartSeries} type="area" height="100%" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs font-bold">
                                        Loading Analytics...
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Achievements */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 dark:text-white">
                                <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-yellow-600">
                                    <Award size={20} />
                                </div>
                                Recent Achievements
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { title: 'Speed Demon', desc: 'Completed 10 drills in 10 minutes', date: '2 days ago', color: 'blue' },
                                    { title: 'Vocab Titan', desc: 'Mastered 500 academic words', date: '5 days ago', color: 'purple' },
                                ].map((ach, idx) => (
                                    <div key={idx} className="group p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 transition-all cursor-pointer">
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-1 p-3 bg-${ach.color}-100 dark:bg-${ach.color}-900/20 text-${ach.color}-600 rounded-xl group-hover:scale-110 transition-transform`}>
                                                <Target size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-sm dark:text-gray-200">{ach.title}</h3>
                                                <p className="text-xs text-gray-400 mb-2">{ach.desc}</p>
                                                <span className="text-[10px] font-bold text-gray-300 uppercase letter-spacing-wide">{ach.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Secondary Data */}
                    <div className="space-y-8">
                        {/* Skills Breakdown */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                            <h2 className="text-xl font-bold mb-6 dark:text-white">Skill Matrix</h2>
                            <div className="space-y-6">
                                {skills.map((skill, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{skill.name}</span>
                                            <span className="text-xs font-black text-blue-600 dark:text-blue-400">{skill.level}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${skill.color} rounded-full transition-all duration-1000 ease-out`}
                                                style={{ width: `${skill.level}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Account Security */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                                <Shield size={20} />
                                Security Status
                            </h2>
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3 text-sm">
                                    <CheckCircle2 size={16} className="text-blue-200" />
                                    <span className="opacity-90">Two-factor Authentication Enabled</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <CheckCircle2 size={16} className="text-blue-200" />
                                    <span className="opacity-90">Email Verified</span>
                                </div>
                            </div>
                            <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all border border-white/20">
                                Manage Security
                            </button>
                        </div>

                        {/* Subscription Info */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm hover:border-blue-100 transition-colors">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Active Plan</p>
                            <h3 className="text-xl font-bold mb-4 dark:text-white">LexiMentor Lifetime</h3>
                            <p className="text-xs text-gray-400 mb-4 font-medium italic">Unlimited access to all drills, analytics and Writewise features.</p>
                            <Link href="#" className="flex items-center justify-between text-blue-600 text-sm font-bold hover:gap-1 transition-all">
                                Manage Billing <ChevronRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        } />
    );
};

export default ProfilePage;
