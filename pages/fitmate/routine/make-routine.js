import Layout from "@/components/layout/Layout";
import Stepper from "@/components/widgets/stepper/Stepper";
import {ChevronDown, Option} from "lucide-react";
import {useEffect, useState} from "react";
import CollapsiblePanel from "@/components/widgets/collapsible-panel/CollapsiblePanel";
import EditableTable from "@/components/widgets/editable-table/EditableTable";
import DropDown from "@/components/form/DropDown";
import {API_FITMATE_BASE_URL, FITMATE_MEASUREMENT_UNITS} from "@/constants";
import {fetchData, POST, postData} from "@/dataService";
import {useRouter} from "next/router";


const Training = ({
                      routine,
                      setRoutine,
                      training,
                      selectedTraining,
                      setSelectedTraining,
                      description,
                      setDescription,
                      workoutDate,
                      setWorkoutDate
                  }) => {

    const handleSave = () => {
        setRoutine({
            ...routine, training: {name: selectedTraining}, description, workoutDate,
        });
    };

    return (<div className="bg-gray-50 p-1">
        <div className="max-w-full mx-1 bg-white rounded-2xl shadow-md p-6 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">🏋️ Create Your Exercise Routine</h2>

            <div>
                <label className="block text-sm font-medium text-gray-700">Select Training Type</label>
                <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={selectedTraining}
                    onChange={(e) => setSelectedTraining(e.target.value)}
                >
                    <option value="">Select a training</option>
                    {training.map((type) => (<option key={type.refId} value={type.name}>
                        {type.name}
                    </option>))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Select Date</label>
                <input
                    type="date"
                    value={workoutDate}
                    onChange={(e) => setWorkoutDate(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Routine Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="4"
                    placeholder="Write a short description for your routine..."
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div className="flex justify-end">
                <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md"
                    onClick={handleSave}
                >
                    Save Routine
                </button>
            </div>
        </div>
    </div>);
};


const AddExercises = ({
                          routine,
                          setRoutine,
                          exerciseCart,
                          setExerciseCart,
                          exerciseHistory,
                          setExerciseHistory,
                          bodyParts,
                          setBodyParts,
                          muscles,
                          setMuscles,
                          exercises,
                          setExercises,
                          tableData,
                          setTableData,
                          bodyPartNames,
                          units,
                          setUnits,
                          selectedBodyParts,
                          setSelectedBodyParts,
                          selectedMuscles,
                          setSelectedMuscles,
                          selectedExercises,
                          setSelectedExercises,
                          showExerciseCart,
                          setShowExerciseCart,
                          showExerciseHistory,
                          setShowExerciseHistory
                      }) => {

    const [muscleNames, setMuscleNames] = useState(muscles.map(muscle => muscle.name));
    const [exerciseNames, setExerciseNames] = useState(exercises.map(exercise => exercise.name));

    const getExerciseHistory = async (name) => {
        const drillHistory = await fetchData(`${API_FITMATE_BASE_URL}/drill/${name}`);
        setExerciseHistory(drillHistory.data);
    }
    const [form, setForm] = useState({
        training: '',
        exercise: '',
        bodyPart: '',
        muscle: '',
        measurement: '',
        repetition: '',
        notes: '',
        measurementUnit: '',
        caloriesBurnt: '',
        unit: ''
    });


    const columns = [{key: 'training', label: 'Training Name', type: 'text', editable: false}, {
        key: 'bodyPart', label: 'Body Part', type: 'text', editable: false
    }, {key: 'muscle', label: 'Muscle', type: 'text', editable: false}, {
        key: 'exercise', label: 'Exercise', type: 'number', editable: false
    }, {
        key: 'measurementUnit',
        label: 'Measurement Unit',
        type: 'select',
        options: ['Weight', 'Time', 'Reps', 'Distance'],
        editable: true
    }, {key: 'measurement', label: 'Measurement', type: 'number', editable: true}, // read-only
        {
            key: 'unit',
            label: 'Unit',
            type: 'select',
            options: ['Hour', 'Minute', 'Second', 'Kilogram', 'Pound', 'Gram', 'Count', 'Miles', 'Kilometer'],
            editable: true
        }, // read-only
        {key: 'repetition', label: 'Repetition', type: 'number', editable: true}, {
            key: 'burntCalories', label: 'Burnt Calories', type: 'number', editable: true
        },];


    const handleAddToCart = () => {
        const newEntry = {
            training: routine.training.name,
            exercise: selectedExercises,
            bodyPart: selectedBodyParts,
            muscle: selectedMuscles, // or get from form if dynamic
            measurementUnit: form.measurementUnit,
            measurement: form.measurement,
            unit: form.unit,
            repetition: form.repetition,
            burntCalories: form.caloriesBurnt,
        };


        setTableData(prev => [...prev, newEntry]);
        setExerciseCart(prev => [...prev, newEntry]);

        setForm({
            training: '',
            exercise: '',
            bodyPart: '',
            muscle: '',
            measurement: '',
            repetition: '',
            notes: '',
            measurementUnit: '',
            caloriesBurnt: '',
            unit: ''
        });

    };

    const handleSave = () => {
        if (exerciseCart != null && exerciseCart.length > 0) {
            const drills = []
            for (let i = 0; i < exerciseCart.length; i++) {
                drills.push(exerciseCart[i])
            }
            routine.drills = drills;
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const day = `${date.getDate()}`.padStart(2, '0');
        const month = `${date.getMonth() + 1}`.padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };


    return (<>
        <div>
            <div className="flex inline-flex">
                <button
                    className="px-4 py-2 mb-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md transition"
                    onClick={() => {
                        setShowExerciseCart(!showExerciseCart)
                    }}>
                    <div className="my-1 inline-flex items-center justify-center">
                        {showExerciseCart ? <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                 strokeLinejoin="round" className="lucide lucide-eye-off-icon lucide-eye-off">
                                <path
                                    d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/>
                                <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/>
                                <path
                                    d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/>
                                <path d="m2 2 20 20"/>
                            </svg>
                        </> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                   fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                   strokeLinejoin="round" className="lucide lucide-eye-icon lucide-eye">
                            <path
                                d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>}
                        <span
                            className="ml-2 text-sm leading-none">{showExerciseCart ? 'Hide Cart' : 'Show Cart'}</span>
                    </div>
                </button>

                <button
                    className="px-4 py-2 mb-3 mx-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md transition"
                    onClick={() => {
                        setShowExerciseHistory(!showExerciseHistory)
                    }}>
                    <div className="my-1 inline-flex items-center justify-center">
                        {showExerciseCart ? <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                 stroke-linejoin="round" className="lucide lucide-eye-off-icon lucide-eye-off">
                                <path
                                    d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/>
                                <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/>
                                <path
                                    d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/>
                                <path d="m2 2 20 20"/>
                            </svg>
                        </> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                   fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                   stroke-linejoin="round" className="lucide lucide-eye-icon lucide-eye">
                            <path
                                d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>}
                        <span
                            className="ml-2 text-sm leading-none">{showExerciseHistory ? 'Hide History' : 'Show History'}</span>
                    </div>
                </button>
            </div>
        </div>
        <div>
            {(showExerciseCart && exerciseCart != null && exerciseCart.length > 0) ?
                <EditableTable tableHeader={'Exercise Cart'} columns={columns} data={tableData}
                               onChange={(updated) => {
                                   setTableData(updated)
                                   setExerciseCart(updated)
                               }}/> : <></>}

        </div>
        <div
            className="max-w-screen mx-auto mt-2 p-6 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl transition-all">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                💡 Add Exercise to Routine
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-1 mb-6">
                <div>
                    <DropDown label={`🏋️ Body part`} selected={selectedBodyParts} items={bodyPartNames}
                              onSelect={(item) => {
                                  setSelectedBodyParts(item)
                                  // const filteredMuscles = muscles.filter(muscle => String(muscle.bodyPart).toLowerCase() === String(item).toLowerCase());
                                  const filteredMuscles = muscles.filter(muscle => String(muscle.bodyPart.name).toLowerCase() === String(item).toLowerCase());
                                  setMuscleNames(filteredMuscles.map(muscle => muscle.name));
                                  setSelectedMuscles('')
                                  setSelectedExercises('')
                              }}/>
                </div>

                <div>
                    <DropDown label={`🏋️ Muscle`} selected={selectedMuscles} items={muscleNames}
                              onSelect={(item => {
                                  setSelectedMuscles(item)
                                  const filteredExercises = exercises.filter(exercise => exercise.targetMuscles?.some(muscle => muscle.name === item));
                                  setExerciseNames(filteredExercises.map(exercise => exercise.name));
                                  setSelectedExercises('')
                              })}/>
                </div>

                <div>
                    <DropDown label={`🏋️ Exercise`} selected={selectedExercises} items={exerciseNames}
                              onSelect={async (item) => {
                                  setSelectedExercises(item)
                                  await getExerciseHistory(item);
                              }}/>
                </div>
            </div>

            {/*<div className="grid grid-cols-1 md:grid-cols-3 gap-1 mb-6">*/}
            {/*    /!* Body Part *!/*/}
            {/*    <div>*/}
            {/*        <DropDown*/}
            {/*            label="🏋️ Body part"*/}
            {/*            selected={selectedBodyParts}*/}
            {/*            items={bodyPartNames}*/}
            {/*            onSelect={(item) => {*/}
            {/*                setSelectedBodyParts(item);*/}
            {/*                setSelectedMuscles("");   // reset dependent*/}
            {/*                setSelectedExercises(""); // reset dependent*/}
            {/*            }}*/}
            {/*        />*/}
            {/*    </div>*/}

            {/*    /!* Muscle *!/*/}
            {/*    <div>*/}
            {/*        <DropDown*/}
            {/*            label="💪 Muscle"*/}
            {/*            selected={selectedMuscles}*/}
            {/*            items={muscleNames}*/}
            {/*            onSelect={(item) => {*/}
            {/*                setSelectedMuscles(item);*/}
            {/*                setSelectedExercises(""); // reset dependent*/}
            {/*            }}*/}
            {/*        />*/}
            {/*    </div>*/}

            {/*    /!* Exercise *!/*/}
            {/*    <div>*/}
            {/*        <DropDown*/}
            {/*            label="🏃 Exercise"*/}
            {/*            selected={selectedExercises}*/}
            {/*            items={exerciseNames}*/}
            {/*            onSelect={async (item) => {*/}
            {/*                setSelectedExercises(item);*/}
            {/*                await getExerciseHistory(item);*/}
            {/*            }}*/}
            {/*        />*/}
            {/*    </div>*/}
            {/*</div>*/}


            {/* History Summary */}
            {showExerciseHistory && exerciseHistory != null && exerciseHistory.length > 0 ?
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
                    <p className="text-sm text-gray-700 mb-2">
                        📊 <strong>{selectedExercises}</strong> has been
                        done <strong>{exerciseHistory != null && exerciseHistory.length > 0 ? exerciseHistory.length : 0}</strong> times.
                    </p>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-center">
                            <thead className="bg-gray-50">
                            <tr className="text-gray-500 border-b">
                                <th className="px-4 py-2">📅 Date</th>
                                <th className="px-4 py-2">🏋️‍♂️ Training</th>
                                <th className="px-4 py-2">🏃‍♂️ Exercise</th>
                                <th className="px-4 py-2">📏 Measurement Unit</th>
                                <th className="px-4 py-2">🔢 Measurement</th>
                                <th className="px-4 py-2">⚖️ Unit</th>
                                <th className="px-4 py-2">🔁 Repetition</th>
                                <th className="px-4 py-2">🔥 Burnt Calories</th>
                            </tr>

                            </thead>
                            <tbody>
                            {exerciseHistory.slice(0, 5).map((log, index) => (<tr
                                key={index}
                                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b text-gray-800`}
                            >
                                <td className="px-4 py-2">{formatDate(log.creationDate)}</td>
                                <td className="px-4 py-2">{log.exercise.training.name}</td>
                                <td className="px-4 py-2">{log.exercise.name}</td>
                                <td className="px-4 py-2">{log.measurementUnit}</td>
                                <td className="px-4 py-2">{log.measurement}</td>
                                <td className="px-4 py-2">{log.unit}</td>
                                <td className="px-4 py-2">{log.repetition}</td>
                                <td className="px-4 py-2">{log.burntCalories}</td>
                            </tr>))}
                            </tbody>
                        </table>
                    </div>
                </div> : <></>}


            {/* Input Section */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">🏋️ Measurement unit</label>
                    <select
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={form.measurementUnit}
                        onChange={(e) => {
                            setUnits(FITMATE_MEASUREMENT_UNITS[e.target.value])
                            setForm({...form, measurementUnit: e.target.value})
                        }}>
                        <option value="">Select Unit</option>
                        <option value="Weight">Weight</option>
                        <option value="Time">Time</option>
                        <option value="Reps">Reps</option>
                        <option value="Distance">Distance</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">🏋️ Measurement</label>
                    <input
                        type="text"
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. 52.5"
                        value={form.measurement}
                        onChange={(e) => setForm({...form, measurement: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">🏋️ Unit</label>
                    <select
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={form.unit}
                        onChange={(e) => setForm({...form, unit: e.target.value})}>
                        <option>Select Unit</option>
                        {units.map((name, idx) => (<option key={idx} value={name}>{name}</option>))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">🔢 Reps</label>
                    <input
                        type="number"
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 12"
                        value={form.repetition}
                        onChange={(e) => setForm({...form, repetition: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">🔢 Calories Burnt</label>
                    <input
                        type="number"
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 12"
                        value={form.caloriesBurnt}
                        onChange={(e) => setForm({...form, caloriesBurnt: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">📝 Notes</label>
                    <input
                        type="text"
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Any notes..."
                        value={form.notes}
                        onChange={(e) => setForm({...form, notes: e.target.value})}
                    />
                </div>
            </div>

            <div className="text-right">
                <div className="flex inline-flex">
                    <button
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md transition"
                        onClick={handleAddToCart}
                    >
                        <div className="my-1 inline-flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-circle-plus-icon lucide-circle-plus shrink-0"
                            >
                                <circle cx="12" cy="12" r="6"/>
                                <path d="M8 12h8"/>
                                <path d="M12 8v8"/>
                            </svg>
                            <span className="ml-1 text-sm leading-none">Add to cart</span>
                        </div>
                    </button>
                    <button
                        className="p-2 ml-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium shadow-md transition"
                        onClick={handleSave}
                    >
                        <div className="my-1 inline-flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                 strokeLinejoin="round" className="lucide lucide-save-icon lucide-save">
                                <path
                                    d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
                                <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/>
                                <path d="M7 3v4a1 1 0 0 0 1 1h7"/>
                            </svg>
                            <span className="ml-2 text-sm leading-none">Save to routine</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    </>);
}

const ReviewAndSubmit = ({routine}) => {
    const router = useRouter();

    const handleSubmitRoutine = async () => {
        const drills = routine.drills;
        if (drills != null && drills.length > 0) {
            const newDrills = [];
            for (let i = 0; i < drills.length; i++) {
                const drill = drills[i];
                newDrills.push({
                    exercise: {
                        name: String(drill.exercise).toString()
                    },
                    measurementUnit: drill.measurementUnit,
                    measurement: Number(drill.measurement),
                    unit: drill.unit,
                    repetition: Number(drill.repetition),
                    burntCalories: Number(drill.burntCalories),
                    notes: drill.notes,
                    muscle: {
                        name: String(drill.muscle).toString()
                    }
                });
            }
            routine.drills = newDrills;
            await postData(`${API_FITMATE_BASE_URL}/routines/routine`, routine);
            sessionStorage.setItem("message", "Routine has been created successfully.");
            sessionStorage.setItem("severity", "success");
        } else {
            sessionStorage.setItem("message", "Routine couldn't be created.");
            sessionStorage.setItem("severity", "error");
            throw new Error('No drill data found.');
        }
        await router.push('/notifications/notification')
    }

    return (<>
        {routine != null && routine.drills != null && routine.drills.length > 0 ? <>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-center">
                        <thead className="bg-gray-50 text-sm">
                        <tr className="text-gray-500 border-b">
                            <th className="px-4 py-2">📅 Date</th>
                            <th className="px-4 py-2">🏋️ Training</th>
                            <th className="px-4 py-2">🧍 Description</th>
                            <th className="px-4 py-2">💪 Details</th>
                            <th className="px-4 py-2">🏃 Exercise</th>
                            <th className="px-4 py-2">📏 Unit Type</th>
                            <th className="px-4 py-2">🔢 Value</th>
                            <th className="px-4 py-2">⚖️ Unit</th>
                            <th className="px-4 py-2">🔁 Reps</th>
                            <th className="px-4 py-2">🔥 Calories</th>
                        </tr>

                        </thead>
                        <tbody>
                        {routine.drills.slice(0, 5).map((log, index) => (<tr
                            key={index}
                            className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b text-gray-800 text-xs text-center`}
                        >
                            <td className="px-4 py-2">{routine.workoutDate}</td>
                            <td className="px-4 py-2">{log.training}</td>
                            <td className="px-4 py-2">{log.bodyPart}</td>
                            <td className="px-4 py-2">{log.muscle}</td>
                            <td className="px-4 py-2">{log.exercise}</td>
                            <td className="px-4 py-2">{log.measurementUnit}</td>
                            <td className="px-4 py-2">{log.measurement}</td>
                            <td className="px-4 py-2">{log.unit}</td>
                            <td className="px-4 py-2">{log.repetition}</td>
                            <td className="px-4 py-2">{log.burntCalories}</td>
                        </tr>))}
                        </tbody>
                    </table>
                </div>
                <div className="text-right">
                    <div className="flex inline-flex">
                        <button onClick={handleSubmitRoutine}
                                className="p-2 mt-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium shadow-md transition">
                            <div className="my-1 inline-flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                     strokeLinejoin="round" className="lucide lucide-save-icon lucide-save">
                                    <path
                                        d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
                                    <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/>
                                    <path d="M7 3v4a1 1 0 0 0 1 1h7"/>
                                </svg>
                                <span className="ml-2 text-sm leading-none">Save to routine</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </> : <p>No exercises has been found in the cart.</p>}
    </>);
}
const FitmateMakeRoutine = () => {
    const [routine, setRoutine] = useState({
        training: {
            name: ''
        }, description: '', workoutDate: '', drills: []
    });

    /* for the training stepper */
    const [training, setTraining] = useState([]);
    const [selectedTraining, setSelectedTraining] = useState('');
    const [description, setDescription] = useState('');
    const [workoutDate, setWorkoutDate] = useState('');

    useEffect(() => {
        const fetchExerciseTypes = async () => {
            try {
                const res = await fetch(`${API_FITMATE_BASE_URL}/trainings`);
                const data = await res.json();
                setTraining(data.data);
            } catch (error) {
                console.error('Error fetching exercise types:', error);
            }
        };

        fetchExerciseTypes();
    }, []);

    /* for the exercise stepper */

    const [exerciseCart, setExerciseCart] = useState([])
    const [exerciseHistory, setExerciseHistory] = useState([])
    const [bodyParts, setBodyParts] = useState([]);
    const [muscles, setMuscles] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [tableData, setTableData] = useState([]);
    const bodyPartNames = bodyParts.map(part => part.name);
    const [units, setUnits] = useState([])
    const [selectedBodyParts, setSelectedBodyParts] = useState('');
    const [selectedMuscles, setSelectedMuscles] = useState('');
    const [selectedExercises, setSelectedExercises] = useState('');
    const [showExerciseCart, setShowExerciseCart] = useState(true);
    const [showExerciseHistory, setShowExerciseHistory] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bodyRes, muscleRes, exerciseRes] = await Promise.all([fetch(`${API_FITMATE_BASE_URL}/bodyparts`), fetch(`${API_FITMATE_BASE_URL}/muscles`), fetch(`${API_FITMATE_BASE_URL}/exercises`)]);

                const [bodyData, muscleData, exerciseData] = await Promise.all([bodyRes.json(), muscleRes.json(), exerciseRes.json()]);

                setBodyParts(bodyData.data || []);
                setMuscles(muscleData.data || []);
                setExercises(exerciseData.data || []);
            } catch (error) {
                console.error("Error fetching dropdown data:", error);
            }
        };

        fetchData();
    }, []);


    /* for the review and submit stepper. */


    const steps = [{
        title: 'Select Training', content: <><Training routine={routine} setRoutine={setRoutine} training={training}
                                                       selectedTraining={selectedTraining}
                                                       setSelectedTraining={setSelectedTraining}
                                                       description={description}
                                                       setDescription={setDescription}
                                                       workoutDate={workoutDate}
                                                       setWorkoutDate={setWorkoutDate}
        /></>,
    }, {
        title: 'Add Exercises', content: <><AddExercises routine={routine} setRoutine={setRoutine}
                                                         exerciseCart={exerciseCart}
                                                         setExerciseCart={setExerciseCart}
                                                         exerciseHistory={exerciseHistory}
                                                         setExerciseHistory={setExerciseHistory}
                                                         bodyParts={bodyParts}
                                                         setBodyParts={setBodyParts}
                                                         muscles={muscles}
                                                         setMuscles={setMuscles}
                                                         exercises={exercises}
                                                         setExercises={setExercises}
                                                         tableData={tableData}
                                                         setTableData={setTableData}
                                                         bodyPartNames={bodyPartNames}
                                                         units={units}
                                                         setUnits={setUnits}
                                                         selectedBodyParts={selectedBodyParts}
                                                         setSelectedBodyParts={setSelectedBodyParts}
                                                         selectedMuscles={selectedMuscles}
                                                         setSelectedMuscles={setSelectedMuscles}
                                                         selectedExercises={selectedExercises}
                                                         setSelectedExercises={setSelectedExercises}
                                                         showExerciseCart={showExerciseCart}
                                                         setShowExerciseCart={setShowExerciseCart}
                                                         showExerciseHistory={showExerciseHistory}
                                                         setShowExerciseHistory={setShowExerciseHistory}

        /></>,
    }, {
        title: 'Review & Submit', content: <><ReviewAndSubmit routine={routine}/> </>,
    },];
    return <>
        {/*<Layout content={<>*/}
        {/*    <Stepper steps={steps}/>*/}
        {/*</>}/>*/}
        <Stepper steps={steps}/>
    </>
}

export default FitmateMakeRoutine;

