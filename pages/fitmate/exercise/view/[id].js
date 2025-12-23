
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { API_FITMATE_BASE_URL } from '@/constants';
import Layout from "@/components/layout/Layout";
import Link from 'next/link';
import { ArrowLeft, Dumbbell, Activity, Calendar, PlayCircle, Edit2, Camera, Save, Loader2, Check, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchData, updateData } from '@/dataService';


const EditExerciseModal = ({ isOpen, onClose, exercise, onSuccess, onNotification, data: { trainings, bodyParts, musclesAll } }) => {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        refId: "",
        name: "",
        description: "",
        training: "",
        bodyPart: "",
        targetMuscles: [],
        equipments: [],
        status: "ACTIVE"
    });

    const [filteredMuscles, setFilteredMuscles] = useState([]);

    useEffect(() => {
        if (isOpen && exercise) {
            setForm({
                refId: exercise.refId,
                name: exercise.name,
                description: exercise.description || "",
                training: exercise.training?.name || "",
                bodyPart: exercise.bodyPart?.name || "",
                targetMuscles: exercise.targetMuscles?.map(m => m.name) || [],
                equipments: exercise.equipments || [],
                status: exercise.status || "ACTIVE"
            });
        }
    }, [isOpen, exercise]);

    useEffect(() => {
        if (form.bodyPart && musclesAll) {
            const relevant = musclesAll.filter(m => m.bodyPart?.name === form.bodyPart);
            setFilteredMuscles(relevant);
        } else {
            setFilteredMuscles([]);
        }
    }, [form.bodyPart, musclesAll]);

    const equipmentOptions = ['Body Weight', 'Dumbbell', 'Barbell Bar', 'Weights', 'Cable', 'Machine', 'Kettlebell'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                refId: form.refId,
                name: form.name,
                description: form.description,
                training: { name: form.training },
                bodyPart: { name: form.bodyPart },
                targetMuscles: form.targetMuscles.map(m => ({ name: m })),
                equipments: form.equipments,
                status: form.status
            };

            await updateData(`${API_FITMATE_BASE_URL}/exercises/exercise`, payload);
            onNotification({ message: `Successfully updated "${form.name}"`, type: 'success' });
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            onNotification({ message: "Failed to update exercise", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (field, value) => {
        setForm(prev => {
            const current = prev[field];
            const exists = current.includes(value);
            return {
                ...prev,
                [field]: exists
                    ? current.filter(item => item !== value)
                    : [...current, value]
            };
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Edit Exercise</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Exercise Name</label>
                                <input
                                    required
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Training Type</label>
                                <select
                                    required
                                    value={form.training}
                                    onChange={e => setForm({ ...form, training: e.target.value })}
                                    className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                >
                                    <option value="">Select Type</option>
                                    {trainings.map((t, i) => <option key={i} value={t.name}>{t.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                rows="3"
                            />
                        </div>

                        <div className="w-full h-px bg-gray-100 my-2"></div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target Body Part</label>
                            <select
                                required
                                value={form.bodyPart}
                                onChange={e => setForm({ ...form, bodyPart: e.target.value, targetMuscles: [] })}
                                className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm mb-4"
                            >
                                <option value="">Select Body Part</option>
                                {bodyParts.map((b, i) => <option key={i} value={b.name}>{b.name}</option>)}
                            </select>

                            {form.bodyPart && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Target Muscles ({form.targetMuscles.length})</label>
                                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl max-h-32 overflow-y-auto">
                                        {filteredMuscles.map((m, i) => {
                                            const isActive = form.targetMuscles.includes(m.name);
                                            return (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => toggleSelection('targetMuscles', m.name)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}
                                                >
                                                    {m.name}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Equipment Needed</label>
                            <div className="flex flex-wrap gap-2">
                                {equipmentOptions.map((eq, i) => {
                                    const isActive = form.equipments.includes(eq);
                                    return (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => toggleSelection('equipments', eq)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isActive ? 'bg-gray-800 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                                        >
                                            {eq}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                    <button onClick={onClose} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-70"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}

const ExerciseDetailContent = () => {
    const router = useRouter();
    const { id } = router.query;
    const [exercise, setExercise] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exerciseImage, setExerciseImage] = useState(null);
    const [refData, setRefData] = useState({ trainings: [], bodyParts: [], musclesAll: [] });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [notification, setNotification] = useState({ visible: false, message: "", type: "info" });
    const [uploading, setUploading] = useState(false);

    const showNotification = ({ message, type = "info" }) => {
        setNotification({ visible: true, message, type });
        setTimeout(() => setNotification(prev => ({ ...prev, visible: false })), 4000);
    };

    const fetchExerciseImage = async (refId) => {
        try {
            const res = await fetch(`${API_FITMATE_BASE_URL}/exercises/exercise/resources/resource?refId=${refId}&placeholder=GIF&resourceId=`);
            if (!res.ok) throw new Error("Image fetch failed");

            // The API returns binary data direttamente, not JSON
            const blob = await res.blob();
            if (blob.size > 0 && blob.type.startsWith('image/')) {
                const imageUrl = URL.createObjectURL(blob);
                setExerciseImage(imageUrl);
                console.log("Fitmate: Image blob converted to URL:", imageUrl);
            } else {
                console.log("Fitmate: Response was not a valid image blob");
                setExerciseImage(null);
            }
        } catch (e) {
            console.error("Failed to fetch exercise image:", e);
            setExerciseImage(null);
        }
    };

    const loadExerciseData = () => {
        if (id) {
            setLoading(true);
            fetch(`${API_FITMATE_BASE_URL}/exercises/exercise/${id}`)
                .then((res) => res.json())
                .then((data) => {
                    setExercise(data.data);
                    if (data.data?.refId) {
                        fetchExerciseImage(data.data.refId);
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    console.error('Failed to fetch exercise:', err);
                    setLoading(false);
                });
        }
    };

    useEffect(() => {
        loadExerciseData();
    }, [id]);

    useEffect(() => {
        const fetchRefData = async () => {
            try {
                const [trRes, bpRes, mRes] = await Promise.all([
                    fetchData(`${API_FITMATE_BASE_URL}/trainings`),
                    fetchData(`${API_FITMATE_BASE_URL}/bodyparts`),
                    fetchData(`${API_FITMATE_BASE_URL}/muscles`)
                ]);
                setRefData({
                    trainings: trRes.data || [],
                    bodyParts: bpRes.data || [],
                    musclesAll: mRes.data || []
                });
            } catch (e) {
                console.error("Failed to load reference data", e);
            }
        };
        fetchRefData();
    }, []);

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !exercise) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('files', file);

        try {
            const res = await fetch(`${API_FITMATE_BASE_URL}/exercises/exercise/resources?refId=${exercise.refId}&placeholder=GIF`, {
                method: 'PUT',
                body: formData
            });

            if (res.ok) {
                showNotification({ message: "Image updated successfully", type: 'success' });
                loadExerciseData();
            } else {
                throw new Error("Upload failed");
            }
        } catch (error) {
            console.error(error);
            showNotification({ message: "Failed to upload image", type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const handleThumbnailUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !exercise) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('files', file);

        try {
            const res = await fetch(`${API_FITMATE_BASE_URL}/exercises/exercise/resources?refId=${exercise.refId}&placeholder=THUMBNAIL`, {
                method: 'PUT',
                body: formData
            });

            if (res.ok) {
                showNotification({ message: "Thumbnail updated successfully", type: 'success' });
                // We don't necessarily need to reload all data if the thumb isn't shown here, 
                // but good for consistency.
                loadExerciseData();
            } else {
                throw new Error("Thumbnail upload failed");
            }
        } catch (error) {
            console.error(error);
            showNotification({ message: "Failed to upload thumbnail", type: 'error' });
        } finally {
            setUploading(false);
        }
    };

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
                <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl border border-gray-200 font-bold transition-all shadow-sm active:scale-95"
                >
                    <Edit2 size={16} /> Edit Details
                </button>
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left: Hero Image */}
                <div className="space-y-4">
                    <div className="aspect-[4/3] w-full bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 relative shadow-sm flex items-center justify-center">
                        {exerciseImage ? (
                            <img
                                src={exerciseImage}
                                alt={exercise.name}
                                className="w-full h-full object-cover mix-blend-multiply opacity-90 transition-opacity"
                            />
                        ) : (
                            <div className="p-12 text-center">
                                <h2 className="text-4xl font-black text-slate-700 opacity-80 leading-tight tracking-tight">
                                    {exercise.name}
                                </h2>
                            </div>
                        )}
                        <div className="absolute top-4 left-4">
                            <span className="px-3 py-1.5 bg-black/60 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">
                                {exercise.bodyPart?.name || 'General'}
                            </span>
                        </div>
                        <label className="absolute bottom-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-2xl text-blue-600 shadow-xl border border-white cursor-pointer hover:bg-white hover:scale-105 transition-all group">
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                            {uploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} className="group-hover:rotate-12 transition-transform" />}
                            <span className="absolute right-0 -top-8 px-2 py-1 bg-black text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Change Image</span>
                        </label>
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
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                            <div className="flex items-center justify-between mb-1 text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Camera size={16} />
                                    <span className="text-xs font-bold uppercase">Thumbnail</span>
                                </div>
                                <label className="cursor-pointer text-blue-600 hover:text-blue-700 transition-colors">
                                    <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailUpload} disabled={uploading} />
                                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                </label>
                            </div>
                            <p className="font-semibold text-gray-800">
                                {exercise.resources?.some(r => r.placeholder === 'THUMBNAIL') ? 'Uploaded' : 'Not Set'}
                            </p>
                            <span className="absolute right-0 -top-8 px-2 py-1 bg-black text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Upload Thumbnail</span>
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
                                        alt="Video Preview"
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
            {/* Notifications */}
            <AnimatePresence>
                {notification.visible && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] min-w-[320px]"
                    >
                        <div className={`px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-4 ${notification.type === 'success' ? 'bg-green-500/90 border-green-400 text-white' : 'bg-red-500/90 border-red-400 text-white'}`}>
                            {notification.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                            <p className="font-bold text-sm">{notification.message}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <EditExerciseModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                exercise={exercise}
                onSuccess={loadExerciseData}
                onNotification={showNotification}
                data={refData}
            />
        </div>
    );
}

const ExerciseDetail = () => {
    return (
        <Layout content={<ExerciseDetailContent />} />
    );
};

export default ExerciseDetail;