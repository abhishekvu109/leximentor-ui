import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Script from "next/script";
import leximentorService from "../../../../services/leximentor.service";
import Layout from "@/components/layout/Layout";
import React from 'react';

const LoadGuessWordDrillChallenge = () => {
    const router = useRouter();
    const { drillId } = router.query;

    const [drillSetData, setDrillSetData] = useState({ data: [] });
    const [challengeId, setChallengeId] = useState(null);
    const [drillSetWordData, setDrillSetWordData] = useState({ data: [] });
    const [wordToOptions, setWordToOptions] = useState([]);
    const [formData, setFormData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [notificationVisible, setNotificationVisible] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState("");
    const [notificationSuccess, setNotificationSuccess] = useState(false);

    useEffect(() => {
        if (drillId?.[0] && drillId?.[1]) {
            setLoading(true);
            const fetchDataAsync = async () => {
                try {
                    const challengeIdVal = drillId[0];
                    const drillRefIdVal = drillId[1];
                    setChallengeId(challengeIdVal);

                    const [setData, wordData] = await Promise.all([
                        leximentorService.getDrillSet(drillRefIdVal),
                        leximentorService.getDrillSetWords(drillRefIdVal)
                    ]);

                    if (setData && wordData) {
                        setDrillSetData(setData);
                        setDrillSetWordData(wordData);
                        const options = populateWordToOptions(setData, wordData);
                        setWordToOptions(options);
                        setFormData(setData.data.map(item => ({
                            drillSetRefId: item.refId,
                            drillChallengeRefId: challengeIdVal,
                            response: '',
                        })));
                    }
                } catch (error) {
                    console.error("Failed to fetch challenge data:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchDataAsync();
        }
    }, [drillId]);

    const populateWordToOptions = (setData, wordData) => {
        if (!setData?.data || !wordData?.data) return [];
        return setData.data.map(item => {
            const currentWord = wordData.data.find(w => w.refId === item.wordRefId);
            if (!currentWord) return null;

            // Get other words as distractors
            const otherWords = wordData.data
                .filter(w => w.refId !== item.wordRefId)
                .map(w => w.word);

            // Shuffle and pick 3 distractors
            const shuffledDistractors = [...otherWords].sort(() => 0.5 - Math.random());
            const options = [currentWord.word, ...shuffledDistractors.slice(0, 3)];

            // Final shuffle of the 4 options
            return {
                wordRefId: item.wordRefId,
                options: options.sort(() => 0.5 - Math.random())
            };
        }).filter(Boolean);
    };

    const NotificationClose = () => {
        setNotificationVisible(false);
    };

    const GetWordData = (wordRefId) => {
        return drillSetWordData.data.find(item => item.refId === wordRefId);
    };

    const GetOptions = (wordRefId) => {
        return wordToOptions.find(item => item.wordRefId === wordRefId);
    };

    const ShowNotification = ({ isVisible, message, isSuccess }) => {
        if (isVisible) {
            if (!isSuccess) {
                return <>
                    <div id="alert-border-2"
                        className="flex items-center  p-4 mb-4 text-red-800 border-t-4 border-red-300 bg-red-50 dark:text-red-400 dark:bg-gray-800 dark:border-red-800"
                        role="alert">
                        <svg className="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor" viewBox="0 0 20 20">
                            <path
                                d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                        </svg>
                        <div className="ms-3 text-sm font-medium">
                            {message}
                        </div>
                        <button type="button" onClick={NotificationClose}
                            className="ms-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"
                            data-dismiss-target="#alert-border-2" aria-label="Close">
                            <span className="sr-only">Dismiss</span>
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                    strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                            </svg>
                        </button>
                    </div>
                </>
            } else {
                return <>
                    <div id="alert-border-3"
                        className="flex items-center p-4 mb-4 text-green-800 border-t-4 border-green-300 bg-green-50 dark:text-green-400 dark:bg-gray-800 dark:border-green-800"
                        role="alert">
                        <svg className="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor" viewBox="0 0 20 20">
                            <path
                                d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                        </svg>
                        <div className="ms-3 text-sm font-medium">
                            {message}
                        </div>
                        <button type="button" onClick={NotificationClose}
                            className="ms-auto -mx-1.5 -my-1.5 bg-green-50 text-green-500 rounded-lg focus:ring-2 focus:ring-green-400 p-1.5 hover:bg-green-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700"
                            data-dismiss-target="#alert-border-3" aria-label="Close">
                            <span className="sr-only">Dismiss</span>
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                    strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                            </svg>
                        </button>
                    </div>
                </>
            }

        }
    };

    const handleChange = (index, value) => {
        setFormData(prevFormData => {
            const updatedFormData = [...prevFormData];
            updatedFormData[index] = { ...updatedFormData[index], response: value };
            return updatedFormData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await leximentorService.updateChallengeScores(challengeId, formData);

            setNotificationSuccess(true);
            setNotificationMessage("Response has been updated.");
            setNotificationVisible(true);
        } catch (error) {
            console.error('Error:', error);
            setNotificationSuccess(false);
            setNotificationMessage("Network response was not ok " + error);
            setNotificationVisible(true);
        }
    };

    if (loading) return <div className="p-20 text-center font-bold text-slate-400 animate-pulse">Loading Word Guess Challenge...</div>;

    return (
        <Layout content={
            <>
                <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></Script>

                <div className="alert alert-dark w-full font-bold text-center" role="alert">
                    Guess the word from the meaning.
                </div>
                {notificationVisible ? (<ShowNotification isVisible={notificationVisible} isSuccess={notificationSuccess}
                    message={notificationMessage} />) : (
                    <ShowNotification isVisible={false} isSuccess={notificationSuccess}
                        message={notificationMessage} />)}
                <form className="p-4 md:p-5" onSubmit={handleSubmit}>
                    <div className="container border-1">
                        <table className="table-auto w-full" cellPadding="10" cellSpacing="10">
                            <tbody>
                                {drillSetData.data.map((item, index) => (
                                    <React.Fragment key={`group-${index}`}>
                                        <tr className="bg-yellow-100 border-2 border-yellow-600" key={`meaning-${index}`}>
                                            <td>
                                                <label className="font-semibold mr-3 my-2">Meaning:</label>
                                                <label>{GetWordData(item.wordRefId)?.meanings?.[0]?.meaning || "No meaning found"}</label>
                                            </td>
                                        </tr>
                                        <tr className="bg-gray-100 border-2 border-gray-600" key={`option-${index}`}>
                                            <td>
                                                {GetOptions(item.wordRefId)?.options?.map((itemObj, i) => (
                                                    <React.Fragment key={`${item.wordRefId}-word-${i}`}>
                                                        <input
                                                            type="radio"
                                                            id={`${item.wordRefId}-id-${i}`}
                                                            name={`word-${index}`}
                                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                            value={itemObj}
                                                            onChange={(e) => handleChange(index, e.target.value)}
                                                        />
                                                        <label htmlFor={`${item.wordRefId}-id-${i}`}
                                                            className="mx-2 text-sm font-medium text-gray-900 dark:text-gray-300">{itemObj}</label>
                                                    </React.Fragment>
                                                ))}
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex flex-row my-4">
                            <div className="basis-1/12">
                                <button type="submit" className="btn btn-primary bg-blue-400 w-3/4 font-semibold">Submit
                                </button>
                            </div>
                            <div className="basis-1/12">
                                <button type="reset" className="btn btn-danger bg-red-400 w-3/4 font-semibold">Reset</button>
                            </div>
                            <div className="basis-10/12">
                            </div>
                        </div>
                    </div>
                </form>
            </>
        } />
    );
};

export default LoadGuessWordDrillChallenge;
