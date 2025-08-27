// /components/ExerciseRoutineBuilder.js
'use client';

import { useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2 } from 'lucide-react';

const initialExercises = [
    { id: '1', name: 'Push-ups', weight: '', reps: '', notes: '' },
    { id: '2', name: 'Bench Press', weight: '', reps: '', notes: '' },
    { id: '3', name: 'Deadlift', weight: '', reps: '', notes: '' },
];

export default function ExerciseRoutineBuilder() {
    const [exercises, setExercises] = useState(initialExercises);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = exercises.findIndex((e) => e.id === active.id);
            const newIndex = exercises.findIndex((e) => e.id === over.id);
            setExercises((items) => arrayMove(items, oldIndex, newIndex));
        }
    };

    const updateExercise = (id, field, value) => {
        setExercises((prev) =>
            prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
        );
    };

    const removeExercise = (id) => {
        setExercises((prev) => prev.filter((e) => e.id !== id));
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">🏋️ Build Your Routine</h2>

            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={exercises} strategy={verticalListSortingStrategy}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {exercises.map((exercise) => (
                            <SortableCard
                                key={exercise.id}
                                id={exercise.id}
                                exercise={exercise}
                                onChange={updateExercise}
                                onDelete={removeExercise}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}

function SortableCard({ id, exercise, onChange, onDelete }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="relative group bg-white border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-grab"
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{exercise.name}</h3>
                <button
                    className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                    onClick={() => onDelete(id)}
                >
                    <Trash2 size={18} />
                </button>
            </div>
            <div className="space-y-3">
                <input
                    type="text"
                    placeholder="Weight (e.g., 50kg)"
                    value={exercise.weight}
                    onChange={(e) => onChange(id, 'weight', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="number"
                    placeholder="Reps"
                    value={exercise.reps}
                    onChange={(e) => onChange(id, 'reps', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                    placeholder="Notes"
                    value={exercise.notes}
                    onChange={(e) => onChange(id, 'notes', e.target.value)}
                    rows={2}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
            </div>
        </div>
    );
}
