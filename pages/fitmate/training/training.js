import {API_FITMATE_BASE_URL} from "@/constants";
import {fetchData, postData} from "@/dataService";
import Link from "next/link";
import {useState} from "react";
import ModalDialog from "@/components/modal_notifications/modal_notification_dialog";


const FitmateTraining = ({trainings}) => {
    console.log(trainings);
    const [trainingData, setTrainingData] = useState(trainings);
    const [newBodyPartDialog, setNewBodyPartDialog] = useState(false);
    const [bodyPartFormData, setBodyPartFormData] = useState({
        name: "", status: "", description: ""
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
        setBodyPartFormData((prevState) => ({
            ...prevState, [fieldName]: fieldValue
        }));
    };


    const SubmitNewBodyPart = async (e) => {
        e.preventDefault();
        const dataInAnArray = [];
        dataInAnArray.push(bodyPartFormData);
        console.log(JSON.stringify(dataInAnArray));
        try {
            const URL = `${API_FITMATE_BASE_URL}/trainings/training`;
            const createExerciseResponse = await postData(URL, dataInAnArray);
            setNotificationModal(true);
            const FETCH_URL = `${API_FITMATE_BASE_URL}/trainings`;
            const newTrainingData = await fetchData(FETCH_URL);
            setTrainingData(newTrainingData);
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

        return (<div
            className={`h-full block max-w-sm p-6 border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 ${randomColor}`}>
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{header}</h5>
            <p className="font-normal text-gray-700 dark:text-gray-400 font-sans text-sm">{message}</p>
        </div>);
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
                    <Link href="#">
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
                    <Link href="/fitmate/body_parts/body_parts">
                        <button type="button"
                                className="px-3 py-2 mr-3 text-xs font-medium text-center inline-flex items-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            <svg className="w-4 h-4 text-white me-2" aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                                 viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                      stroke-width="2"
                                      d="M12 7.757v8.486M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                            </svg>
                            Body Part
                        </button>
                    </Link>
                </div>
            </div>
        </div>
        <div className="container mx-auto my-4 p-2 border-1">
            <form method="POST" className="p-4 md:p-5" onSubmit={SubmitNewBodyPart}>
                <div className="grid grid-cols-4 gap-4 p-2 mx-auto">
                    <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="name"
                               className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                        <input type="text" name="name"
                               value={bodyPartFormData.name} onChange={handleNewBodyPartFormChange}
                               className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                               placeholder="Please enter the name."/>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="description"
                               className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
                        <input type="text" name="description"
                               value={bodyPartFormData.description}
                               onChange={handleNewBodyPartFormChange}
                               className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                               placeholder="Please write the description."/>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="status"
                               className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Status</label>
                        <select id="status" name="status" onChange={handleNewBodyPartFormChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            <option selected>Choose a status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="col-span-2 sm:col-span-1">

                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <button type="submit"
                                className=" text-white inline-flex items-center bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-l rounded-r text-xs px-1.5 py-1.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            <svg className="me-1 -ms-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd"
                                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                      clip-rule="evenodd"></path>
                            </svg>
                            Create Training
                        </button>
                        <button type="reset"
                                className="m-2 text-white inline-flex items-center bg-gray-400 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-l rounded-r text-xs px-1.5 py-1.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            <svg className="me-1 -ms-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd"
                                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                      clip-rule="evenodd"></path>
                            </svg>
                            Reset Form
                        </button>
                    </div>
                </div>

            </form>
        </div>
        <div className="container mx-auto my-4 p-2 border-1">
            <div className="grid grid-cols-4 gap-4 p-2 mx-auto">
                {(trainingData.data != null && trainingData.data.length > 0) ? (trainingData.data.map((item, index) => (<>
                    <div key={item.refId}>
                        <Link href={`/fitmate/exercise/${item.refId}`}>
                            <RandomGradientCard header={item.name} message={item.description}></RandomGradientCard>
                        </Link>
                    </div>
                </>))) : (<>
                    <p className="font-normal text-center text-gray-700 dark:text-gray-400 font-sans text-sm">No body
                        parts
                        have been found in the database.</p>
                </>)}
            </div>
        </div>
    </>);
};

export default FitmateTraining;

export async function getServerSideProps(context) {
    const trainings = await fetchData(`${API_FITMATE_BASE_URL}/trainings`);
    return {
        props: {
            trainings
        },
    };
}