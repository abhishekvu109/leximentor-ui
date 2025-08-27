import VerticalTabInterface from "@/components/widgets/tabs/VerticalTabInterface";
import Layout from "@/components/layout/Layout";

import {useEffect, useState} from "react";
import {API_FITMATE_BASE_URL} from "@/constants";
import {DeleteByObject, fetchData, postDataAsJson} from "@/dataService";
import Link from "next/link";

const ViewExercises = () => {
    const [exercises, setExercises] = useState([]);
    const [filteredExercises, setFilteredExercises] = useState([]);
    const [filters, setFilters] = useState({training: '', bodyPart: '', muscle: '', equipment: ''});
    const [sortField, setSortField] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    const [dropdowns, setDropdowns] = useState({trainings: [], bodyParts: [], muscles: [], equipments: []});

    useEffect(() => {
        const loadData = async () => {
            const exerciseData = await fetchData(`${API_FITMATE_BASE_URL}/exercises`);
            const trainingData = await fetchData(`${API_FITMATE_BASE_URL}/trainings`);
            const bodyPartData = await fetchData(`${API_FITMATE_BASE_URL}/bodyparts`);
            const muscleData = await fetchData(`${API_FITMATE_BASE_URL}/muscles`);
            const equipmentData = ['Body Weight', 'Dumbbell', 'Barbell Bar', 'Weights', 'Isometric Machine'];

            setExercises(exerciseData.data);
            setFilteredExercises(exerciseData.data);
            setDropdowns({
                trainings: trainingData.data,
                bodyParts: bodyPartData.data,
                muscles: muscleData.data,
                equipments: equipmentData,
            });
        };
        loadData();
    }, []);

    const LoadTable = async () => {
        const exerciseData = await fetchData(`${API_FITMATE_BASE_URL}/exercises`);
        const trainingData = await fetchData(`${API_FITMATE_BASE_URL}/trainings`);
        const bodyPartData = await fetchData(`${API_FITMATE_BASE_URL}/bodyparts`);
        const muscleData = await fetchData(`${API_FITMATE_BASE_URL}/muscles`);
        const equipmentData = ['Body Weight', 'Dumbbell', 'Barbell Bar', 'Weights', 'Isometric Machine'];

        setExercises(exerciseData.data);
        setFilteredExercises(exerciseData.data);
        setDropdowns({
            trainings: trainingData.data,
            bodyParts: bodyPartData.data,
            muscles: muscleData.data,
            equipments: equipmentData,
        });
    }

    const applyFilters = () => {
        let filtered = [...exercises];
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                filtered = filtered.filter(item => item[key]?.name === value);
            }
        });

        filtered.sort((a, b) => {
            const aField = a[sortField]?.name || a[sortField];
            const bField = b[sortField]?.name || b[sortField];
            return sortOrder === 'asc' ? aField.localeCompare(bField) : bField.localeCompare(aField);
        });

        setFilteredExercises(filtered);
    };

    useEffect(() => {
        applyFilters();
    }, [filters, sortField, sortOrder]);

    return (
        <div className="max-w-full mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Exercise List</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {['training', 'bodyPart', 'muscle', 'equipment'].map((field) => (
                    <select
                        key={field}
                        value={filters[field]}
                        onChange={(e) => setFilters({...filters, [field]: e.target.value})}
                        className="px-3 py-2 text-sm border rounded w-full"
                    >
                        <option value="">Filter by {field}</option>
                        {dropdowns[field + 's']?.map((item) => (
                            <option key={item.name} value={item.name}>{item.name}</option>
                        ))}
                    </select>
                ))}
            </div>

            <div className="flex justify-end items-center gap-2 mb-4">
                <label className="text-sm text-gray-600">Sort By:</label>
                <select
                    className="px-2 py-1 border rounded"
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value)}
                >
                    <option value="name">Name</option>
                    <option value="training">Training</option>
                    <option value="bodyPart">Body Part</option>
                </select>
                <select
                    className="px-2 py-1 border rounded"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                >
                    <option value="asc">Asc</option>
                    <option value="desc">Desc</option>
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border text-sm">
                    <thead className="bg-gray-100 text-gray-600">
                    <tr>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Training</th>
                        <th className="px-4 py-2 text-left">Body Part</th>
                        <th className="px-4 py-2 text-left">Target Muscles</th>
                        <th className="px-4 py-2 text-left">Equipment</th>
                        <th className="px-4 py-2 text-left">Details</th>
                        <th className="px-4 py-2 text-left">Delete</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredExercises.map((exercise, index) => (
                        <tr key={index} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-2 font-medium text-gray-800">{exercise.name}</td>
                            <td className="px-4 py-2">{exercise.training?.name}</td>
                            <td className="px-4 py-2">{exercise.bodyPart?.name}</td>
                            <td className="px-4 py-2">
                                {exercise.targetMuscles?.map((m, i) => (
                                    <span key={i}
                                          className="inline-block px-2 py-0.5 my-1 bg-blue-100 text-blue-700 rounded text-xs mr-1">
                                  {m.name}
                                </span>
                                ))}
                            </td>
                            {/*<td className="px-4 py-2">{exercise.equipment?.name || '-'}</td>*/}
                            <td className="px-4 py-2">
                                {(exercise.equipments == null || exercise.equipments.length < 1) ? <>-</> : <></>}
                                {exercise.equipments?.map((e, i) => (
                                    <span key={i}
                                          className="inline-block px-2 py-0.5 my-1 bg-cyan-100 text-cyan-700 rounded text-xs mr-1">
                                  {e}
                                </span>
                                ))}
                            </td>
                            <td className="px-4 py-2">
                                <Link
                                    href={`view/${exercise.refId}`}
                                    className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition"
                                >
                                    View
                                </Link>
                            </td>
                            <td className="px-4 py-2">
                                <button
                                    onClick={async () => {
                                        if (confirm(`Are you sure you want to delete "${exercise.name}"?`)) {
                                            // call delete API and refresh data

                                            const deleteObject = [{
                                                refId: exercise.refId
                                            }]

                                            await DeleteByObject(`${API_FITMATE_BASE_URL}/exercises/exercise`, deleteObject);
                                            await LoadTable();
                                        }
                                    }}
                                    className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const AddExerciseForm = () => {
    const [form, setForm] = useState({
        training: "",
        bodyPart: "",
        muscle: [],
        name: "",
        description: "",
        status: "ACTIVE",
        equipments: []
    });

    const [availableBodyParts, setAvailableBodyParts] = useState([]);
    const [availableMuscles, setAvailableMuscles] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const [trainings, setTrainings] = useState([]);
    const [bodyParts, setBodyParts] = useState([]);
    const [muscles, setMuscles] = useState([]);

    const [muscles2, setMuscles2] = useState([]);
    const equipments = ['Body Weight', 'Dumbbell', 'Barbell Bar', 'Weights', 'Isometric Machine'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [trainingRes, bodyPartRes, muscleRes] = await Promise.all([fetch(`${API_FITMATE_BASE_URL}/trainings`), fetch(`${API_FITMATE_BASE_URL}/bodyparts`), fetch(`${API_FITMATE_BASE_URL}/muscles`)]);
                const [trainingData, bodyPartData, muscleData] = await Promise.all([trainingRes.json(), bodyPartRes.json(), muscleRes.json()]);
                setTrainings(trainingData.data || []);
                setBodyParts(bodyPartData.data || []);
                setMuscles(muscleData.data || []);
                setMuscles2(muscleData.data || []);
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            }
        };

        fetchData();
    }, []);


    useEffect(() => {
        if (form.bodyPart) {
            const filteredMuscles = muscles2.filter(muscle => String(muscle.bodyPart.name).toLowerCase() === String(form.bodyPart).toLowerCase());
            setMuscles(filteredMuscles || [])
            setForm(prev => ({...prev, muscle: []}));
        }
    }, [form.bodyPart]);


    const handleSubmit = (e) => {
        e.preventDefault();
        setShowModal(true);
    };

    const confirmSave = async () => {
        console.log("Form data submitted:", form);
        const postExerciseData = [{
            name: form.name,
            description: form.description,
            training: {
                name: form.training
            },
            bodyPart: {
                "name": form.bodyPart
            },
            targetMuscles: form.muscle.map(muscleName => ({name: muscleName})),
            equipments: form.equipments
        }];
        const saveExercise = await postDataAsJson(`${API_FITMATE_BASE_URL}/exercises`, postExerciseData);
        setForm({
            training: "",
            bodyPart: "",
            muscle: [],
            name: "",
            description: "",
            status: "ACTIVE",
            equipments: []
        })
        setShowModal(false);

    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Add New Exercise</h2>
            <form onSubmit={handleSubmit} className="space-y-4">

                {/* Training Dropdown */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Training</label>
                    <select
                        name="training"
                        value={form.training}
                        onChange={(e) => setForm({...form, training: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-sm"
                    >
                        <option value="">Select training</option>
                        {trainings.map(t => (
                            <option key={t.name} value={t.name}>{t.name}</option>
                        ))}
                    </select>
                </div>

                {/* Body Part Dropdown */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Body Part</label>
                    <select
                        name="bodyPart"
                        value={form.bodyPart}
                        onChange={(e) => setForm({...form, bodyPart: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-sm"
                        disabled={!bodyParts.length}
                    >
                        <option value="">Select body part</option>
                        {bodyParts.map(bp => (
                            <option key={bp.refId} value={bp.name}>{bp.name}</option>
                        ))}
                    </select>
                </div>

                {/* Target Muscle Multi-select */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Muscles</label>
                    <select
                        name="muscle"
                        multiple
                        value={form.muscle}
                        onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                            setForm(prev => ({...prev, muscle: selected}));
                        }}
                        className="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-sm h-32"
                        disabled={!muscles.length}
                    >
                        {muscles.map(m => (
                            <option key={m.refId} value={m.name}>{m.name}</option>
                        ))}
                    </select>
                    {form.muscle.length > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                            Selected: {form.muscle.join(", ")}
                        </p>
                    )}
                </div>

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exercise Name</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({...form, name: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md shadow-sm text-sm"
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({...form, description: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md shadow-sm text-sm"
                        rows="3"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Equipments</label>
                    <select
                        name="muscle"
                        multiple
                        value={form.equipments}
                        onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                            setForm(prev => ({...prev, equipments: selected}));
                        }}
                        className="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-sm h-32"
                        disabled={!equipments.length}
                    >
                        {equipments.map(equipment => (
                            <option key={equipment} value={equipment}>{equipment}</option>
                        ))}
                    </select>
                    {form.equipments.length > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                            Selected: {form.equipments.join(", ")}
                        </p>
                    )}
                </div>

                {/* Status Radio Buttons */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="flex gap-4">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="status"
                                value="ACTIVE"
                                checked={form.status === "ACTIVE"}
                                onChange={(e) => setForm({...form, status: e.target.value})}
                                className="form-radio"
                            />
                            <span className="ml-2 text-sm text-gray-700">Active</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="status"
                                value="INACTIVE"
                                checked={form.status === "INACTIVE"}
                                onChange={(e) => setForm({...form, status: e.target.value})}
                                className="form-radio"
                            />
                            <span className="ml-2 text-sm text-gray-700">Inactive</span>
                        </label>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        className="px-4 py-2 bg-gray-200 text-sm text-gray-700 rounded-md hover:bg-gray-300"
                        onClick={() => alert("Cancelled")}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                    >
                        Save
                    </button>
                </div>
            </form>

            {/* Modal for confirmation */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Confirm Add</h3>
                        <p className="text-sm text-gray-600">Are you sure you want to add this exercise?</p>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                onClick={confirmSave}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const Main = () => {
    const FormHeading = () => {
        return (<>
            <div className="flex flex-col justify-center items-center justify-items-center text-center">
                <div className="w-[100%]">
                    <h2 className="text-2xl text-black font-bold">Exercise Dashboard</h2>
                    <p className="mt-2 text-sm font-semibold text-black/65">Add, View, Update and Remove exercises.</p>
                </div>
            </div>
        </>);
    }
    const tabs = [{
        id: 'Add', label: 'Add Exercises', content: () => (<>
            <AddExerciseForm/>
        </>),
    }, {
        id: 'View', label: 'View Exercises', content: (<>
            <ViewExercises/>
        </>),
    }, {
        id: 'Remove', label: 'Remove Exercises', content: (<>
            <p></p>
        </>),
    },];
    return (<>
        <div className="flex flex-col items-center">
            <div className="w-[100%] p-2 mt-2">
                <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-3">
                        <FormHeading/>
                    </div>
                    <div className="col-span-3">
                        <VerticalTabInterface tabs={tabs}/>
                    </div>
                </div>
            </div>
        </div>
    </>);
}
const Exercise = () => {
    return (<>
        <Layout content={<Main/>}/>
    </>);
}

export default Exercise;