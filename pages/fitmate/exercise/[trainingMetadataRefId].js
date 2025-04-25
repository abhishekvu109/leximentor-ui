import {API_FITMATE_BASE_URL} from "@/constants";
import {deleteDataByBody, fetchData, postData} from "@/dataService";
import Link from "next/link";
import {useState} from "react";
import ModalDialog from "@/components/modal_notifications/modal_notification_dialog";


const FitmateExerciseDashboard = ({exercises, bodyParts, trainingMetadataRefId}) => {
    const [newBodyPartDialog, setNewBodyPartDialog] = useState(false);
    const [bodyPartsData, setBodyPartsData] = useState(bodyParts);
    const [exerciseData, setExerciseData] = useState(exercises);
    const [exerciseDataForm, setExerciseDataForm] = useState({
        name: "", description: "", status: "Active", unit: "", targetBodyPartName: ""
    });
    const [notificationModal, setNotificationModal] = useState(false);

    const handleNotificationModal = (newValue) => {
        setNotificationModal(newValue);
    };

    const handleNewBodyPartDialog = (show) => {
        setNewBodyPartDialog(show);
    }
    // const handleNewBodyPartFormChange = (e) => {
    //     setBodyPartFormData((prevState) => ({
    //         ...prevState, [e.target.name]: e.target.value
    //     }));
    //     // {...bodyPartFormData, [e.target.name]: e.target.value});
    // };
    const handleNewBodyPartFormChange = (e) => {
        e.preventDefault();
        const fieldName = e.target.name;
        const fieldValue = e.target.value;
        setExerciseDataForm((prevState) => ({
            ...prevState, [fieldName]: fieldValue
        }));
    };

    const LoadExerciseData = async () => {
        try {
            const getExerciseData = await fetchData(`${API_FITMATE_BASE_URL}/exercises/exercise?trainingMetadataRefId=${trainingMetadataRefId}`);
            setExerciseData(getExerciseData);
        } catch (error) {
            console.log('Some error occurred while loading the exercise data.')
        }
    };

    const DeleteSelectedExercise=async (refId)=>{
        try{
            const formData=[{refId:refId}];
            const response=await deleteDataByBody(`${API_FITMATE_BASE_URL}/exercises/exercise`,formData);
            await LoadExerciseData();
        }catch(error){
            console.log('Unable to delete');
        }
    }

    const SubmitNewExercise = async (e) => {
        e.preventDefault();
        try {
            const URL = `${API_FITMATE_BASE_URL}/exercises/exercise?trainingMetadataRefId=${trainingMetadataRefId}&targetBodyPartName=${exerciseDataForm.targetBodyPartName}`;
            const submitNewExerciseResponse = await postData(URL, exerciseDataForm);
            setNotificationModal(true);
            await LoadExerciseData();
        } catch (error) {
            setNotificationModal(false);
        }
    };

    const getRandomColor = (() => {
        const colors = ['bg-gradient-to-r from-blue-200 to-green-200', 'bg-gradient-to-r from-yellow-100 to-pink-200', 'bg-gradient-to-r from-purple-200 to-indigo-200', // Add more gradient colors as needed
        ];
        let currentIndex = colors.length;

        return () => {
            if (currentIndex === 0) {
                currentIndex = colors.length;
            }

            const randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            const temp = colors[currentIndex];
            colors[currentIndex] = colors[randomIndex];
            colors[randomIndex] = temp;

            return colors[currentIndex];
        };
    })();

    const RandomGradientCard = ({header, message}) => {
        const randomColor = getRandomColor();

        return (<a href="#"
                   className={`block max-w-sm p-6 border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 ${randomColor}`}>
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{header}</h5>
            <p className="font-normal text-gray-700 dark:text-gray-400 font-sans text-sm">{message}</p>
        </a>);
    };


    return (<>
        {(notificationModal) ?
            <ModalDialog notificationType="success" message="New Body Part has been created." isShow="true"
                         showModals={handleNotificationModal}/> : (<></>)}
        <div className="container mx-auto my-4 px-4 border-1">
            <div className="flex flex-row p-2">
                <div>
                    <Link href="/dashboard/dashboard">
                        <button type="button"
                                className="px-3 py-2 mr-3 text-xs font-medium text-center inline-flex items-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            <svg className="w-3 h-3 text-white me-2" aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg"
                                 fill="currentColor" viewBox="0 0 20 16">
                                <path fill-rule="evenodd"
                                      d="M11.293 3.293a1 1 0 0 1 1.414 0l6 6 2 2a1 1 0 0 1-1.414 1.414L19 12.414V19a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-3h-2v3a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2v-6.586l-.293.293a1 1 0 0 1-1.414-1.414l2-2 6-6Z"
                                      clip-rule="evenodd"/>
                            </svg>
                            Dashboard
                        </button>
                    </Link>
                </div>
                <div>
                    <Link href="/fitmate/training/training">
                        <button type="button"
                                className="px-3 py-2 mr-3 text-xs font-medium text-center inline-flex items-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            <svg className="w-4 h-4 text-white me-2" aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                                 viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                      stroke-width="2"
                                      d="M5 12h14M5 12l4-4m-4 4 4 4"/>
                            </svg>
                            Go back
                        </button>
                    </Link>
                </div>
                <div>
                    <Link href="#" onClick={LoadExerciseData}>
                        <button type="button"
                                className="px-3 py-2 mr-3 text-xs font-medium text-center inline-flex items-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            <svg className="w-4 h-4 text-white me-2" aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                                 viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                      stroke-width="2"
                                      d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4"/>
                            </svg>
                            Reload
                        </button>
                    </Link>
                </div>
            </div>
        </div>
        <div className="container mx-auto my-4 p-2 border-1">
            <form method="POST" className="p-4 md:p-5" onSubmit={SubmitNewExercise}>
                <div className="grid grid-cols-4 gap-4 p-2 mx-auto">
                    <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="name"
                               className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                        <input type="text" name="name"
                               value={exerciseDataForm.name} onChange={handleNewBodyPartFormChange}
                               className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                               placeholder="Please enter the name."/>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="description"
                               className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
                        <input type="text" name="description"
                               value={exerciseDataForm.description}
                               onChange={handleNewBodyPartFormChange}
                               className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                               placeholder="Please write the description."/>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="unit"
                               className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Unit</label>
                        <select id="unit" name="unit" onChange={handleNewBodyPartFormChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            <option selected>Choose a unit</option>
                            <option value="time">Time</option>
                            <option value="reps">Reps</option>
                        </select>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="targetBodyPart"
                               className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Target Body
                            Part</label>
                        <select id="targetBodyPartName" name="targetBodyPartName" onChange={handleNewBodyPartFormChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            <option selected>Target Body Part</option>
                            {(bodyPartsData.data != null && bodyPartsData.data.length > 0) ? (bodyPartsData.data.map((item, index) => (<>
                                <option key={item.refId} value={item.name}>{item.name}</option>
                            </>))) : (<></>)}
                        </select>
                    </div>
                    <div className="col-span-2 sm:col-span-1">

                    </div>
                </div>
                <div className="flex flex-row">
                    <div>
                        <button type="submit"
                                className="ml-2 text-white inline-flex items-center bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-l rounded-r text-xs px-1.5 py-1.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            <svg className="me-1 -ms-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd"
                                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                      clip-rule="evenodd"></path>
                            </svg>
                            Create
                        </button>
                    </div>
                </div>

            </form>
        </div>
        <div className="container mx-auto my-4 p-2 border-1">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th scope="col" className="px-6 py-3 text-center w-1/12">
                        Serial
                    </th>
                    <th scope="col" className="px-6 py-3 text-center w-1/12">
                        Ref ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-center w-2/12">
                        Name
                    </th>
                    {/*<th scope="col" className="px-6 py-3 text-center w-5/12">*/}
                    {/*    Description*/}
                    {/*</th>*/}
                    <th scope="col" className="px-6 py-3 text-center w-1/12">
                        Unit
                    </th>
                    <th scope="col" className="px-6 py-3 text-center w-1/12">
                        Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-center w-2/12">
                        Training
                    </th>
                    <th scope="col" className="px-6 py-3 text-center w-1/12">
                        Target body parts
                    </th>
                    <th scope="col" className="px-6 py-3 text-center w-1/12">
                        Delete
                    </th>
                    <th scope="col" className="px-6 py-3 text-center w-1/12">
                        Update
                    </th>
                </tr>
                </thead>
                <tbody>
                {exerciseData.data != null && exerciseData.data.length > 0 ? (exerciseData.data.map((item, index) => (
                    <tr key={item.refId}>
                        <td scope="row"
                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center">{index + 1}</td>
                        <td className="px-6 py-4 text-center text-xs font-sans text-blue-700 text-decoration-underline">{item.refId}</td>
                        <td className="px-6 py-4 text-center text-xs font-sans">
                            <a href="#"
                               className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-semibold me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-blue-400 border border-blue-400 inline-flex items-center justify-center">{new String(item.name).toUpperCase()}</a>
                        </td>
                        {/*<td className="px-6 py-4 text-center text-xs font-sans text-blue-700 text-decoration-underline">{item.description}</td>*/}
                        <td className="px-6 py-4 text-center text-xs font-sans">
                            <span
                                className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-400 border border-gray-500">{new String(item.unit).toUpperCase()}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <span
                                className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-green-400 border border-green-400">{new String(item.status).toUpperCase()}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <span
                                className="bg-purple-100 text-purple-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-purple-400 border border-purple-400">{item.trainingMetadata.name}</span>
                        </td>
                        <td className="px-6 py-4 text-center text-xs">
                            <span
                                className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-yellow-300 border border-yellow-300">{item.targetBodyPart.name}</span>
                        </td>
                        <td className="px-6 py-4 text-center text-xs text-blue-700 text-decoration-underline font-sans">
                            <Link href="#" onClick={()=>DeleteSelectedExercise(item.refId)}>Delete</Link>
                        </td>
                        <td className="px-6 py-4 text-center text-xs text-blue-700 text-decoration-underline font-sans">
                            <Link href="#">Update</Link>
                        </td>
                    </tr>))) : (<tr>
                    <td scope="col" className="px-6 py-4 text-center">
                    </td>
                    <td scope="col" className="px-6 py-4 text-center">
                    </td>
                    <td scope="col" className="px-6 py-4 text-center">
                    </td>
                    {/*<td scope="col" className="px-6 py-4 text-center">*/}
                    {/*</td>*/}
                    <td scope="col" className="px-6 py-4 text-center">
                        <h6 className="text-lg font-bold dark:text-white">No data found</h6>
                    </td>
                    <td scope="col" className="px-6 py-4 text-center">
                    </td>
                    <td scope="col" className="px-6 py-4 text-center">
                    </td>
                    <td scope="col" className="px-6 py-4 text-center">
                    </td>
                    <td scope="col" className="px-6 py-4 text-center">
                    </td>
                    <td scope="col" className="px-6 py-4 text-center">
                    </td>
                </tr>)}
                </tbody>
            </table>
        </div>
    </>);
};

export default FitmateExerciseDashboard;

export async function getServerSideProps(context) {
    const {trainingMetadataRefId} = context.params;
    const exercises = await fetchData(`${API_FITMATE_BASE_URL}/exercises/exercise?trainingMetadataRefId=${trainingMetadataRefId}`);
    const bodyParts = await fetchData(`${API_FITMATE_BASE_URL}/bodyparts`);
    return {
        props: {
            exercises, bodyParts, trainingMetadataRefId
        },
    };
}