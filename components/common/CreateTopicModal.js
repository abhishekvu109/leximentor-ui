import { useState } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/solid';
import writewiseService from '@/services/writewise.service';

const CreateTopicModal = ({ isOpen, onClose, onSuccess, toast }) => {
    const [formData, setFormData] = useState({
        topic: '',
        subject: '',
        description: '',
        points: [''],
        learning: '',
        recommendations: [''],
        wordCount: 1000,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayFieldChange = (field, index, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? value : item)
        }));
    };

    const addArrayField = (field) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const removeArrayField = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.topic.trim()) {
            toast.error('Topic title is required');
            return;
        }
        if (!formData.subject.trim()) {
            toast.error('Subject is required');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                topic: formData.topic.trim(),
                subject: formData.subject.trim(),
                description: formData.description.trim(),
                points: formData.points.filter(p => p.trim()).length > 0 ? formData.points.filter(p => p.trim()) : [],
                learning: formData.learning.trim(),
                recommendations: formData.recommendations.filter(r => r.trim()).length > 0 ? formData.recommendations.filter(r => r.trim()) : [],
                wordCount: formData.wordCount || 1000,
            };

            await writewiseService.createTopicManually(payload);
            toast.success('Topic created successfully!');
            onSuccess();
            onClose();
            resetForm();
        } catch (error) {
            const errorMsg = error?.response?.data?.data || error?.message || 'Failed to create topic';
            toast.error(errorMsg);
            console.error('Error creating topic:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            topic: '',
            subject: '',
            description: '',
            points: [''],
            learning: '',
            recommendations: [''],
            wordCount: 1000,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">Create Custom Topic</h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Topic Title */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Topic Title *</label>
                        <input
                            type="text"
                            value={formData.topic}
                            onChange={(e) => handleInputChange('topic', e.target.value)}
                            placeholder="Enter the main topic title"
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Subject *</label>
                        <select
                            value={formData.subject}
                            onChange={(e) => handleInputChange('subject', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="">Select a subject</option>
                            <option value="Economics">Economics</option>
                            <option value="History">History</option>
                            <option value="Politics">Politics</option>
                            <option value="Science & Technology">Science & Technology</option>
                            <option value="Philosophy">Philosophy</option>
                            <option value="Environment">Environment</option>
                            <option value="Society">Society</option>
                            <option value="Literature">Literature</option>
                            <option value="Biography">Biography</option>
                            <option value="Agriculture">Agriculture</option>
                            <option value="Psychology">Psychology</option>
                            <option value="Medicine & Health">Medicine & Health</option>
                            <option value="Art & Culture">Art & Culture</option>
                            <option value="Geography">Geography</option>
                            <option value="Law & Justice">Law & Justice</option>
                            <option value="Business & Entrepreneurship">Business & Entrepreneurship</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Provide context and background about this topic"
                            rows="3"
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Key Points */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Key Points to Cover</label>
                        <div className="space-y-2">
                            {formData.points.map((point, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={point}
                                        onChange={(e) => handleArrayFieldChange('points', index, e.target.value)}
                                        placeholder={`Point ${index + 1}`}
                                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                    {formData.points.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeArrayField('points', index)}
                                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => addArrayField('points')}
                            className="mt-2 flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            <PlusIcon className="w-4 h-4" /> Add Point
                        </button>
                    </div>

                    {/* Learning Objective */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">What Students Will Learn</label>
                        <textarea
                            value={formData.learning}
                            onChange={(e) => handleInputChange('learning', e.target.value)}
                            placeholder="Describe the learning outcomes and skills gained"
                            rows="2"
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Writing Tips / Recommendations */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Writing Tips & Recommendations</label>
                        <div className="space-y-2">
                            {formData.recommendations.map((rec, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={rec}
                                        onChange={(e) => handleArrayFieldChange('recommendations', index, e.target.value)}
                                        placeholder={`Tip ${index + 1}`}
                                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                    {formData.recommendations.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeArrayField('recommendations', index)}
                                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => addArrayField('recommendations')}
                            className="mt-2 flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            <PlusIcon className="w-4 h-4" /> Add Tip
                        </button>
                    </div>

                    {/* Word Count */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Target Word Count</label>
                        <input
                            type="number"
                            value={formData.wordCount}
                            onChange={(e) => handleInputChange('wordCount', parseInt(e.target.value))}
                            min="100"
                            max="10000"
                            step="100"
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                resetForm();
                            }}
                            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Topic'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTopicModal;
