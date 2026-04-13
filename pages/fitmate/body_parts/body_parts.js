import fitmateService from "../../../services/fitmate.service";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import ModalDialog from "@/components/modal_notifications/modal_notification_dialog";


const FitmateDashboard = () => {
    const [bodyPartsData, setBodyPartsData] = useState({ data: [] });
    const [loading, setLoading] = useState(true);
    const [bodyPartFormData, setBodyPartFormData] = useState({
        name: "", primaryName: "", status: "Active", description: ""
    });
    const [notificationModal, setNotificationModal] = useState(false);

    const handleNotificationModal = (newValue) => {
        setNotificationModal(newValue);
    };

    const LoadBodyPartsData = useCallback(async () => {
        try {
            const res = await fitmateService.getBodyParts();
            setBodyPartsData(res);
        } catch (error) {
            console.error("Unable to load the body parts", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        LoadBodyPartsData();
    }, [LoadBodyPartsData]);


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
        const dataInAnArray = [bodyPartFormData];
        try {
            await fitmateService.addBodyPart(dataInAnArray);
            setNotificationModal(true);
            await LoadBodyPartsData();
        } catch (error) {
            console.error(error);
            alert("Error creating body part.");
        }
    };

    const getRandomColor = (() => {
        const colors = [
            'bg-gradient-to-r from-blue-200 to-green-200',
            'bg-gradient-to-r from-yellow-100 to-pink-200',
            'bg-gradient-to-r from-purple-200 to-indigo-200',
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

    const DeleteBodyPart = async (refId) => {
        if (!confirm("Are you sure you want to delete this body part?")) return;
        try {
            await fitmateService.deleteBodyPart(refId);

            await LoadBodyPartsData();
        } catch (error) {
            console.error('Unable to delete', error);
            alert("Delete failed.");
        }
    };

    const RandomGradientCard = ({ header, message, refId }) => {
        const randomColor = getRandomColor();

        return (
            <div className={`relative block max-w-sm p-6 border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors ${randomColor}`}>
                {/* Cross button */}
                <button onClick={() => DeleteBodyPart(refId)}
                    className="absolute top-2 right-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 focus:outline-none z-10">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Card content */}
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{header}</h5>
                <p className="font-normal text-gray-700 dark:text-gray-400 font-sans text-sm">{message}</p>
            </div>
        );
    };

    if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Loading Body Parts...</div>;

    return (<>
        {(notificationModal) ?
            <ModalDialog notificationType="success" message="New Body Part has been created." isShow="true"
                showModals={handleNotificationModal} /> : (<></>)}
        <div className="container mx-auto my-4 px-4 border-1">
            <div className="flex flex-row p-2">
                <div>
                    <Link href="/dashboard/dashboard">
                        <button type="button"
                            className="px-3 py-2 mr-3 text-xs font-medium text-center inline-flex items-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            <svg className="w-3 h-3 text-white me-2" aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor" viewBox="0 0 20 16">
                                <path fillRule="evenodd"
                                    d="M11.293 3.293a1 1 0 0 1 1.414 0l6 6 2 2a1 1 0 0 1-1.414 1.414L19 12.414V19a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-3h-2v3a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2v-6.586l-.293.293a1 1 0 0 1-1.414-1.414l2-2 6-6Z"
                                    clipRule="evenodd" />
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
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 12h14M5 12l4-4m-4 4 4 4" />
                            </svg>
                            Go back
                        </button>
                    </Link>
                </div>
                <div>
                    <button onClick={LoadBodyPartsData} type="button"
                        className="px-3 py-2 mr-3 text-xs font-medium text-center inline-flex items-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        <svg className="w-4 h-4 text-white me-2" aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                            viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4" />
                        </svg>
                        Reload
                    </button>
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
                            placeholder="Please enter the name." />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="description"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
                        <input type="text" name="description"
                            value={bodyPartFormData.description}
                            onChange={handleNewBodyPartFormChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            placeholder="Please write the description." />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="primaryName"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Primary
                            Name</label>
                        <input type="text" name="primaryName"
                            value={bodyPartFormData.primaryName}
                            onChange={handleNewBodyPartFormChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            placeholder="Please mention the primary name" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">

                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <button type="submit"
                            className=" text-white inline-flex items-center bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-l rounded-r text-xs px-1.5 py-1.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            <svg className="me-1 -ms-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd"
                                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                    clipRule="evenodd"></path>
                            </svg>
                            Create
                        </button>
                    </div>
                </div>

            </form>
        </div>
        <div className="container mx-auto my-4 p-2 border-1">
            <div className="grid grid-cols-4 gap-4 p-2 mx-auto">
                {(bodyPartsData.data != null && bodyPartsData.data.length > 0) ? (bodyPartsData.data.map((item, index) => (
                    <div key={item.refId}>
                        <RandomGradientCard header={item.name} message={item.description}
                            refId={item.refId}></RandomGradientCard>
                    </div>
                ))) : (
                    <p className="col-span-4 font-normal text-center text-gray-700 dark:text-gray-400 font-sans text-sm">No body parts have been found in the database.</p>
                )}
            </div>
        </div>
    </>);
};

export default FitmateDashboard;
