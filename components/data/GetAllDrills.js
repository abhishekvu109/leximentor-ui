import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { API_LEXIMENTOR_BASE_URL } from "@/constants";
import { GetAllDrillTable } from "@/components/data-table/drills/GetAllDrillTable";
import {
    Plus,
    List,
    Puzzle,
    RefreshCw,
    ArrowRight,
    Trophy,
    BookOpen
} from "lucide-react";

const ActionButton = ({ onClick, icon: Icon, label, colorClass, dataModalTarget, dataModalToggle }) => (
    <button
        type="button"
        onClick={onClick}
        data-modal-target={dataModalTarget}
        data-modal-toggle={dataModalToggle}
        className={`px-5 py-2.5 rounded-2xl flex items-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 shadow-sm border ${colorClass}`}
    >
        <Icon size={16} strokeWidth={2.5} />
        {label}
    </button>
);

const GetAllDrills = ({ data }) => {
    const [isNewDrillModalOpen, setIsNewDrillModalOpen] = useState(false);
    const [drillMetadata, setDrillMetadata] = useState(data);
    const [drillData, setDrillData] = useState({
        limit: 20, isNewWords: true
    });
    const [analyticsCache, setAnalyticsCache] = useState({});

    const [isDrillCreationSuccessMsg, setIsDrillCreationSuccessMsg] = useState(false);
    const [isDrillCreationFailureMsg, setIsDrillCreationFailureMsg] = useState(false);
    const handleNewDrillModalOpen = () => {
        setIsNewDrillModalOpen(true);
    };

    const handleNewDrillModalClose = () => {
        setIsNewDrillModalOpen(false);
    };

    const handleDrillCreationSuccessMsgOpen = () => {
        setIsDrillCreationSuccessMsg(true);
    };

    const handleDrillCreationSuccessMsgClose = () => {
        setIsDrillCreationSuccessMsg(false);
    };

    const handleDrillCreationFailureMsgOpen = () => {
        setIsDrillCreationFailureMsg(true);
    };

    const handleDrillCreationFailureMsgClose = () => {
        setIsDrillCreationFailureMsg(false);
    };

    const handleChange = (e) => {
        // Update form data state when input fields change
        setDrillData({ ...drillData, [e.target.name]: e.target.value });
    };
    const submitDillCreation = async (e) => {
        e.preventDefault();
        try {
            const queryString = new URLSearchParams(drillData).toString();
            const response = await fetch(`${API_LEXIMENTOR_BASE_URL}/drill/metadata?${queryString}`, {
                method: 'POST', headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                handleDrillCreationFailureMsgOpen();
                throw new Error('Network response was not ok');
            }

            // Handle successful response
            const data = await response.json();
            console.log('Response data:', data);
            handleDrillCreationSuccessMsgOpen();
            handleNewDrillModalClose();
            await LoadTable();
        } catch (error) {
            handleDrillCreationFailureMsgOpen();
            console.error('Error:', error);
        }
    };

    const LoadTable = async () => {
        try {
            const response = await fetch(`${API_LEXIMENTOR_BASE_URL}/drill/metadata`, {
                method: 'GET', headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setDrillMetadata(data);
            console.log('Response data:', data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const GetDrillAnalytics = useCallback(async (drillRefId) => {
        if (analyticsCache[drillRefId]) return;

        try {
            const response = await fetch(`${API_LEXIMENTOR_BASE_URL}/analytics/drill/${drillRefId}`, {
                method: 'GET', headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            setAnalyticsCache(prev => ({
                ...prev, [drillRefId]: {
                    avgScore: data.data.avgDrillScore,
                    wordCount: data.data.countOfWordsLearned,
                    challengeCount: data.data.countOfChallenges
                }
            }));
        } catch (error) {
            console.error('Error:', error);
        }
    }, [analyticsCache, setAnalyticsCache]);

    useEffect(() => {
        drillMetadata.data?.forEach(item => {
            GetDrillAnalytics(item.refId);
        });
    }, [drillMetadata.data, GetDrillAnalytics]);


    const RemoveDrill = async (drillRefId) => {
        try {
            const response = await fetch(`${API_LEXIMENTOR_BASE_URL}/drill/metadata/${drillRefId}`, {
                method: 'DELETE', headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Response data:', data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const GenerateName = async (drillRefId) => {
        try {
            const response = await fetch(`${API_LEXIMENTOR_BASE_URL}/drill/metadata/assign-name/${drillRefId}`, {
                method: 'POST', headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Response data:', data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const ShowFailure = ({ isVisible }) => {
        if (isVisible) {
            return <>
                <div id="alert-2"
                    className="flex items-center p-4 mb-4 text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
                    role="alert">
                    <svg className="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor" viewBox="0 0 20 20">
                        <path
                            d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                    </svg>
                    <span className="sr-only">Info</span>
                    <div className="ms-3 text-sm font-medium">
                        Drill creation failed.
                    </div>
                    <button type="button" onClick={handleDrillCreationFailureMsgClose}
                        className="ms-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"
                        data-dismiss-target="#alert-2" aria-label="Close">
                        <span className="sr-only">Close</span>
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                    </button>
                </div>
            </>
        }
    };

    const ShowSuccess = ({ isVisible }) => {
        if (isVisible) {
            return <>
                <div id="alert-3"
                    className="flex items-center p-4 mb-4 text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400"
                    role="alert">
                    <svg className="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor" viewBox="0 0 20 20">
                        <path
                            d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                    </svg>
                    <span className="sr-only">Info</span>
                    <div className="ms-3 text-sm font-medium">
                        Drill creation is successful.
                    </div>
                    <button type="button" onClick={handleDrillCreationSuccessMsgClose}
                        className="ms-auto -mx-1.5 -my-1.5 bg-green-50 text-green-500 rounded-lg focus:ring-2 focus:ring-green-400 p-1.5 hover:bg-green-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700"
                        data-dismiss-target="#alert-3" aria-label="Close">
                        <span className="sr-only">Close</span>
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                    </button>
                </div>
            </>
        }
    };

    const NewDrillModalComponent = ({ isVisible }) => {
        if (isVisible) {
            return <>
                <div id="create-new-drill-modal-form" tabIndex="-1" aria-hidden="true" data-modal-placement="center"
                    className="overflow-y-auto overflow-x-hidden fixed inset-0 z-50 flex justify-center items-center">
                    <div className="relative p-4 w-full max-w-md max-h-full">
                        {/*Modal content*/}
                        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                            {/*Modal header*/}
                            <div
                                className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Create New Drill
                                </h3>
                                <button type="button" onClick={handleNewDrillModalClose}
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                    data-modal-toggle="create-new-drill-modal-form">
                                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 14 14">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                            strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                            </div>
                            {/*Modal body*/}
                            <form className="p-4 md:p-5" onSubmit={submitDillCreation}>
                                <div className="grid gap-4 mb-4 grid-cols-2">
                                    <div className="col-span-2 sm:col-span-1">
                                        <label htmlFor="limit"
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Count</label>
                                        <input type="number" name="limit" id="limit" onChange={handleChange}
                                            value={drillData.limit}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                            placeholder="20" required="" />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label htmlFor="isNewWords"
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Is
                                            new words</label>
                                        <select id="isNewWords" name="isNewWords" onChange={handleChange}
                                            value={drillData.isNewWords}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                                            <option selected="" value="true">True</option>
                                            <option value="false">False</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit"
                                    className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                    <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd"
                                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                            clipRule="evenodd"></path>
                                    </svg>
                                    Create new drill
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

            </>
        }
    };

    const NameTags = ({ apiText }) => {
        apiText = String(apiText || '');
        // Extract and clean keywords
        const keywords = apiText.match(/"([^"]+)"/g)?.map((str) => str.replace(/"/g, '')) || [];

        return (<div className="flex flex-wrap gap-2">
            {keywords.map((word, index) => (<span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
            >
                {word}
            </span>))}
        </div>);
    }


    return (<>

        <div className="max-w-[1400px] mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-700">
            {isDrillCreationSuccessMsg ? (<ShowSuccess isVisible={true} />) : (<ShowSuccess isVisible={false} />)}
            {isDrillCreationFailureMsg ? (<ShowFailure isVisible={true} />) : (<ShowFailure isVisible={false} />)}

            <div className="flex flex-wrap items-center gap-4 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                {/* Visual Flair background element */}
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-slate-50 rounded-full blur-3xl" />

                <ActionButton
                    onClick={handleNewDrillModalOpen}
                    icon={Plus}
                    label="New Drill"
                    colorClass="bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700 shadow-indigo-100"
                    dataModalTarget="create-new-drill-modal-form"
                    dataModalToggle="create-new-drill-modal-form"
                />

                <ActionButton
                    icon={List}
                    label="List Challenges"
                    colorClass="bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                />

                <ActionButton
                    icon={Puzzle}
                    label="Create Challenges"
                    colorClass="bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                />

                <div className="ml-auto">
                    <ActionButton
                        onClick={LoadTable}
                        icon={RefreshCw}
                        label="Load Table"
                        colorClass="bg-slate-900 text-white border-slate-950 hover:bg-slate-800"
                    />
                </div>
            </div>
            <NewDrillModalComponent isVisible={isNewDrillModalOpen} />
            <GetAllDrillTable drillMetadata={drillMetadata} />
            {/*<div className="relative overflow-x-auto shadow-md sm:rounded-lg">*/}
            {/*    <table className="w-full text-xs text-left rtl:text-right text-gray-500 dark:text-gray-400">*/}
            {/*        <caption*/}
            {/*            className="caption-bottom text-xm text-center font-bold italic p-2 text-gray-700 dark:text-gray-300">*/}
            {/*            List of all the word drills*/}
            {/*        </caption>*/}
            {/*        <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">*/}
            {/*        <tr>*/}
            {/*            <th scope="col" className="px-6 py-3 text-center">*/}
            {/*                Serial*/}
            {/*            </th>*/}
            {/*            <th scope="col" className="px-6 py-3 text-center">*/}
            {/*                ID*/}
            {/*            </th>*/}
            {/*            <th scope="col" className="px-6 py-3 text-center">*/}
            {/*                Drill Name*/}
            {/*            </th>*/}
            {/*            <th scope="col" className="px-6 py-3 text-center">*/}
            {/*                Status*/}
            {/*            </th>*/}
            {/*            <th scope="col" className="px-6 py-3 text-center">*/}
            {/*                Avg Score*/}
            {/*            </th>*/}
            {/*            <th scope="col" className="px-6 py-3 text-center">*/}
            {/*                Total words*/}
            {/*            </th>*/}
            {/*            <th scope="col" className="px-6 py-3 text-center">*/}
            {/*                Total Challenges*/}
            {/*            </th>*/}
            {/*            <th scope="col" className="px-6 py-3 text-center">*/}
            {/*                LEARN*/}
            {/*            </th>*/}
            {/*            <th scope="col" className="px-6 py-3 text-center">*/}
            {/*                CHALLENGE*/}
            {/*            </th>*/}
            {/*            <th scope="col" className="px-6 py-3 text-center">*/}
            {/*                Remove*/}
            {/*            </th>*/}
            {/*            <th scope="col" className="px-6 py-3 text-center">*/}
            {/*                Generate name*/}
            {/*            </th>*/}
            {/*        </tr>*/}
            {/*        </thead>*/}
            {/*        <tbody>*/}
            {/*        {(drillMetadata.data != null && drillMetadata.data.length > 0) ? (<>*/}
            {/*            {drillMetadata.data.map((item, index) => (<tr key={item.refId}*/}
            {/*                                                          className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">*/}
            {/*                <th scope="row"*/}
            {/*                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center">{index + 1}</th>*/}
            {/*                <td className="px-6 py-4 text-center">{item.refId}</td>*/}
            {/*                <td className="px-6 py-4 text-center">*/}
            {/*                    <Link data-popover-target={item.refId} data-popover-placement="bottom" href="#"*/}
            {/*                          className="font-medium text-blue-600 dark:text-blue-500 hover:underline">*/}
            {/*                        {(item.namedObjectDTO != null && item.namedObjectDTO.name != null && item.namedObjectDTO.name != '') ? item.namedObjectDTO.name : <>-</>}*/}
            {/*                    </Link>*/}
            {/*                    {(item.namedObjectDTO != null && item.namedObjectDTO.name != null && item.namedObjectDTO.name != '') ? <>*/}
            {/*                        <div data-popover id={item.refId} role="tooltip"*/}
            {/*                             className="absolute z-10*/}
            {/*                                 invisible inline-block*/}
            {/*                                 w-1/3 text-sm text-gray-500*/}
            {/*                                 transition-opacity duration-300*/}
            {/*                                 bg-white border border-gray-200*/}
            {/*                                 rounded-lg shadow-xs opacity-0*/}
            {/*                                 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800">*/}
            {/*                            <div*/}
            {/*                                className="px-3 py-2 bg-gray-100 border-b border-gray-200 rounded-t-lg dark:border-gray-600 dark:bg-gray-700">*/}
            {/*                                <h3 className="font-semibold text-gray-900 dark:text-white">{item.namedObjectDTO.name}</h3>*/}
            {/*                            </div>*/}
            {/*                            {item.namedObjectDTO.description != null && item.namedObjectDTO.description != '' ? <>*/}
            {/*                                <div className="px-3 py-2">*/}
            {/*                                    <h4 className="font-bold text-black/60 text-left mb-1">Description</h4>*/}
            {/*                                    <p className="text-justify">{item.namedObjectDTO.description}</p>*/}
            {/*                                </div>*/}
            {/*                                <hr className="my-2 mx-2 border-dashed"/>*/}
            {/*                            </> : <></>}*/}

            {/*                            {item.namedObjectDTO.tags != null && item.namedObjectDTO.tags != '' ? <>*/}
            {/*                                <div className="px-3 py-2">*/}
            {/*                                    <h4 className="font-bold text-black/60 text-left mb-2">Tags</h4>*/}
            {/*                                    <NameTags*/}
            {/*                                        apiText={item.namedObjectDTO.tags}/>*/}
            {/*                                </div>*/}
            {/*                                <hr className="my-2 mx-2 border-dashed"/>*/}
            {/*                            </> : <></>}*/}

            {/*                            <div className="px-3 py-2">*/}
            {/*                                <h4 className="font-bold text-black/60 text-left mb-2">Genre</h4>*/}
            {/*                                <p className="text-justify">{item.namedObjectDTO.genre}</p>*/}
            {/*                            </div>*/}
            {/*                            <hr className="my-2 mx-2 border-dashed"/>*/}
            {/*                            <div className="px-3 py-2">*/}
            {/*                                <h4 className="font-bold text-black/60 text-left mb-2">Genre</h4>*/}
            {/*                                <p className="text-justify">{item.namedObjectDTO.subGenre}</p>*/}
            {/*                            </div>*/}
            {/*                            <div data-popper-arrow></div>*/}
            {/*                        </div>*/}
            {/*                    </> : <>-</>}*/}

            {/*                </td>*/}
            {/*                <td className="px-6 py-4 text-center">{item.status}</td>*/}
            {/*                <td className="px-6 py-4 text-center">{analyticsCache[item.refId]?.avgScore ?? '...'}</td>*/}
            {/*                <td className="px-6 py-4 text-center">*/}
            {/*                    {analyticsCache[item.refId]?.wordCount ?? '...'}*/}
            {/*                </td>*/}
            {/*                <td className="px-6 py-4 text-center">*/}
            {/*                    {analyticsCache[item.refId]?.challengeCount ?? '-'}*/}
            {/*                </td>*/}
            {/*                <td className="px-6 py-4 text-center">*/}
            {/*                    <Link href={"/drills/learning/practice/" + item.refId}*/}
            {/*                          className="font-medium text-blue-600 dark:text-blue-500 hover:underline">*/}
            {/*                        Click*/}
            {/*                    </Link>*/}
            {/*                </td>*/}
            {/*                <td className="px-6 py-4 text-center">*/}
            {/*                    <Link href={"/challenges/" + item.refId}*/}
            {/*                          className="font-medium text-blue-600 dark:text-blue-500 hover:underline">*/}
            {/*                        Click*/}
            {/*                    </Link>*/}
            {/*                </td>*/}
            {/*                <td className="px-6 py-4 text-center">*/}
            {/*                    <Link href="#" onClick={() => RemoveDrill(item.refId)}*/}
            {/*                          className="font-medium text-blue-600 dark:text-blue-500 hover:underline">*/}
            {/*                        Click*/}
            {/*                    </Link>*/}
            {/*                </td>*/}
            {/*                <td className="px-6 py-4 text-center">*/}
            {/*                    <Link href="#" onClick={() => GenerateName(item.refId)}*/}
            {/*                          className="font-medium text-blue-600 dark:text-blue-500 hover:underline">*/}
            {/*                        Click*/}
            {/*                    </Link>*/}
            {/*                </td>*/}
            {/*            </tr>))}*/}
            {/*        </>) : (<>*/}
            {/*            <tr>*/}
            {/*                <td className="px-6 py-4 text-center">No drills found</td>*/}
            {/*            </tr>*/}
            {/*        </>)}*/}

            {/*        </tbody>*/}
            {/*    </table>*/}
            {/*</div>*/}
        </div>


    </>);
};

export default GetAllDrills;

