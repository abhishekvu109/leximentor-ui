import Layout from "@/components/layout/Layout";
import VerticalTabInterface from "@/components/widgets/tabs/VerticalTabInterface";
import FitmateMakeRoutine from "@/pages/fitmate/routine/make-routine";
import Link from "next/link";
import {API_FITMATE_BASE_URL} from "@/constants";
import {useEffect, useState} from "react";
import {fetchData} from "@/dataService";

const ViewByStatus = ({status}) => {
    const [routine, setRoutine] = useState([]);
    useEffect(() => {
        const fetch = async () => {
            try {
                const routineRes = await fetchData(`${API_FITMATE_BASE_URL}/routines/routine?status=${status}`);
                console.log("API Response:", routineRes);
                setRoutine(routineRes.data || []);
            } catch (error) {
                console.error('Error fetching routines:', error);
            }
        };

        fetch();
    }, []);


    return (<>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
            <div className="overflow-x-auto">
                <table className="min-w-full text-center">
                    <thead className="bg-gray-50 text-sm">
                    <tr className="text-gray-500 border-b">
                        <th className="px-4 py-2">📅 Date</th>
                        <th className="px-4 py-2">📅 ID</th>
                        <th className="px-4 py-2">📅 Key</th>
                        <th className="px-4 py-2">🏋️ Training</th>
                        <th className="px-4 py-2">💪 Details</th>
                        <th className="px-4 py-2">💪 Remove</th>
                    </tr>

                    </thead>
                    <tbody>
                    {routine.slice(0, 5).map((log, index) => (<tr
                        key={index}
                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b text-gray-800 text-xs text-center`}
                    >
                        <td className="px-4 py-2">{log.workoutDate}</td>
                        <td className="px-4 py-2">{log.refId}</td>
                        <td className="px-4 py-2">{log.key}</td>
                        <td className="px-4 py-2">{log.training.name}</td>
                        <td className="px-4 py-2"><Link className="text-blue-700 underline" href={`/fitmate/routine/routine-details/${log.refId}`}>Click for
                            details</Link></td>
                        <td className="px-4 py-2"><Link className="text-blue-700 underline"
                                                        href={`/fitmate/routine/routine-details/${log.refId}`}>Remove</Link>
                        </td>
                    </tr>))}
                    </tbody>
                </table>
            </div>
        </div>
    </>);
}
const MainDesign = () => {
    const FormHeading = () => {
        return (<>
            <div className="flex flex-col justify-center items-center justify-items-center text-center">
                <div className="w-[100%]">
                    <h2 className="text-2xl text-black font-bold">Fitmate Routine</h2>
                    <p className="mt-2 text-sm font-semibold text-black/65">Our app empowers users to set and save daily
                        fitness goals, track exercises, monitor progress, record calories burned, and stay motivated
                        with personalized routines, progress insights, and achievement reminders.</p>
                </div>
            </div>
        </>);
    }
    const tabs = [{
        id: 'CreateRoutine', label: 'Create Routine', content: () => (<>
            <FitmateMakeRoutine/>
        </>),
    }, {
        id: 'NotStarted', label: 'Not Started', content: (<div>
            <ViewByStatus status={'not_started'}/>
        </div>),
    }, {
        id: 'InProgress', label: 'In Progress', content: (<div>
            <ViewByStatus status={'in_progress'}/>
        </div>),
    }, {
        id: 'Completed', label: 'Completed', content: (<>
            <div>
                <ViewByStatus status={'completed'}/>
            </div>
        </>),
    }];
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

const Routine = () => {
    return (<>
        <Layout content={<MainDesign/>}/>
    </>);
}

export default Routine;