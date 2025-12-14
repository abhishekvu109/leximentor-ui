
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { API_FITMATE_BASE_URL } from '@/constants';
import Layout from "@/components/layout/Layout";
import Link from 'next/link';
import { ArrowLeft, Dumbbell, Activity, Calendar, PlayCircle } from 'lucide-react';

const ExerciseDetailContent = () => {
    const router = useRouter();
    const { id } = router.query;
    const [exercise, setExercise] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            setLoading(true);
            fetch(`${API_FITMATE_BASE_URL}/exercises/exercise/${id}`)
                .then((res) => res.json())
                .then((data) => {
                    setExercise(data.data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error('Failed to fetch exercise:', err);
                    setLoading(false);
                });
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!exercise) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <p className="text-gray-500">Exercise not found.</p>
                <Link href="/fitmate/exercise/exercise" className="text-blue-600 hover:underline">
                    Back to Library
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Top Bar */}
            <div className="flex items-center gap-4">
                <Link
                    href="/fitmate/exercise/exercise"
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div className="flex-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Exercise Library</p>
                    <h1 className="text-xl font-bold text-gray-900">{exercise.name}</h1>
                </div>
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left: Hero Image */}
                <div className="space-y-4">
                    <div className="aspect-[4/3] w-full bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 relative shadow-sm">
                        <img
                            src={`https://placehold.co/800x600/e2e8f0/1e293b?text=${encodeURIComponent(exercise.name)}`}
                            alt={exercise.name}
                            className="w-full h-full object-cover mix-blend-multiply opacity-90"
                        />
                        <div className="absolute top-4 left-4">
                            <span className="px-3 py-1.5 bg-black/60 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">
                                {exercise.bodyPart?.name || 'General'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Details & Stats */}
                <div className="space-y-8">
                    {/* Description */}
                    <div className="space-y-2">
                        <h2 className="text-lg font-bold text-gray-900">About this exercise</h2>
                        <p className="text-gray-600 leading-relaxed">
                            {exercise.description || "No description available for this exercise."}
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="flex items-center gap-2 mb-1 text-gray-400">
                                <Activity size={16} />
                                <span className="text-xs font-bold uppercase">Training Type</span>
                            </div>
                            <p className="font-semibold text-gray-800">{exercise.training?.name || '-'}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="flex items-center gap-2 mb-1 text-gray-400">
                                <Dumbbell size={16} />
                                <span className="text-xs font-bold uppercase">Equipment</span>
                            </div>
                            <p className="font-semibold text-gray-800 break-words">
                                {exercise.equipments?.join(', ') || 'None'}
                            </p>
                        </div>
                    </div>

                    {/* Muscles */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Target Muscles</h3>
                        <div className="flex flex-wrap gap-2">
                            {exercise.targetMuscles?.map((m, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 bg-blue-50 text-blue-700 font-medium text-sm rounded-lg border border-blue-100"
                                >
                                    {m.name}
                                </span>
                            ))}
                            {(!exercise.targetMuscles || exercise.targetMuscles.length === 0) && (
                                <span className="text-gray-400 text-sm italic">No muscles specified</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Resources Section (if available) */}
            {exercise.resources?.length > 0 && (
                <div className="pt-8 border-t border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <PlayCircle className="text-blue-600" size={20} />
                        Media Resources
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exercise.resources.map((res, i) => (
                            <div key={i} className="group overflow-hidden rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                <div className="aspect-video bg-gray-100">
                                    {/* Mocking logic for now */}
                                    <img
                                        src="https://placehold.co/400x225/e2e8f0/64748b?text=Video+Preview"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                </div>
                                <div className="p-3">
                                    <p className="text-sm font-medium text-gray-800 truncate">{res.name || 'Resource'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const ExerciseDetail = () => {
    return (
        <Layout content={<ExerciseDetailContent />} />
    );
};

export default ExerciseDetail;