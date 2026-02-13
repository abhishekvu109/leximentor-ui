import { useState } from "react";
import synapsterService from "../../../services/synapster.service";
import ModalDialog from "@/components/modal_notifications/modal_notification_dialog";
import Link from "next/link";

const Subject = () => {
    const [subjectFormData, setSubjectFormData] = useState({ name: "", status: "", description: "", category: "" });
    const [showModal, setShowModal] = useState(false);

    const handleChange = (e) => {
        setSubjectFormData({ ...subjectFormData, [e.target.name]: e.target.value });
    };
    const handleShowModal = (newValue) => {
        setShowModal(newValue);
    };
    const handleSubjectCreate = async (e) => {
        e.preventDefault();
        console.log(JSON.stringify(subjectFormData));
        const subjectArray = [];
        subjectArray.push(subjectFormData);
        try {
            await synapsterService.createSubjects(subjectArray);
            setShowModal(true);
        } catch (error) {
            setShowModal(false);
        }
        // const response = await postData(URL, subjectArray);
        // if (response.meta.status === 0) {
        //     return (<ModalDialog notificationType="success" message="Subject has been created" isShow="true"/>);
        // } else {
        //     return (<ModalDialog notificationType="failed" message="Subject creation has been failed." isShow="true"/>);
        // }
    };

    return (<>
        {(showModal) ? <ModalDialog notificationType="success" message="Subject has been created" isShow="true"
            showModals={handleShowModal} /> : (<></>)}
        {/*(showModal)?<ModalDialog notificationType="success" message="Subject has been created" isShow="true" showModals={handleShowModal}/>:(<></>);*/}

        <div className="container mx-auto my-4 px-3 py-3 border-1 border-gray-300">
            <div className="flex flex-row ...">
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
            </div>
        </div>
        <div className="container mx-auto my-10 px-4  py-4 border-1">
            <form onSubmit={handleSubjectCreate}>
                <div className="grid gap-6 mb-6 md:grid-cols-2">
                    <div>
                        <label htmlFor="subject_name"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Subject
                            name</label>
                        <input type="text" id="subject_name" name="name" onInput={handleChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Subject Name" />
                    </div>
                    <div>
                        <label htmlFor="status"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Status</label>
                        <select id="status" name="status" onInput={handleChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            <option selected>Choose a status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="description"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
                        <input type="text" id="description" name="description" onInput={handleChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="describe in 100 words" />
                    </div>
                    <div>
                        <label htmlFor="category"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category</label>
                        <select id="category" name="category" onInput={handleChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            <option selected>Choose a category</option>
                            <option value="science">Science</option>
                            <option value="technology">Technology</option>
                            <option value="geopolitics">Geopolitics</option>
                            <option value="history">History</option>
                        </select>
                    </div>
                </div>
                <button type="submit"
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 mr-2 mt-2">Submit
                </button>

                <button type="reset"
                    className="text-white bg-gray-300 hover:bg-gray-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 mr-2 mt-2">Reset
                </button>
            </form>
        </div>

    </>)
};

export default Subject;