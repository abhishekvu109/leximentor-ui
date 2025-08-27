// import {fetchData, updateData} from "@/dataService";
// import {API_FITMATE_BASE_URL} from "@/constants";
// import Layout from "@/components/layout/Layout";
// import {useRouter} from "next/router";
// import Link from "next/link";
// import {Pen, Trash2} from "lucide-react";
// import {useState} from "react";
//
// const MainDesign = ({data}) => {
//     const router = useRouter();
//     const [selectedRow, setSelectedRow] = useState(null);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [form, setForm] = useState({name: '', reps: ''});
//     const [routine, setRoutine] = useState(data);
//
//     const getStatus = (status) => {
//         const status_str = String(status).toString().toLowerCase()
//         if (status_str == 'not_started') {
//             return 'Not started'
//         } else if (status_str == 'in_progress') {
//             return 'In-progress'
//         } else if (status_str == 'completed') {
//             return 'Completed'
//         } else {
//             return 'discard'
//         }
//     }
//
//     const getStatusColor = (status) => {
//         const status_str = String(status).toString().toLowerCase()
//         if (status_str == 'not_started') {
//             return 'gray'
//         } else if (status_str == 'in_progress') {
//             return 'yellow'
//         } else if (status_str == 'completed') {
//             return 'green'
//         } else {
//             return 'red'
//         }
//     }
//
//     const getNextAction = (status) => {
//         const status_str = String(status).toString().toLowerCase();
//         if (status_str == 'not_started') {
//             return 'Start Progress'
//         } else if (status_str == 'in_progress') {
//             return 'Mark Complete'
//         }
//     }
//
//
//     const openModal = (row) => {
//         setSelectedRow(row);
//         setForm({name: row.name, reps: row.reps});
//         setIsModalOpen(true);
//     };
//
//     const handleUpdate = () => {
//         const updated = routine.map((row) =>
//             row.id === selectedRow.id ? {...row, ...form} : row
//         );
//         setRoutine(updated);
//         setIsModalOpen(false);
//     };
//
//     return (<>
//         <div
//             className="max-w-7xl mx-auto mt-10 px-6 py-8 bg-white/80 backdrop-blur-md rounded-3xl shadow-lg space-y-8 border border-gray-100">
//             <div className="flex justify-between items-center">
//                 <div>
//                     <h1 className="text-3xl font-bold text-gray-800 tracking-tight">🏋️ Routine Summary</h1>
//                     <p className="text-sm text-gray-500 mt-1">Workout Date: <span
//                         className="font-semibold text-gray-700">08 Jul 2025</span></p>
//                 </div>
//                 <div className="relative group inline-block">
//                     <button
//                         onClick={async () => {
//                             if (String(routine.status).toLowerCase() == 'not_started') {
//                                 const updatedRoutine = {
//                                     refId: routine.refId,
//                                     status: 'IN_PROGRESS',
//                                 }
//                                 try {
//                                     await updateData(`${API_FITMATE_BASE_URL}/routines/routine`, updatedRoutine);
//                                     sessionStorage.setItem("message", "Routine has been updated successfully.");
//                                     sessionStorage.setItem("severity", "success");
//                                     await router.push('/notifications/notification')
//                                 } catch (error) {
//                                     sessionStorage.setItem("message", "Update failed.");
//                                     sessionStorage.setItem("severity", "error");
//                                     await router.push('/notifications/notification')
//                                 }
//
//                             }
//                         }}
//                         className={`inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded-full shadow-sm bg-${getStatusColor(routine.status)}-100 text-${getStatusColor(routine.status)}-700 hover:bg-${getStatusColor(routine.status)}-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${getStatusColor(routine.status)}-400 transition`}
//                     >
//                         {getStatus(routine.status)}
//                     </button>
//
//                     {/* Tooltip */}
//                     {(String(routine.status).toLowerCase() == 'discard' || String(routine.status).toLowerCase() == 'completed') ? <></> : <>
//                         <div
//                             className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 bg-gray-800 text-white text-xs rounded py-1 px-3 whitespace-nowrap shadow-lg">
//                             {`Click to : ${getNextAction(routine.status)}`}
//                             <div
//                                 className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
//                         </div>
//                     </>}
//                 </div>
//
//
//             </div>
//
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                 <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
//                     <p className="text-xs text-gray-500 uppercase font-medium">Training Type</p>
//                     <h3 className="text-lg font-semibold text-gray-800 mt-1">{routine.training.name}</h3>
//                 </div>
//                 <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
//                     <p className="text-xs text-gray-500 uppercase font-medium">Description</p>
//                     <p className="text-gray-700 mt-1 text-sm">
//                         {routine.description}
//                     </p>
//                 </div>
//             </div>
//             {routine.drills != null && routine.drills.length > 0 ? <>
//                 <div>
//                     <h2 className="text-xl font-semibold text-gray-800 mb-4">💡 Drill Breakdown</h2>
//                     <div className="overflow-x-auto">
//                         <table className="min-w-full table-auto text-xs border-collapse text-center">
//                             <thead className="bg-gray-100 text-gray-600 text-center">
//                             <tr className="border border-1">
//                                 <th className="px-4 py-3">🏋️ Exercise</th>
//                                 {/* Represents an exercise */}
//                                 <th className="px-4 py-3">🧍 Body Part</th>
//                                 {/* Human icon for body parts */}
//                                 <th className="px-4 py-3">💪 Muscle</th>
//                                 {/* Muscle/strength */}
//                                 <th className="px-4 py-3">📏 Unit</th>
//                                 {/* Ruler icon for measurement */}
//                                 <th className="px-4 py-3">🔢 Value</th>
//                                 {/* Numbers for measurement value */}
//                                 <th className="px-4 py-3">⚖️ Unit Type</th>
//                                 {/* Scale for unit type like kg/lbs */}
//                                 <th className="px-4 py-3">🔁 Reps</th>
//                                 {/* Repeat icon for repetitions */}
//                                 <th className="px-4 py-3">🔥 Calories</th>
//                                 {/* Fire icon for calories burnt */}
//                                 <th className="px-4 py-3"> Update</th>
//                                 <th className="px-4 py-3"> Delete</th>
//                             </tr>
//                             </thead>
//                             <tbody className="text-gray-800 divide-y divide-gray-100 text-center">
//                             {routine.drills.map((drill, index) => (
//                                 <>
//                                     <tr key={index} className="hover:bg-gray-50 border border-1">
//                                         <td className="px-4 py-3 font-medium">{drill.exercise.name}</td>
//                                         <td className="px-4 py-3">{drill.exercise.bodyPart.name}</td>
//                                         <td className="px-4 py-3">{drill.muscle.name}</td>
//                                         <td className="px-4 py-3">{drill.measurementUnit}</td>
//                                         <td className="px-4 py-3">{drill.measurement}</td>
//                                         <td className="px-4 py-3">{drill.unit}</td>
//                                         <td className="px-4 py-3">{drill.repetition}</td>
//                                         <td className="px-4 py-3">{drill.burntCalories}</td>
//                                         <td className="px-4 py-3">
//                                             <button
//                                                 className="inline-flex items-center px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold rounded-lg shadow transition-colors">
//                                                 <Pen className="w-4 h-4 mr-2"/>
//                                                 Highlight
//                                             </button>
//                                         </td>
//                                         <td className="px-4 py-3">
//                                             <button onClick={() => openModal(drill)}
//                                                 className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow transition-colors">
//                                                 <Trash2 className="w-4 h-4 mr-2"/>
//                                                 Delete
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 </>
//                             ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//
//                 <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg text-yellow-800 text-sm">
//                     ⚠️ Don’t forget to hydrate and cool down after finishing your routine!
//                 </div>
//
//             </> : <>
//                 <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg text-red-800 text-sm">
//                     ⚠️ We have not found any drills inside the routine.
//                 </div>
//             </>}
//
//             {/* Modal */}
//             {isModalOpen && (
//                 <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//                     <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
//                         <h3 className="text-lg font-bold">Update Exercise</h3>
//                         <div>
//                             <label className="block text-sm text-gray-600">Exercise Name</label>
//                             <input
//                                 type="text"
//                                 value={form.name}
//                                 onChange={(e) => setForm({ ...form, name: e.target.value })}
//                                 className="w-full mt-1 p-2 border rounded"
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-sm text-gray-600">Reps</label>
//                             <input
//                                 type="number"
//                                 value={form.reps}
//                                 onChange={(e) => setForm({ ...form, reps: e.target.value })}
//                                 className="w-full mt-1 p-2 border rounded"
//                             />
//                         </div>
//                         <div className="flex justify-end space-x-2 pt-2">
//                             <button
//                                 className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
//                                 onClick={() => setIsModalOpen(false)}
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
//                                 onClick={handleUpdate}
//                             >
//                                 Save Changes
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//
//         </div>
//
//     </>);
// }
// const RoutineId = ({routine}) => {
//     return (<>
//         <Layout content={<MainDesign data={routine}/>}/>
//     </>);
// }
//
// export default RoutineId;
//
// export async function getServerSideProps(context) {
//     const {routineId} = context.params;
//
//     try {
//         const res = await fetch(`${API_FITMATE_BASE_URL}/routines/routine/${routineId}`);
//         const data = await res.json();
//
//         if (!data) {
//             return {
//                 notFound: true,
//             };
//         }
//
//         return {
//             props: {
//                 routine: data.data, // must not be undefined
//             },
//         };
//     } catch (error) {
//         console.error('Failed to fetch routine:', error);
//         return {
//             props: {
//                 routine: null, // avoid undefined
//             },
//         };
//     }
// }

import {fetchData, updateData} from "@/dataService";
import {API_FITMATE_BASE_URL} from "@/constants";
import Layout from "@/components/layout/Layout";
import {useRouter} from "next/router";
import Link from "next/link";
import {Pen, Trash2, Check, X} from "lucide-react";
import {useState} from "react";

const MainDesign = ({data}) => {
    const router = useRouter();
    const [selectedRow, setSelectedRow] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({name: '', reps: ''});
    const [routine, setRoutine] = useState(data);

    const getStatus = (status) => {
        const status_str = String(status).toString().toLowerCase()
        if (status_str == 'not_started') {
            return 'Not started'
        } else if (status_str == 'in_progress') {
            return 'In-progress'
        } else if (status_str == 'completed') {
            return 'Completed'
        } else {
            return 'discard'
        }
    }

    const getStatusColor = (status) => {
        const status_str = String(status).toString().toLowerCase()
        if (status_str == 'not_started') {
            return 'gray'
        } else if (status_str == 'in_progress') {
            return 'yellow'
        } else if (status_str == 'completed') {
            return 'green'
        } else {
            return 'red'
        }
    }

    const getNextAction = (status) => {
        const status_str = String(status).toString().toLowerCase();
        if (status_str == 'not_started') {
            return 'Start Progress'
        } else if (status_str == 'in_progress') {
            return 'Mark Complete'
        }
    }


    const openModal = (row) => {
        setSelectedRow(row);
        setForm({name: row.name, reps: row.reps});
        setIsModalOpen(true);
    };

    const handleUpdate = () => {
        const updated = routine.map((row) => row.id === selectedRow.id ? {...row, ...form} : row);
        setRoutine(updated);
        setIsModalOpen(false);
    };

    const [editingIndex, setEditingIndex] = useState(null);
    const [editedFields, setEditedFields] = useState({
        refId: '', measurement: '', repetition: '', unit: '', measurementUnit: '', burntCalories: '',
    });

    const handleEdit = (index, drill) => {
        setEditingIndex(index);
        setEditedFields({
            refId: drill.refId,
            measurement: drill.measurement,
            unit: drill.unit,
            repetition: drill.repetition,
            measurementUnit: drill.measurementUnit,
            burntCalories: drill.burntCalories,
        });
    };

    const handleSave = async (index) => {
        const updated = [...routine.drills];
        updated[index] = {
            ...updated[index],
            refId: editedFields.refId,
            measurement: editedFields.measurement,
            unit: editedFields.unit,
            repetition: editedFields.repetition,
            measurementUnit: editedFields.measurementUnit,
            burntCalories: editedFields.burntCalories,
        };
        routine.drills = updated;
        setEditingIndex(null);
        await updateData(`${API_FITMATE_BASE_URL}/drills/drill`, updated[index]);
    };

    const handleDelete = (drill) => {
        // Your delete logic here
    };

    const handleCancel = () => {
        setEditingIndex(null);
        setEditedFields({
            refId: '', measurement: '', unit: '', repetition: '', measurementUnit: '', burntCalories: '',
        });
    };

    const units = ['Hour', 'Minute', 'Second', 'Kilogram', 'Pound', 'Gram', 'Count', 'Miles', 'Kilometer'];

    const [isRoutinePopupOpen, setIsRoutinePopupOpen] = useState(false);

    const UpdateRoutineWhenComplete = ({setIsRoutinePopupOpen, refId}) => {
        const [form, setForm] = useState({
            refId: refId, durationInMinutes: '', burntCalories: '', status: 'COMPLETED'
        });
        const handleRoutineUpdate = async () => {
            try {
                await updateData(`${API_FITMATE_BASE_URL}/routines/routine`, form);
                sessionStorage.setItem("message", "Routine has been updated successfully.");
                sessionStorage.setItem("severity", "success");
            } catch (error) {
                sessionStorage.setItem("message", "Update failed.");
                sessionStorage.setItem("severity", "error");
            }
            setForm({refId: refId, durationInMinutes: '', burntCalories: '', status: 'COMPLETED'});
            setIsRoutinePopupOpen(false);
            await router.push('/notifications/notification')
        };

        return (<>
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md space-y-4">
                    <h2 className="text-lg font-bold text-gray-800">Update Routine</h2>

                    <div>
                        <label className="block text-sm text-gray-700">⏱️ Duration (minutes)</label>
                        <input
                            type="number"
                            value={form.durationInMinutes}
                            onChange={(e) => setForm({...form, durationInMinutes: e.target.value})}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
                            placeholder="e.g. 30"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700">🔥 Burnt Calories</label>
                        <input
                            type="number"
                            value={form.burntCalories}
                            onChange={(e) => setForm({...form, burntCalories: e.target.value})}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
                            placeholder="e.g. 250"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            onClick={() => setIsRoutinePopupOpen(false)}
                            className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRoutineUpdate}
                            className="px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700"
                        >
                            Update
                        </button>
                    </div>
                </div>
            </div>
        </>);
    }

    return (<>
        {(isRoutinePopupOpen ?
            <UpdateRoutineWhenComplete setIsRoutinePopupOpen={setIsRoutinePopupOpen} refId={routine.refId}/> : <></>)}
        <div
            className="w-full mx-auto mt-10 px-6 py-8 bg-white/80 backdrop-blur-md rounded-3xl shadow-lg space-y-8 border border-gray-100">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">🏋️ Routine Summary</h1>
                    <p className="text-sm text-gray-500 mt-1">Workout Date: <span
                        className="font-semibold text-gray-700">08 Jul 2025</span></p>
                </div>
                <div className="relative group inline-block">
                    <button
                        onClick={async () => {
                            if (String(routine.status).toLowerCase() == 'not_started') {
                                const updatedRoutine = {
                                    refId: routine.refId, status: 'IN_PROGRESS',
                                }
                                try {
                                    await updateData(`${API_FITMATE_BASE_URL}/routines/routine`, updatedRoutine);
                                    sessionStorage.setItem("message", "Routine has been updated successfully.");
                                    sessionStorage.setItem("severity", "success");
                                    await router.push('/notifications/notification')
                                } catch (error) {
                                    sessionStorage.setItem("message", "Update failed.");
                                    sessionStorage.setItem("severity", "error");
                                    await router.push('/notifications/notification')
                                }

                            } else if (String(routine.status).toLowerCase() == 'in_progress') {
                                setIsRoutinePopupOpen(true);
                            }
                        }}
                        className={`inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded-full shadow-sm bg-${getStatusColor(routine.status)}-100 text-${getStatusColor(routine.status)}-700 hover:bg-${getStatusColor(routine.status)}-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${getStatusColor(routine.status)}-400 transition`}
                    >
                        {getStatus(routine.status)}
                    </button>

                    {/* Tooltip */}
                    {(String(routine.status).toLowerCase() == 'discard' || String(routine.status).toLowerCase() == 'completed') ? <></> : <>
                        <div
                            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 bg-gray-800 text-white text-xs rounded py-1 px-3 whitespace-nowrap shadow-lg">
                            {`Click to : ${getNextAction(routine.status)}`}
                            <div
                                className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                        </div>
                    </>}
                </div>
            </div>
            {(String(routine.status).toString().toLowerCase()) == 'completed' ?
                <div className="flex justify-between items-center">
                    <div>
                    <span
                        className="inline-block px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full shadow-sm">
                      {routine.burntCalories} KCal
                    </span>
                        <span
                            className="mx-2 inline-block px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full shadow-sm">
                      {routine.durationInMinutes} mins
                    </span>
                    </div>
                </div> : <></>}


            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase font-medium">Training Type</p>
                    <h3 className="text-lg font-semibold text-gray-800 mt-1">{routine.training.name}</h3>
                </div>
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase font-medium">Description</p>
                    <p className="text-gray-700 mt-1 text-sm">
                        {routine.description}
                    </p>
                </div>
            </div>
            {routine.drills != null && routine.drills.length > 0 ? (<>
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">💡 Drill Breakdown</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto text-xs border-collapse text-center">
                            <thead className="bg-gray-100 text-gray-600 text-center">
                            <tr className="border border-1">
                                <th className="px-4 py-3">🏋️ Exercise</th>
                                <th className="px-4 py-3">🧍 Body Part</th>
                                <th className="px-4 py-3">💪 Muscle</th>
                                <th className="px-4 py-3">📏 Measurement Unit</th>
                                <th className="px-4 py-3">🔢 Measurement Value</th>
                                <th className="px-4 py-3">⚖️ Unit</th>
                                <th className="px-4 py-3">🔁 Reps</th>
                                <th className="px-4 py-3">🔥 Calories</th>
                                <th className="px-4 py-3">Update</th>
                                <th className="px-4 py-3">Delete</th>
                            </tr>
                            </thead>
                            <tbody className="text-gray-800 divide-y divide-gray-100 text-center">
                            {routine.drills.map((drill, index) => (
                                <tr key={index} className="hover:bg-gray-50 border border-1">
                                    <td className="px-4 py-3 font-medium">{drill.exercise.name}</td>
                                    <td className="px-4 py-3">{drill.exercise.bodyPart.name}</td>
                                    <td className="px-4 py-3">{drill.muscle.name}</td>

                                    {/* Editable field: measurementUnit */}
                                    <td className="px-4 py-3">
                                        {drill.measurementUnit}
                                    </td>

                                    {/* Editable field: measurement */}
                                    <td className="px-4 py-3">
                                        {editingIndex === index ? (<input
                                            type="number"
                                            className="border rounded px-2 py-1 w-full"
                                            value={editedFields.measurement}
                                            onChange={(e) => setEditedFields({
                                                ...editedFields, measurement: e.target.value
                                            })}
                                        />) : (drill.measurement)}
                                    </td>

                                    {/* Editable field: unit */}
                                    <td className="px-4 py-3">
                                        {editingIndex === index ? (<select
                                            className="border rounded px-2 py-1 w-full bg-white text-sm"
                                            value={editedFields.unit}
                                            onChange={(e) => setEditedFields({
                                                ...editedFields, unit: e.target.value
                                            })}
                                        >
                                            <option value="">Select unit</option>
                                            {units.map((unit, index) => (<option key={index} value={unit}>
                                                {unit}
                                            </option>))}
                                        </select>) : (drill.unit)}
                                    </td>

                                    <td className="px-4 py-3">
                                        {editingIndex === index ? (<input
                                            type="number"
                                            className="border rounded px-2 py-1 w-full"
                                            value={editedFields.repetition}
                                            onChange={(e) => setEditedFields({
                                                ...editedFields, repetition: e.target.value
                                            })}
                                        />) : (drill.repetition)}
                                    </td>


                                    {/* Editable field: burntCalories */}
                                    <td className="px-4 py-3">
                                        {editingIndex === index ? (<input
                                            type="number"
                                            className="border rounded px-2 py-1 w-full"
                                            value={editedFields.burntCalories}
                                            onChange={(e) => setEditedFields({
                                                ...editedFields, burntCalories: e.target.value
                                            })}
                                        />) : (drill.burntCalories)}
                                    </td>

                                    {/* Update button */}
                                    <td className="px-4 py-3">
                                        {editingIndex === index ? (<div className="flex gap-2 justify-center">
                                            <button
                                                onClick={() => handleSave(index)}
                                                className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg shadow"
                                            >
                                                <Check className="w-4 h-4 mr-1"/>
                                                Save
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="inline-flex items-center px-3 py-2 bg-gray-400 hover:bg-gray-500 text-white text-sm font-semibold rounded-lg shadow"
                                            >
                                                <X className="w-4 h-4 mr-1"/>
                                                Cancel
                                            </button>
                                        </div>) : (<button
                                            onClick={() => handleEdit(index, drill)}
                                            className="inline-flex items-center px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold rounded-lg shadow"
                                        >
                                            <Pen className="w-4 h-4 mr-2"/>
                                            Edit
                                        </button>)}
                                    </td>

                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleDelete(drill)}
                                            className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2"/>
                                            Delete
                                        </button>
                                    </td>
                                </tr>))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div
                    className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg text-yellow-800 text-sm mt-4">
                    ⚠️ Don’t forget to hydrate and cool down after finishing your routine!
                </div>
            </>) : (<div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg text-red-800 text-sm">
                ⚠️ We have not found any drills inside the routine.
            </div>)}


            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
                        <h3 className="text-lg font-bold">Update Exercise</h3>
                        <div>
                            <label className="block text-sm text-gray-600">Exercise Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({...form, name: e.target.value})}
                                className="w-full mt-1 p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600">Reps</label>
                            <input
                                type="number"
                                value={form.reps}
                                onChange={(e) => setForm({...form, reps: e.target.value})}
                                className="w-full mt-1 p-2 border rounded"
                            />
                        </div>
                        <div className="flex justify-end space-x-2 pt-2">
                            <button
                                className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                onClick={handleUpdate}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>)}

        </div>

    </>);
}
const RoutineId = ({routine}) => {
    return (<>
        <Layout content={<MainDesign data={routine}/>}/>
    </>);
}

export default RoutineId;

export async function getServerSideProps(context) {
    const {routineId} = context.params;

    try {
        const res = await fetch(`${API_FITMATE_BASE_URL}/routines/routine/${routineId}`);
        const data = await res.json();

        if (!data) {
            return {
                notFound: true,
            };
        }

        return {
            props: {
                routine: data.data, // must not be undefined
            },
        };
    } catch (error) {
        console.error('Failed to fetch routine:', error);
        return {
            props: {
                routine: null, // avoid undefined
            },
        };
    }
}