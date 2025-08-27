'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const dummyHistory = {
    'Push-ups': {
        count: 14,
        logs: [
            { date: '2025-07-01', weight: 'Bodyweight', reps: 15, notes: '💪 Felt strong' },
            { date: '2025-06-28', weight: 'Bodyweight', reps: 12, notes: '⚡ Good energy' },
            { date: '2025-06-25', weight: 'Bodyweight', reps: 10, notes: '🧘 Perfect form' },
        ],
    },
    'Bench Press': {
        count: 8,
        logs: [
            { date: '2025-06-30', weight: '50kg', reps: 8, notes: '😤 Last rep hard' },
            { date: '2025-06-27', weight: '47.5kg', reps: 10, notes: '👍 Felt great' },
        ],
    },
};

export default function ExerciseAddPanel() {
    const [selectedExercise, setSelectedExercise] = useState('Push-ups');
    const [form, setForm] = useState({ weight: '', reps: '', notes: '' });

    const data = dummyHistory[selectedExercise];

    return (
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl transition-all">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                💡 Add Exercise to Routine
            </h2>

            {/* Dropdown */}
            <div className="mb-6 relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">🏋️ Exercise</label>
                <div className="relative">
                    <select
                        className="appearance-none w-full p-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        value={selectedExercise}
                        onChange={(e) => setSelectedExercise(e.target.value)}
                    >
                        {Object.keys(dummyHistory).map((exercise) => (
                            <option key={exercise} value={exercise}>
                                {exercise}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={20} />
                </div>
            </div>

            {/* History Summary */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
                <p className="text-sm text-gray-700 mb-2">
                    📊 <strong>{selectedExercise}</strong> has been done <strong>{data.count}</strong> times.
                </p>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-50">
                        <tr className="text-gray-500 border-b">
                            <th className="px-4 py-2">📅 Date</th>
                            <th className="px-4 py-2">🏋️ Weight</th>
                            <th className="px-4 py-2">🔢 Reps</th>
                            <th className="px-4 py-2">📝 Notes</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.logs.slice(0, 5).map((log, index) => (
                            <tr
                                key={index}
                                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b text-gray-800`}
                            >
                                <td className="px-4 py-2">{log.date}</td>
                                <td className="px-4 py-2">{log.weight}</td>
                                <td className="px-4 py-2">{log.reps}</td>
                                <td className="px-4 py-2">{log.notes}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Input Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">🏋️ Weight</label>
                    <input
                        type="text"
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 52.5kg"
                        value={form.weight}
                        onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">🔢 Reps</label>
                    <input
                        type="number"
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 12"
                        value={form.reps}
                        onChange={(e) => setForm({ ...form, reps: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">📝 Notes</label>
                    <input
                        type="text"
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Any notes..."
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />
                </div>
            </div>

            <div className="text-right">
                <button
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md transition"
                    onClick={() => alert('Exercise added to routine!')}
                >
                    ➕ Add to Routine
                </button>
            </div>
        </div>
    );
}
