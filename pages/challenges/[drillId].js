// pages/[id].js

import React, {useCallback, useEffect, useState} from "react";
import Link from "next/link";
import {API_LEXIMENTOR_BASE_URL} from "@/constants";
import {deleteData, fetchData, postData} from "@/dataService";
import DashboardCard from "@/components/widgets/DashboardCard";

const Challenges = ({data, drillId}) => {
    console.log(data);
    const [challengeData, setChallengeData] = useState(data);
    const [drillRefId, setDrillRefId] = useState(drillId);
    const [isEvaluatorVisible, setIsEvaluatorVisible] = useState(false);
    const [challengeEvaluators, setChallengeEvaluators] = useState(null);
    const [challengeRequestData, setChallengeRequestData] = useState({drillId: drillId, drillType: ''});
    const [evaluationData, setEvaluationData] = useState({challengeId: "", evaluator: ""});
    const handleChange = (e) => {
        // Update form data state when input fields change
        setEvaluationData({...evaluationData, [e.target.name]: e.target.value});
    };
    const handleEvaluatorModel = async (isOpen, challengeId) => {
        setIsEvaluatorVisible(isOpen);
        const URL = `${API_LEXIMENTOR_BASE_URL}/drill/metadata/challenges/challenge/evaluators?challengeRefId=${challengeId}`;
        const challengeEvalData = await fetchData(URL);
        console.log(challengeEvalData);
        setChallengeEvaluators(challengeEvalData);
        setEvaluationData({challengeId: `${challengeId}`, evaluator: ''});
    };

    const getDrillTypeLink = (drillType) => {
        if (drillType == 'LEARN_MEANING') return '/drills/challenges/meaning/'; else if (drillType == 'LEARN_POS') return '/drills/challenges/pos/'; else if (drillType == 'IDENTIFY_WORD') return '/drills/challenges/identify_word/'; else if (drillType == 'GUESS_WORD') return '/drills/challenges/guess_word/'; else return '/drills/challenges/meaning/';
    };

    const handleChallengeRequestData = async (drillName) => {
        setChallengeRequestData((prevState) => {
            return {...prevState, drillType: drillName};
        });
    };

    useEffect(() => {
        // This code block will execute after the state has been updated
        if (challengeRequestData.drillType != null && challengeRequestData.drillType.length > 0) {
            createChallenge();
        }
    }, [challengeRequestData]); // Add challengeRequestData as a dependency


    // const createChallenge = async () => {
    //     const queryString = new URLSearchParams(challengeRequestData).toString();
    //     const URL = `${API_LEXIMENTOR_BASE_URL}/drill/metadata/challenges/challenge?${queryString}`;
    //     const saveChallengeSavedData = await postData(URL);
    //     await LoadTable();
    // };
    const createChallenge = useCallback(async () => {
        const queryString = new URLSearchParams(challengeRequestData).toString();
        const URL = `${API_LEXIMENTOR_BASE_URL}/drill/metadata/challenges/challenge?${queryString}`;
        const saveChallengeSavedData = await postData(URL);
        await LoadTable();
    }, [challengeRequestData, LoadTable]); // include dependencies here

    const deleteChallenge = async (drillRefId) => {
        const URL = `${API_LEXIMENTOR_BASE_URL}/drill/metadata/challenges/${drillRefId}`;
        const saveChallengeSavedData = await deleteData(URL);
        await LoadTable();
    };

    const Evaluate = async (e) => {
        e.preventDefault();
        const queryString = new URLSearchParams(evaluationData).toString();
        const URL = `${API_LEXIMENTOR_BASE_URL}/drill/metadata/challenges/challenge/${evaluationData.challengeId}/evaluate?${queryString}`;
        const evaluateFormData = await postData(URL);
        await handleEvaluatorModel(false, '');
    };

    const LoadTable = async () => {
        const URL = `${API_LEXIMENTOR_BASE_URL}/drill/metadata/challenges/${drillRefId}`;
        const challengeDataFromDb = await fetchData(URL)
        setChallengeData(challengeDataFromDb);
    };

    const EvaluatorSelectorModalComponent = ({isVisible}) => {
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
                                <button type="button" onClick={() => handleEvaluatorModel(false, '')}
                                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                        data-modal-toggle="create-new-drill-modal-form">
                                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                         fill="none"
                                         viewBox="0 0 14 14">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                              strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                            </div>
                            {/*Modal body*/}
                            <form className="p-4 md:p-5" onSubmit={Evaluate}>
                                <div className="grid gap-4 mb-4 grid-cols-1">
                                    <div className="col-span-2 sm:col-span-1">
                                        <label htmlFor="limit"
                                               className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Challenge
                                            ID</label>
                                        <input type="text" name="challengeId" id="challengeId" disabled={true}
                                               value={evaluationData.challengeId} onChange={handleChange}
                                               className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                               placeholder="" required=""/>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label htmlFor="evaluator"
                                               className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            Evaluator
                                        </label>
                                        {(challengeEvaluators && challengeEvaluators.data && challengeEvaluators.data.length > 0) ? (
                                            <select id="evaluator" name="evaluator" value={evaluationData.evaluator}
                                                    onChange={handleChange}
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                    required>
                                                <option value="">Select Evaluator</option>
                                                {challengeEvaluators.data.map((item, index) => (
                                                    <option key={index} value={item.name}>
                                                        {item.name}
                                                    </option>))}
                                            </select>) : (
                                            <p className="text-sm text-gray-500">No evaluators available.</p>)}
                                    </div>
                                </div>
                                <button type="submit"
                                        className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                    <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd"
                                              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                              clipRule="evenodd"></path>
                                    </svg>
                                    Evaluate
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

            </>
        }
    };


    return (<>
        <div className="container mt-5">
            <DashboardCard title="REVENUE"
                           amount="$12,500"
                           percentageChange="+24%"
                           changeText="since last week"
                           icon="M9 5v14m8-7h-2m0 0h-2m2 0v2m0-2v-2M3 11h6m-6 4h6m11 4H4c-.55228 0-1-.4477-1-1V6c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v12c0 .5523-.4477 1-1 1Z"
                           variant="green"/>
        </div>
        <div className="container mt-5">
            <div className="container mt-2 text-center border border-1 border-gray-200 w-11/12">
               <span
                   className="bg-blue-100 mt-2 text-blue-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded-sm dark:bg-gray-700 dark:text-blue-400 border border-blue-400">
                <svg className="w-2.5 h-2.5 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                     fill="currentColor"
                     viewBox="0 0 20 20">
                <path
                    d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm3.982 13.982a1 1 0 0 1-1.414 0l-3.274-3.274A1.012 1.012 0 0 1 9 10V6a1 1 0 0 1 2 0v3.586l2.982 2.982a1 1 0 0 1 0 1.414Z"/>
                </svg>
                Add new challenge
                </span>
                <div className="container mt-2 text-center">
                    <div className="inline-flex space-x-2 rounded-lg shadow-lg bg-gray-100 dark:bg-gray-800 p-1"
                         role="group">
                        {/* Dashboard Button */}
                        <Link href="/dashboard/dashboard">
                            <button
                                type="button"
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-900  border border-gray-900 rounded-lg hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 dark:border-white dark:text-white dark:hover:bg-black dark:focus:bg-black transition-all ease-in-out duration-300"
                            >
                                <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        d="M3 3h14a2 2 0 0 1 2 2v2H1V5a2 2 0 0 1 2-2Zm16 5v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8h18Zm-7 2H8v2h4v-2Z"/>
                                </svg>
                                Dashboard
                            </button>
                        </Link>

                        {/* Meaning Button */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                handleChallengeRequestData('MEANING');
                            }}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-900  border border-gray-900 rounded-lg hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 dark:border-white dark:text-white dark:hover:bg-black dark:focus:bg-black transition-all ease-in-out duration-300"
                        >
                            <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    d="M10 3a7 7 0 0 1 7 7c0 2.9-3 6.6-5.3 8.7a1 1 0 0 1-1.4 0C6.9 16.6 4 12.9 4 10a6 6 0 0 1 6-7Z"/>
                            </svg>
                            Meaning
                        </button>

                        {/* Identify POS Button */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                handleChallengeRequestData('POS');
                            }}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-900  border border-gray-900 rounded-lg hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 dark:border-white dark:text-white dark:hover:bg-black dark:focus:bg-black transition-all ease-in-out duration-300"
                        >
                            <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M5 4h10v2H5V4Zm0 4h10v2H5V8Zm0 4h6v2H5v-2Z"/>
                            </svg>
                            Identify POS
                        </button>

                        {/* Spell Jumble Button */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                handleChallengeRequestData('SPELL');
                            }}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-900 bg-transparent border border-gray-900 rounded-lg hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 dark:border-white dark:text-white dark:hover:bg-black dark:focus:bg-black transition-all ease-in-out duration-300"
                        >
                            <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="currentColor" width="20"
                                 height="20">
                                <path
                                    d="M12 18c-2.21 0-4-1.79-4-4h2a2 2 0 1 0 4 0 2 2 0 0 0-4 0H6a6 6 0 1 1 12 0c0 3.31-2.69 6-6 6Z"/>
                            </svg>
                            Spell Jumble
                        </button>

                        {/* Spell it from Pronunciation Button */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                handleChallengeRequestData('IDENTIFY');
                            }}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-900  border border-gray-900 rounded-lg hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 dark:border-white dark:text-white dark:hover:bg-black dark:focus:bg-black transition-all ease-in-out duration-300"
                        >
                            <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path
                                    d="M12 2a10 10 0 0 1 0 20v-2a8 8 0 1 0-8-8H2A10 10 0 0 1 12 2Zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/>
                            </svg>
                            Spell it from pronunciation
                        </button>

                        {/* Guess Word from Meaning Button */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                handleChallengeRequestData('GUESS');
                            }}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-900  border border-gray-900 rounded-lg hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 dark:border-white dark:text-white dark:hover:bg-black dark:focus:bg-black transition-all ease-in-out duration-300"
                        >
                            <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path
                                    d="M10 2a8 8 0 0 1 8 8c0 2.2-1.1 4.2-2.9 5.3L15 18H9v-2h4.1c.9-.7 1.4-1.8 1.4-3a6 6 0 1 0-6 6v2a8 8 0 0 1 2-15.9Z"/>
                            </svg>
                            Guess word from meaning
                        </button>

                        {/* Match the Right Word Button */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                handleChallengeRequestData('MATCH');
                            }}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-900  border border-gray-900 rounded-lg hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 dark:border-white dark:text-white dark:hover:bg-black dark:focus:bg-black transition-all ease-in-out duration-300"
                        >
                            <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h12v2H3v-2Z"/>
                            </svg>
                            Match the right word
                        </button>

                        {/* Reload Button */}
                        <button
                            onClick={LoadTable}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-900  border border-gray-900 rounded-lg hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 dark:border-white dark:text-white dark:hover:bg-black dark:focus:bg-black transition-all ease-in-out duration-300"
                        >
                            <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path
                                    d="M17 1H7a2 2 0 0 0-2 2v3h2V4h10v16H7v-2H5v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2ZM9 12l-4 4 4 4v-3h6v-2H9v-3Z"/>
                            </svg>
                            Reload
                        </button>
                    </div>
                </div>
            </div>
            <div className="container mt-2 text-center">
                <EvaluatorSelectorModalComponent isVisible={isEvaluatorVisible}/>
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-7">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead
                            className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-center">
                                Serial
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                                Challenge ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                                Drill Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                                Drill Score
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                                Passed
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                                Correct
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                                Incorrect
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                                Evaluation status
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                                Delete
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                                Try
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                                Evaluate
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                                Report
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {challengeData.data != null && challengeData.data.length > 0 ? (challengeData.data.map((item, index) => (
                            <tr key={item.refId}>
                                <td scope="row"
                                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center">{index + 1}</td>
                                <td className="px-6 py-4 text-center text-xs">{item.refId}</td>
                                <td className="px-6 py-4 text-center text-xs font-sans text-blue-700 text-decoration-underline">{item.drillType}</td>
                                <td className="px-6 py-4 text-center"><span
                                    className="inline-flex items-center justify-center w-7 h-7 ms-2 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full">
                                            {item.drillScore}
                                            </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <label>{(item.evaluationStatus != 'Evaluated') ? (<>NA</>) : (<>{item.drillScore > 70 ? (<>
                                            <span
                                                className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-green-400 border border-green-400">Passed</span>
                                    </>) : (<><span
                                        className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-red-400 border border-red-400">Failed</span></>)}</>)}</label>
                                </td>
                                <td className="px-6 py-4 text-center">{item.totalCorrect}</td>
                                <td className="px-6 py-4 text-center">{item.totalWrong}</td>
                                <td className="px-6 py-4 text-center text-xs">{item.status}</td>
                                <td className="px-6 py-4 text-center text-xs">{item.evaluationStatus}</td>
                                <td className="px-6 py-4 text-center">
                                    <Link className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                          onClick={() => deleteChallenge(item.refId)}
                                          href="#">Delete</Link>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {(item.status != 'Completed') ? (<Link
                                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                        href={(getDrillTypeLink(item.drillType)) + drillRefId + "/" + item.refId}>
                                        Try
                                    </Link>) : (<Link
                                        className="font-medium text-gray-300 dark:text-blue-500 hover:underline"
                                        href="#">
                                        Try
                                    </Link>)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {(item.status == 'Not Initiated') ? (<Link
                                        className="font-medium text-gray-300 dark:text-blue-500 hover:underline"
                                        href="#">
                                        Evaluate
                                    </Link>) : item.evaluationStatus === 'Evaluated' ? (<Link
                                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                        onClick={() => handleEvaluatorModel(true, item.refId)}
                                        href="#"
                                    >
                                        Retry
                                    </Link>) : (<Link
                                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                        onClick={() => handleEvaluatorModel(true, item.refId)}
                                        href="#"
                                    >
                                        Evaluate
                                    </Link>)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {(item.evaluationStatus != 'Evaluated') ? (<Link
                                        className="font-medium text-gray-300 dark:text-blue-500 hover:underline"
                                        href="#">
                                        Click
                                    </Link>) : (<Link
                                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                        href={"/evaluation_report/meaning_report/" + item.refId}>
                                        Click
                                    </Link>)}
                                </td>
                            </tr>))) : (<tr>
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
                        </tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>


        {/*<h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 mb-6 text-center hover:shadow-xl transition-shadow duration-300 ease-in-out">*/}
        {/*    List of challenges for the drill*/}
        {/*</h2>*/}
        {/*<div className="container mt-5 text-center">*/}
        {/*    <div className="inline-flex rounded-md shadow-xs" role="group">*/}
        {/*        <Link href="/dashboard/dashboard">*/}
        {/*            <button*/}
        {/*                type="button"*/}
        {/*                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900  border-t border-b border-l border-r border-gray-900 rounded-s-lg hover:bg-black hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 dark:border-white dark:text-white dark:hover:bg-black dark:focus:bg-black"*/}
        {/*            >*/}
        {/*                <svg className="w-4 h-4 me-2" fill="currentColor" viewBox="0 0 20 20">*/}
        {/*                    <path*/}
        {/*                        d="M3 3h14a2 2 0 0 1 2 2v2H1V5a2 2 0 0 1 2-2Zm16 5v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8h18Zm-7 2H8v2h4v-2Z"/>*/}
        {/*                </svg>*/}
        {/*                Dashboard*/}
        {/*            </button>*/}
        {/*        </Link>*/}

        {/*        <button*/}
        {/*            onClick={(e) => {*/}
        {/*                e.preventDefault();*/}
        {/*                handleChallengeRequestData('MEANING');*/}
        {/*            }}*/}
        {/*            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900  border-t border-b border-r border-gray-900 hover:bg-black hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 dark:border-white dark:text-white dark:hover:bg-black dark:focus:bg-black"*/}
        {/*        >*/}
        {/*            <svg className="w-4 h-4 me-2" fill="currentColor" viewBox="0 0 20 20">*/}
        {/*                <path*/}
        {/*                    d="M10 3a7 7 0 0 1 7 7c0 2.9-3 6.6-5.3 8.7a1 1 0 0 1-1.4 0C6.9 16.6 4 12.9 4 10a6 6 0 0 1 6-7Z"/>*/}
        {/*            </svg>*/}
        {/*            Meaning*/}
        {/*        </button>*/}

        {/*        <button*/}
        {/*            onClick={(e) => {*/}
        {/*                e.preventDefault();*/}
        {/*                handleChallengeRequestData('POS');*/}
        {/*            }}*/}
        {/*            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900  border-t border-b border-r border-gray-900 hover:bg-black hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 dark:border-white dark:text-white dark:hover:bg-black dark:focus:bg-black"*/}
        {/*        >*/}
        {/*            <svg className="w-4 h-4 me-2" fill="currentColor" viewBox="0 0 20 20">*/}
        {/*                <path d="M5 4h10v2H5V4Zm0 4h10v2H5V8Zm0 4h6v2H5v-2Z"/>*/}
        {/*            </svg>*/}
        {/*            Identify POS*/}
        {/*        </button>*/}

        {/*        <button*/}
        {/*            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900  border-t border-b border-r border-gray-900 hover:bg-black hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 dark:border-white dark:text-white dark:hover:bg-black dark:focus:bg-black"*/}
        {/*        >*/}
        {/*            <svg className="w-4 h-4 me-2" fill="currentColor" viewBox="0 0 24 24">*/}
        {/*                <path*/}
        {/*                    d="M12 18c-2.21 0-4-1.79-4-4h2a2 2 0 1 0 4 0 2 2 0 0 0-4 0H6a6 6 0 1 1 12 0c0 3.31-2.69 6-6 6Z"/>*/}
        {/*            </svg>*/}
        {/*            Spell Jumble*/}
        {/*        </button>*/}

        {/*        <button*/}
        {/*            onClick={(e) => {*/}
        {/*                e.preventDefault();*/}
        {/*                handleChallengeRequestData('IDENTIFY');*/}
        {/*            }}*/}
        {/*            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900  border-t border-b border-r border-gray-900 hover:bg-black hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 dark:border-white dark:text-white dark:hover:bg-black dark:focus:bg-black"*/}
        {/*        >*/}
        {/*            <svg className="w-4 h-4 me-2" fill="currentColor" viewBox="0 0 24 24">*/}
        {/*                <path*/}
        {/*                    d="M12 2a10 10 0 0 1 0 20v-2a8 8 0 1 0-8-8H2A10 10 0 0 1 12 2Zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/>*/}
        {/*            </svg>*/}
        {/*            Spell it from pronunciation*/}
        {/*        </button>*/}

        {/*        <button*/}
        {/*            onClick={(e) => {*/}
        {/*                e.preventDefault();*/}
        {/*                handleChallengeRequestData('GUESS');*/}
        {/*            }}*/}
        {/*            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 border-t border-b border-r border-gray-900 hover:bg-black hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 dark:border-white dark:text-white dark:hover:bg-black dark:focus:bg-black"*/}
        {/*        >*/}
        {/*            <svg className="w-4 h-4 me-2" fill="currentColor" viewBox="0 0 24 24">*/}
        {/*                <path*/}
        {/*                    d="M10 2a8 8 0 0 1 8 8c0 2.2-1.1 4.2-2.9 5.3L15 18H9v-2h4.1c.9-.7 1.4-1.8 1.4-3a6 6 0 1 0-6 6v2a8 8 0 0 1 2-15.9Z"/>*/}
        {/*            </svg>*/}
        {/*            Guess word from meaning*/}
        {/*        </button>*/}

        {/*        <button*/}
        {/*            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900  border-t border-b border-r border-gray-900 hover:bg-black hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 dark:border-white dark:text-white dark:hover:bg-black dark:focus:bg-black"*/}
        {/*        >*/}
        {/*            <svg className="w-4 h-4 me-2" fill="currentColor" viewBox="0 0 24 24">*/}
        {/*                <path d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h12v2H3v-2Z"/>*/}
        {/*            </svg>*/}
        {/*            Match the right word*/}
        {/*        </button>*/}

        {/*        <button*/}
        {/*            onClick={LoadTable}*/}
        {/*            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 border-t border-b  border-r border-gray-900 rounded-e-lg hover:bg-black hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 dark:border-white dark:text-white dark:hover:bg-black dark:focus:bg-black"*/}
        {/*        >*/}
        {/*            <svg className="w-4 h-4 me-2" fill="currentColor" viewBox="0 0 24 24">*/}
        {/*                <path*/}
        {/*                    d="M17 1H7a2 2 0 0 0-2 2v3h2V4h10v16H7v-2H5v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2ZM9 12l-4 4 4 4v-3h6v-2H9v-3Z"/>*/}
        {/*            </svg>*/}
        {/*            Reload*/}
        {/*        </button>*/}
        {/*    </div>*/}
        {/*    <EvaluatorSelectorModalComponent isVisible={isEvaluatorVisible}/>*/}
        {/*    <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-2">*/}
        {/*        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">*/}
        {/*            <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">*/}
        {/*            <tr>*/}
        {/*                <th scope="col" className="px-6 py-3 text-center">*/}
        {/*                    Serial*/}
        {/*                </th>*/}
        {/*                <th scope="col" className="px-6 py-3 text-center">*/}
        {/*                    Challenge ID*/}
        {/*                </th>*/}
        {/*                <th scope="col" className="px-6 py-3 text-center">*/}
        {/*                    Drill Type*/}
        {/*                </th>*/}
        {/*                <th scope="col" className="px-6 py-3 text-center">*/}
        {/*                    Drill Score*/}
        {/*                </th>*/}
        {/*                <th scope="col" className="px-6 py-3 text-center">*/}
        {/*                    Passed*/}
        {/*                </th>*/}
        {/*                <th scope="col" className="px-6 py-3 text-center">*/}
        {/*                    Correct*/}
        {/*                </th>*/}
        {/*                <th scope="col" className="px-6 py-3 text-center">*/}
        {/*                    Incorrect*/}
        {/*                </th>*/}
        {/*                <th scope="col" className="px-6 py-3 text-center">*/}
        {/*                    Status*/}
        {/*                </th>*/}
        {/*                <th scope="col" className="px-6 py-3 text-center">*/}
        {/*                    Evaluation status*/}
        {/*                </th>*/}
        {/*                <th scope="col" className="px-6 py-3 text-center">*/}
        {/*                    Delete*/}
        {/*                </th>*/}
        {/*                <th scope="col" className="px-6 py-3 text-center">*/}
        {/*                    Try*/}
        {/*                </th>*/}
        {/*                <th scope="col" className="px-6 py-3 text-center">*/}
        {/*                    Evaluate*/}
        {/*                </th>*/}
        {/*                <th scope="col" className="px-6 py-3 text-center">*/}
        {/*                    Report*/}
        {/*                </th>*/}
        {/*            </tr>*/}
        {/*            </thead>*/}
        {/*            <tbody>*/}
        {/*            {challengeData.data != null && challengeData.data.length > 0 ? (challengeData.data.map((item, index) => (*/}
        {/*                <tr key={item.refId}>*/}
        {/*                    <td scope="row"*/}
        {/*                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center">{index + 1}</td>*/}
        {/*                    <td className="px-6 py-4 text-center text-xs">{item.refId}</td>*/}
        {/*                    <td className="px-6 py-4 text-center text-xs font-sans text-blue-700 text-decoration-underline">{item.drillType}</td>*/}
        {/*                    <td className="px-6 py-4 text-center"><span*/}
        {/*                        className="inline-flex items-center justify-center w-7 h-7 ms-2 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full">*/}
        {/*                            {item.drillScore}*/}
        {/*                            </span>*/}
        {/*                    </td>*/}
        {/*                    <td className="px-6 py-4 text-center">*/}
        {/*                        <label>{(item.evaluationStatus != 'Evaluated') ? (<>NA</>) : (<>{item.drillScore > 70 ? (<>*/}
        {/*                            <span*/}
        {/*                                className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-green-400 border border-green-400">Passed</span>*/}
        {/*                        </>) : (<><span*/}
        {/*                            className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-red-400 border border-red-400">Failed</span></>)}</>)}</label>*/}
        {/*                    </td>*/}
        {/*                    <td className="px-6 py-4 text-center">{item.totalCorrect}</td>*/}
        {/*                    <td className="px-6 py-4 text-center">{item.totalWrong}</td>*/}
        {/*                    <td className="px-6 py-4 text-center text-xs">{item.status}</td>*/}
        {/*                    <td className="px-6 py-4 text-center text-xs">{item.evaluationStatus}</td>*/}
        {/*                    <td className="px-6 py-4 text-center">*/}
        {/*                        <Link className="font-medium text-blue-600 dark:text-blue-500 hover:underline"*/}
        {/*                              onClick={() => deleteChallenge(item.refId)}*/}
        {/*                              href="#">Delete</Link>*/}
        {/*                    </td>*/}
        {/*                    <td className="px-6 py-4 text-center">*/}
        {/*                        {(item.status != 'Completed') ? (<Link*/}
        {/*                            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"*/}
        {/*                            href={(getDrillTypeLink(item.drillType)) + drillRefId + "/" + item.refId}>*/}
        {/*                            Try*/}
        {/*                        </Link>) : (<Link*/}
        {/*                            className="font-medium text-gray-300 dark:text-blue-500 hover:underline" href="#">*/}
        {/*                            Try*/}
        {/*                        </Link>)}*/}
        {/*                    </td>*/}
        {/*                    <td className="px-6 py-4 text-center">*/}
        {/*                        {(item.status == 'Not Initiated') ? (<Link*/}
        {/*                            className="font-medium text-gray-300 dark:text-blue-500 hover:underline"*/}
        {/*                            href="#">*/}
        {/*                            Evaluate*/}
        {/*                        </Link>) : item.evaluationStatus === 'Evaluated' ? (<Link*/}
        {/*                            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"*/}
        {/*                            onClick={() => handleEvaluatorModel(true, item.refId)}*/}
        {/*                            href="#"*/}
        {/*                        >*/}
        {/*                            Retry*/}
        {/*                        </Link>) : (<Link*/}
        {/*                            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"*/}
        {/*                            onClick={() => handleEvaluatorModel(true, item.refId)}*/}
        {/*                            href="#"*/}
        {/*                        >*/}
        {/*                            Evaluate*/}
        {/*                        </Link>)}*/}
        {/*                    </td>*/}
        {/*                    <td className="px-6 py-4 text-center">*/}
        {/*                        {(item.evaluationStatus != 'Evaluated') ? (<Link*/}
        {/*                            className="font-medium text-gray-300 dark:text-blue-500 hover:underline"*/}
        {/*                            href="#">*/}
        {/*                            Click*/}
        {/*                        </Link>) : (<Link*/}
        {/*                            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"*/}
        {/*                            href={"/evaluation_report/meaning_report/" + item.refId}>*/}
        {/*                            Click*/}
        {/*                        </Link>)}*/}
        {/*                    </td>*/}
        {/*                </tr>))) : (<tr>*/}
        {/*                <td scope="col" className="px-6 py-4 text-center">*/}
        {/*                </td>*/}
        {/*                <td scope="col" className="px-6 py-4 text-center">*/}
        {/*                </td>*/}
        {/*                <td scope="col" className="px-6 py-4 text-center">*/}
        {/*                </td>*/}
        {/*                <td scope="col" className="px-6 py-4 text-center">*/}
        {/*                </td>*/}
        {/*                <td scope="col" className="px-6 py-4 text-center">*/}
        {/*                </td>*/}
        {/*                <td scope="col" className="px-6 py-4 text-center">*/}
        {/*                    <h6 className="text-lg font-bold dark:text-white">No data found</h6>*/}
        {/*                </td>*/}
        {/*                <td scope="col" className="px-6 py-4 text-center">*/}
        {/*                </td>*/}
        {/*                <td scope="col" className="px-6 py-4 text-center">*/}
        {/*                </td>*/}
        {/*                <td scope="col" className="px-6 py-4 text-center">*/}
        {/*                </td>*/}
        {/*                <td scope="col" className="px-6 py-4 text-center">*/}
        {/*                </td>*/}
        {/*            </tr>)}*/}
        {/*            </tbody>*/}
        {/*        </table>*/}
        {/*    </div>*/}
        {/*</div>*/}
        {/*<div className="container mt-5">*/}
        {/*    <Link href="/dashboard/dashboard">*/}
        {/*        <button type="button" data-modal-target="create-new-drill-modal-form"*/}
        {/*                data-model-toggle="create-new-drill-modal-form"*/}
        {/*                className="px-2 py-1.5 m-2 text-base text-sm font-medium text-white inline-flex items-center bg-cyan-400 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">*/}
        {/*            <svg className="w-4 h-4 text-white me-2" aria-hidden="true"*/}
        {/*                 xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24">*/}
        {/*                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"*/}
        {/*                      d="M12 7.757v8.486M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>*/}
        {/*            </svg>*/}
        {/*            Dashboard*/}
        {/*        </button>*/}
        {/*    </Link>*/}
        {/*    <button type="button" data-modal-target="create-new-drill-modal-form"*/}
        {/*            onClick={(e) => {*/}
        {/*                e.preventDefault();*/}
        {/*                handleChallengeRequestData('MEANING')*/}
        {/*            }}*/}
        {/*            data-model-toggle="create-new-drill-modal-form"*/}
        {/*            className="px-6 py-3.5 m-2 text-base font-medium text-white inline-flex items-center bg-violet-400 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">*/}
        {/*        <svg className="w-4 h-4 text-white me-2" aria-hidden="true"*/}
        {/*             xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">*/}
        {/*            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"*/}
        {/*                  d="M12 7.757v8.486M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>*/}
        {/*        </svg>*/}
        {/*        Meaning*/}
        {/*    </button>*/}
        {/*    <button type="button" onClick={(e) => {*/}
        {/*        e.preventDefault();*/}
        {/*        handleChallengeRequestData('POS')*/}
        {/*    }}*/}
        {/*            className="px-6 py-3.5 m-2 text-base font-medium text-white inline-flex items-center bg-red-400 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">*/}
        {/*        <svg className="w-4 h-4 text-white me-2" aria-hidden="true"*/}
        {/*             xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">*/}
        {/*            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"*/}
        {/*                  d="M12 7.757v8.486M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>*/}
        {/*        </svg>*/}
        {/*        Identify POS*/}
        {/*    </button>*/}
        {/*    <button type="button"*/}
        {/*            className="px-6 py-3.5 m-2 text-base font-medium text-white inline-flex items-center bg-green-400 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">*/}
        {/*        <svg className="w-4 h-4 text-white me-2" aria-hidden="true"*/}
        {/*             xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">*/}
        {/*            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"*/}
        {/*                  d="M12 7.757v8.486M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>*/}
        {/*        </svg>*/}
        {/*        Spell Jumble*/}
        {/*    </button>*/}

        {/*    <button type="button" onClick={(e) => {*/}
        {/*        e.preventDefault();*/}
        {/*        handleChallengeRequestData('IDENTIFY')*/}
        {/*    }}*/}
        {/*            className="px-6 py-3.5 m-2 text-base font-medium text-white inline-flex items-center bg-yellow-400 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">*/}
        {/*        <svg className="w-4 h-4 text-white me-2" aria-hidden="true"*/}
        {/*             xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">*/}
        {/*            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"*/}
        {/*                  d="M12 7.757v8.486M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>*/}
        {/*        </svg>*/}
        {/*        Spell it from pronunciation.*/}
        {/*    </button>*/}

        {/*    <button type="button" onClick={(e) => {*/}
        {/*        e.preventDefault();*/}
        {/*        handleChallengeRequestData('GUESS')*/}
        {/*    }}*/}
        {/*            className="px-6 py-3.5 m-2 text-base font-medium text-white inline-flex items-center bg-orange-400 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">*/}
        {/*        <svg className="w-4 h-4 text-white me-2" aria-hidden="true"*/}
        {/*             xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">*/}
        {/*            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"*/}
        {/*                  d="M12 7.757v8.486M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>*/}
        {/*        </svg>*/}
        {/*        Guess word from meaning*/}
        {/*    </button>*/}

        {/*    <button type="button"*/}
        {/*            className="px-6 py-3.5 m-2 text-base font-medium text-white inline-flex items-center bg-sky-400 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">*/}
        {/*        <svg className="w-4 h-4 text-white me-2" aria-hidden="true"*/}
        {/*             xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">*/}
        {/*            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"*/}
        {/*                  d="M12 7.757v8.486M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>*/}
        {/*        </svg>*/}
        {/*        Match the right word*/}
        {/*    </button>*/}

        {/*    <button type="button" onClick={LoadTable}*/}
        {/*            className="px-6 py-3.5 m-2 text-base font-medium text-white inline-flex items-center bg-amber-400 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">*/}
        {/*        <svg className="w-4 h-4 text-white me-2" aria-hidden="true"*/}
        {/*             xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">*/}
        {/*            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"*/}
        {/*                  d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4"/>*/}
        {/*        </svg>*/}
        {/*        Reload*/}
        {/*    </button>*/}
        {/*    <EvaluatorSelectorModalComponent isVisible={isEvaluatorVisible}/>*/}
        {/*    <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-2">*/}
        {/*        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">*/}
        {/*            <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">*/}
        {/*            <tr>*/}
        {/*                <th scope="col" className="px-6 py-3 text-center">*/}
        {/*                    Serial*/}
        {/*                </th>*/}
        {/*                <th scope="col" className="px-6 py-3 text-center">*/}
        {/*                    Challenge ID*/}
        {/*                </th>*/}
        {/*                <th scope="col" className="px-6 py-3 text-center">*/}
        {/*                    Drill Type*/}
        {/*                </th>*/}
        {/*                <th scope="col" className="px-6 py-3 text-center">*/}
        {/*                    Drill Score*/}
        {/*                </th>*/}
        {/*                <th scope="col" className="px-6 py-3 text-center">*/}
        {/*                    Passed*/}
        {/*                </th>*/}
        {/*                <th scope="col" className="px-6 py-3 text-center">*/}
        {/*                    Correct*/}
        {/*                </th>*/}
        {/*                <th scope="col" className="px-6 py-3 text-center">*/}
        {/*                    Incorrect*/}
        {/*                </th>*/}
        {/*                <th scope="col" className="px-6 py-3 text-center">*/}
        {/*                    Status*/}
        {/*                </th>*/}
        {/*                <th scope="col" className="px-6 py-3 text-center">*/}
        {/*                    Evaluation status*/}
        {/*                </th>*/}
        {/*                <th scope="col" className="px-6 py-3 text-center">*/}
        {/*                    Delete*/}
        {/*                </th>*/}
        {/*                <th scope="col" className="px-6 py-3 text-center">*/}
        {/*                    Try*/}
        {/*                </th>*/}
        {/*                <th scope="col" className="px-6 py-3 text-center">*/}
        {/*                    Evaluate*/}
        {/*                </th>*/}
        {/*                <th scope="col" className="px-6 py-3 text-center">*/}
        {/*                    Report*/}
        {/*                </th>*/}
        {/*            </tr>*/}
        {/*            </thead>*/}
        {/*            <tbody>*/}
        {/*            {challengeData.data != null && challengeData.data.length > 0 ? (challengeData.data.map((item, index) => (*/}
        {/*                <tr key={item.refId}>*/}
        {/*                    <td scope="row"*/}
        {/*                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center">{index + 1}</td>*/}
        {/*                    <td className="px-6 py-4 text-center text-xs">{item.refId}</td>*/}
        {/*                    <td className="px-6 py-4 text-center text-xs font-sans text-blue-700 text-decoration-underline">{item.drillType}</td>*/}
        {/*                    <td className="px-6 py-4 text-center"><span*/}
        {/*                        className="inline-flex items-center justify-center w-7 h-7 ms-2 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full">*/}
        {/*                        {item.drillScore}*/}
        {/*                        </span>*/}
        {/*                    </td>*/}
        {/*                    <td className="px-6 py-4 text-center">*/}
        {/*                        <label>{(item.evaluationStatus != 'Evaluated') ? (<>NA</>) : (<>{item.drillScore > 70 ? (<>*/}
        {/*                        <span*/}
        {/*                            className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-green-400 border border-green-400">Passed</span>*/}
        {/*                        </>) : (<><span*/}
        {/*                            className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-red-400 border border-red-400">Failed</span></>)}</>)}</label>*/}
        {/*                    </td>*/}
        {/*                    <td className="px-6 py-4 text-center">{item.totalCorrect}</td>*/}
        {/*                    <td className="px-6 py-4 text-center">{item.totalWrong}</td>*/}
        {/*                    <td className="px-6 py-4 text-center text-xs">{item.status}</td>*/}
        {/*                    <td className="px-6 py-4 text-center text-xs">{item.evaluationStatus}</td>*/}
        {/*                    <td className="px-6 py-4 text-center">*/}
        {/*                        <Link className="font-medium text-blue-600 dark:text-blue-500 hover:underline"*/}
        {/*                              onClick={() => deleteChallenge(item.refId)}*/}
        {/*                              href="#">Delete</Link>*/}
        {/*                    </td>*/}
        {/*                    <td className="px-6 py-4 text-center">*/}
        {/*                        {(item.status != 'Completed') ? (<Link*/}
        {/*                            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"*/}
        {/*                            href={(getDrillTypeLink(item.drillType)) + drillRefId + "/" + item.refId}>*/}
        {/*                            Try*/}
        {/*                        </Link>) : (<Link*/}
        {/*                            className="font-medium text-gray-300 dark:text-blue-500 hover:underline" href="#">*/}
        {/*                            Try*/}
        {/*                        </Link>)}*/}
        {/*                    </td>*/}
        {/*                    <td className="px-6 py-4 text-center">*/}
        {/*                        {(item.status == 'Not Initiated') ? (<Link*/}
        {/*                            className="font-medium text-gray-300 dark:text-blue-500 hover:underline"*/}
        {/*                            href="#">*/}
        {/*                            Evaluate*/}
        {/*                        </Link>) : item.evaluationStatus === 'Evaluated' ? (<Link*/}
        {/*                                className="font-medium text-blue-600 dark:text-blue-500 hover:underline"*/}
        {/*                                onClick={() => handleEvaluatorModel(true, item.refId)}*/}
        {/*                                href="#"*/}
        {/*                            >*/}
        {/*                                Retry*/}
        {/*                            </Link>) : (<Link*/}
        {/*                                className="font-medium text-blue-600 dark:text-blue-500 hover:underline"*/}
        {/*                                onClick={() => handleEvaluatorModel(true, item.refId)}*/}
        {/*                                href="#"*/}
        {/*                            >*/}
        {/*                                Evaluate*/}
        {/*                            </Link>)}*/}
        {/*                    </td>*/}
        {/*                    <td className="px-6 py-4 text-center">*/}
        {/*                        {(item.evaluationStatus != 'Evaluated') ? (<Link*/}
        {/*                            className="font-medium text-gray-300 dark:text-blue-500 hover:underline"*/}
        {/*                            href="#">*/}
        {/*                            Click*/}
        {/*                        </Link>) : (<Link*/}
        {/*                            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"*/}
        {/*                            href={"/evaluation_report/meaning_report/" + item.refId}>*/}
        {/*                            Click*/}
        {/*                        </Link>)}*/}
        {/*                    </td>*/}
        {/*                </tr>))) : (<tr>*/}
        {/*                <td scope="col" className="px-6 py-4 text-center">*/}
        {/*                </td>*/}
        {/*                <td scope="col" className="px-6 py-4 text-center">*/}
        {/*                </td>*/}
        {/*                <td scope="col" className="px-6 py-4 text-center">*/}
        {/*                </td>*/}
        {/*                <td scope="col" className="px-6 py-4 text-center">*/}
        {/*                </td>*/}
        {/*                <td scope="col" className="px-6 py-4 text-center">*/}
        {/*                </td>*/}
        {/*                <td scope="col" className="px-6 py-4 text-center">*/}
        {/*                    <h6 className="text-lg font-bold dark:text-white">No data found</h6>*/}
        {/*                </td>*/}
        {/*                <td scope="col" className="px-6 py-4 text-center">*/}
        {/*                </td>*/}
        {/*                <td scope="col" className="px-6 py-4 text-center">*/}
        {/*                </td>*/}
        {/*                <td scope="col" className="px-6 py-4 text-center">*/}
        {/*                </td>*/}
        {/*                <td scope="col" className="px-6 py-4 text-center">*/}
        {/*                </td>*/}
        {/*            </tr>)}*/}
        {/*            </tbody>*/}
        {/*        </table>*/}
        {/*    </div>*/}
        {/*</div>*/}
    </>);
};

export default Challenges;

export async function getServerSideProps(context) {
    const {drillId} = context.params;
    const data = await fetchData(`${API_LEXIMENTOR_BASE_URL}/drill/metadata/challenges/${drillId}`);
    return {
        props: {
            data, drillId
        },
    };
}
