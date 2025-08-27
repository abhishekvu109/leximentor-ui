import {useRouter} from 'next/router';
import {useEffect, useState} from 'react';
import {API_FITMATE_BASE_URL} from '@/constants';
import Layout from "@/components/layout/Layout";

const Main = () => {
    const router = useRouter();
    const {id} = router.query;
    const [exercise, setExercise] = useState(null);

    useEffect(() => {
        if (id) {
            fetch(`${API_FITMATE_BASE_URL}/exercises/exercise/${id}`)
                .then((res) => res.json())
                .then((data) => setExercise(data.data))
                .catch((err) => console.error('Failed to fetch exercise:', err));
        }
    }, [id]);

    if (!exercise) {
        return <div className="text-center py-10 text-gray-600">Loading exercise...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto mt-10 bg-white p-6 rounded-lg shadow-md space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">{exercise.name}</h1>
            <p className="text-gray-700">{exercise.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-gray-500 font-semibold">Training</p>
                    <p className="text-gray-800">{exercise.training?.name || '-'}</p>
                </div>

                <div>
                    <p className="text-gray-500 font-semibold">Target Body Part</p>
                    <p className="text-gray-800">{exercise.bodyPart?.name || '-'}</p>
                </div>

                <div>
                    <p className="text-gray-500 font-semibold">Status</p>
                    <p className="text-gray-800">{exercise.status === 1 ? 'Active' : 'Inactive'}</p>
                </div>
            </div>

            <div>
                <p className="text-gray-500 font-semibold mb-1">Target Muscles</p>
                <div className="flex flex-wrap gap-2">
                    {exercise.targetMuscles?.map((m, i) => (
                        <span
                            key={i}
                            className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
                        >
              {m.name}
            </span>
                    ))}
                </div>
            </div>

            <div>
                <p className="text-gray-500 font-semibold mb-1">Equipments</p>
                <div className="flex flex-wrap gap-2">
                    {exercise.equipments?.map((e, i) => (
                        <span
                            key={i}
                            className="inline-block px-3 py-1 bg-cyan-100 text-cyan-700 text-xs font-medium rounded-full"
                        >
              {e}
            </span>
                    ))}
                </div>
            </div>

            {exercise.resources?.length > 0 ? (
                <div>
                    <p className="text-gray-500 font-semibold mb-2">📸 Media Resources</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {exercise.resources.map((res, i) => {
                            const isImage = res.contentType?.startsWith('image');
                            const url = isImage
                                ? `${API_FITMATE_BASE_URL}/resources/${res.id}`
                                : 'https://via.placeholder.com/300x200?text=No+Image';

                            return (
                                <div
                                    key={i}
                                    className="border rounded-lg overflow-hidden shadow-sm bg-gray-50 hover:shadow transition"
                                >
                                    <img
                                        src={url}
                                        alt={res.name || 'Resource'}
                                        className="object-cover w-full h-48"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Image+Unavailable';
                                        }}
                                    />
                                    <div className="px-3 py-2 text-xs text-gray-600 bg-white border-t truncate">
                                        {res.name || 'Unnamed Resource'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="text-gray-500 italic text-sm">
                    No media resources found for this exercise.
                </div>
            )}


        </div>
    );
}
const ExerciseDetail = () => {
    return (<>
        <Layout content={<><Main/></>}/>
    </>);
};

export default ExerciseDetail;