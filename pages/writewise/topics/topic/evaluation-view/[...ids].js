import Layout from "@/components/layout/Layout";
import {API_WRITEWISE_BASE_URL} from "@/constants";
import {fetchData, ModelData} from "@/dataService";
import {useEffect, useState} from "react";
import clsx from "clsx";
import {SparklesIcon} from "@heroicons/react/20/solid";
import VerticalTabInterface from "@/components/widgets/tabs/VerticalTabInterface";
import Dropdown from "@/components/form/DropDown";

const HLStatusTracker = ({topicRefId, versionRefId}) => {
    const [status, setStatus] = useState('Not Started');

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`${API_WRITEWISE_BASE_URL}/v1/topics/topic/${topicRefId}/versions/version/${versionRefId}`);
                const data = await res.json();
                setStatus(data.data.llmEvaluationStatus == null ? 'Not Started' : data.data.llmEvaluationStatus); // expected: 'not-started' | 'in-progress' | 'completed'
            } catch (error) {
                console.error('Error fetching status:', error);
            }
        };

        fetchStatus(); // Initial call
        const interval = setInterval(fetchStatus, 60000*3); // Refresh every 60 seconds
        return () => clearInterval(interval);
    }, []);

    const getStatusBadgeClass = () => {
        switch (String(status).toUpperCase()) {
            case 'NOT STARTED':
                return 'bg-blue-100 text-blue-800 dark:bg-gray-900 dark:text-gray-300 p-1 font-semibold rounded-sm shadow-sm';
            case 'IN-PROGRESS':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 p-1 font-semibold rounded-sm shadow-sm dark:text-yellow-600 animate-pulse';
            case 'COMPLETED':
                return 'bg-green-100 text-green-800 p-1 font-semibold rounded-sm shadow-sm dark:bg-green-900 dark:text-green-300';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (<>
        <span className={`text-xs font-semibold border border-2 border-black/50  px-2 py-0.5 rounded rounded-lg shadow-lg px-1 py-0.5 ${getStatusBadgeClass()}`}>
            {status}
          </span>
    </>)
}

const LLStatusTracker = ({topicRefId, versionRefId}) => {
    const [status, setStatus] = useState('Not Started');

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`${API_WRITEWISE_BASE_URL}/v1/topics/topic/${topicRefId}/versions/version/${versionRefId}`);
                const data = await res.json();
                setStatus(data.data.lowLevelEvaluationStatus == null ? 'Not Started' : data.data.lowLevelEvaluationStatus); // expected: 'not-started' | 'in-progress' | 'completed'
            } catch (error) {
                console.error('Error fetching status:', error);
            }
        };

        fetchStatus(); // Initial call
        const interval = setInterval(fetchStatus, 60000*3); // Refresh every 60 seconds
        return () => clearInterval(interval);
    }, []);

    const getStatusBadgeClass = () => {
        switch (String(status).toUpperCase()) {
            case 'NOT STARTED':
                return 'bg-blue-100 text-blue-800 dark:bg-gray-900 dark:text-gray-300  font-semibold';
            case 'IN-PROGRESS':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900  font-semibold dark:text-yellow-600 animate-pulse';
            case 'COMPLETED':
                return 'bg-green-100 text-green-800 font-semibold dark:bg-green-900 dark:text-green-300';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (<>
        <span
            className={`text-xs font-semibold border border-2 border-black/50 px-2 py-0.5 rounded rounded-lg shadow-lg  ${getStatusBadgeClass()}`}>
              {status}
            </span>
    </>)
}
const MainPanel = ({topicRefId1, versionRefId1, responseVersion}) => {
    const [rv, setRv] = useState(responseVersion);
    const [highLevelResults, setHighLevelResults] = useState("Yet to generate");
    const [lowLevelResult, setLowLevelResults] = useState("Yet to generate");
    const [highLevelResultStatus, setHighLevelResultStatus] = useState(false);
    const [lowLevelResultStatus, setLowLevelResultStatus] = useState(false);
    const [customPrompt, setCustomPrompt] = useState("");
    const [validateHLResults, setValidateHLResults] = useState(true);
    const [validateLLResults, setValidateLLResults] = useState(true);
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`${API_WRITEWISE_BASE_URL}/v1/topics/topic/${topicRefId1}/versions/version/${versionRefId1}`);
                const data = await res.json();
                setHighLevelResults((data.data.llmEvaluationText == null || data.data.llmEvaluationText == '') ? 'Yet to generate' : JSON.stringify(JSON.parse(data.data.llmEvaluationText), null, 2)); // expected: 'not-started' | 'in-progress' | 'completed'
                setLowLevelResults((data.data.lowLevelEvaluationText == null || data.data.lowLevelEvaluationText == '') ? 'Yet to generate' : JSON.stringify(JSON.parse(data.data.lowLevelEvaluationText), null, 2)); // expected: 'not-started' | 'in-progress' | 'completed'
                setHighLevelResultStatus((data.data.llmEvaluationStatus != null && data.data.llmEvaluationStatus != '' && data.data.llmEvaluationStatus == 'In-progress') ? true : false);
                setLowLevelResultStatus((data.data.lowLevelEvaluationStatus != null && data.data.lowLevelEvaluationStatus != '' && data.data.lowLevelEvaluationStatus == 'In-progress') ? true : false);
            } catch (error) {
                console.error('Error fetching status:', error);
            }
        };

        fetchStatus(); // Initial call
        const interval = setInterval(fetchStatus, 60000); // Refresh every 60 seconds
        return () => clearInterval(interval);
    }, []);


    const HighLevel = () => {

        const [model, setModel] = useState('')
        const [isValidCheck, setIsValidCheck] = useState(false)
        const handleSelection = (item) => {
            setModel(item)
        };
        return (<>
            <div className="flex flex-col">
                <div className="flex flex-row gap-2 p-2">
                    <div>
                        <Dropdown
                            label="Choose Model"
                            items={ModelData}
                            onSelect={handleSelection}
                        />
                    </div>
                    <div>
                        <button
                            className="w-full rounded-lg bg-blue-600 text-sm font-semibold text-white transition-all px-2.5 py-1.5 hover:bg-blue-800 sm:w-auto"
                            onClick={async () => {
                                const formData = {
                                    topicRefId: topicRefId1,
                                    versionRefId: versionRefId1,
                                    model: model,
                                    isHighLevel: true
                                }
                                try {
                                    const res = await fetch(`${API_WRITEWISE_BASE_URL}/v1/topics/topic/versions/version/evaluate-response`, {
                                        method: "POST",
                                        headers: {"Content-Type": "application/json"},
                                        body: JSON.stringify(formData),
                                    });
                                    if (!res.ok) throw new Error('Submission failed');
                                    alert('Submitted successfully!');
                                } catch (err) {
                                    console.error(err);
                                    alert('Something went wrong.');
                                }
                            }}>
                            <div className="inline-flex">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                     className="my-1 size-4">
                                    <path fillRule="evenodd"
                                          d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97ZM6.75 8.25a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H7.5Z"
                                          clipRule="evenodd"/>
                                </svg>
                                <span className="mx-2 text-sm/6">Generate results</span>
                            </div>
                        </button>
                    </div>
                    <div>
                        <button
                            className="w-full rounded-lg bg-green-600 text-sm font-semibold text-white transition-all px-2.5 py-1.5 hover:bg-green-800 sm:w-auto"
                            onClick={async () => {
                                const formData = {
                                    topicRefId: topicRefId1,
                                    versionRefId: versionRefId1,
                                    model: model,
                                    isHighLevel: true
                                }
                                try {
                                    const res = await fetch(`${API_WRITEWISE_BASE_URL}/v1/topics/topic/versions/version/evaluate-response/validate`, {
                                        method: "POST",
                                        headers: {"Content-Type": "application/json"},
                                        body: JSON.stringify(formData),
                                    });
                                    if (!res.ok) throw new Error('Submission failed');
                                    const data = await res.json();
                                    setIsValidCheck(true);
                                    setValidateHLResults(Boolean(data.data));
                                    setTimeout(()=>setIsValidCheck(false),2000)
                                } catch (err) {
                                    console.error(err);
                                    alert('Something went wrong.');
                                }
                            }}>
                            <div className="inline-flex">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                     className="my-1 size-4">
                                    <path fillRule="evenodd"
                                          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                                          clipRule="evenodd"/>
                                </svg>
                                <span className="mx-2 text-sm/6">Validate results</span>
                            </div>
                        </button>
                    </div>
                    <div>
                        <button
                            className="w-full rounded-lg bg-yellow-600 text-sm font-semibold text-white transition-all px-2.5 py-1.5 hover:bg-yellow-800 sm:w-auto"
                            onClick={async () => {
                                const formData = {
                                    topicRefId: topicRefId1,
                                    versionRefId: versionRefId1,
                                    model: model,
                                    isHighLevel: true
                                }
                                try {
                                    const res = await fetch(`${API_WRITEWISE_BASE_URL}/v1/topics/topic//versions/version/submit-results`, {
                                        method: "POST",
                                        headers: {"Content-Type": "application/json"},
                                        body: JSON.stringify(formData),
                                    });
                                    if (!res.ok) throw new Error('Submission failed');
                                    alert('Submitted successfully.')
                                } catch (err) {
                                    console.error(err);
                                    alert('Something went wrong.');
                                }
                            }}>
                            <div className="inline-flex">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                     className="my-1 size-4">
                                    <path
                                        d="M21 6.375c0 2.692-4.03 4.875-9 4.875S3 9.067 3 6.375 7.03 1.5 12 1.5s9 2.183 9 4.875Z"/>
                                    <path
                                        d="M12 12.75c2.685 0 5.19-.586 7.078-1.609a8.283 8.283 0 0 0 1.897-1.384c.016.121.025.244.025.368C21 12.817 16.97 15 12 15s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.285 8.285 0 0 0 1.897 1.384C6.809 12.164 9.315 12.75 12 12.75Z"/>
                                    <path
                                        d="M12 16.5c2.685 0 5.19-.586 7.078-1.609a8.282 8.282 0 0 0 1.897-1.384c.016.121.025.244.025.368 0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.284 8.284 0 0 0 1.897 1.384C6.809 15.914 9.315 16.5 12 16.5Z"/>
                                    <path
                                        d="M12 20.25c2.685 0 5.19-.586 7.078-1.609a8.282 8.282 0 0 0 1.897-1.384c.016.121.025.244.025.368 0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.284 8.284 0 0 0 1.897 1.384C6.809 19.664 9.315 20.25 12 20.25Z"/>
                                </svg>
                                <span className="mx-2 text-sm/6">Submit results</span>
                            </div>
                        </button>
                    </div>
                </div>
                <div>
                    <aside className="mx-auto mt-2 w-full">
                        <details className="m-2 rounded border-l-4 border-blue-600 bg-blue-50 p-2">
                            <summary className="cursor-pointer text-sm font-semibold text-black/70">
                                <div className="inline-flex">
                                    <div>💡 High-level results (click to expand) <HLStatusTracker
                                        topicRefId={topicRefId1} versionRefId={versionRefId1}/></div>
                                </div>
                            </summary>
                            <pre
                                className={`${highLevelResultStatus ? `bg-yellow-100 animate-pulse` : `bg-blue-50`}  ${(isValidCheck) ? (!validateHLResults) ? `bg-red-100  animate-pulse` : `bg-green-100 animate-pulse ` : ``}  my-2 overflow-auto rounded-md  p-4 text-xs text-black/60`}>
                              <code>{highLevelResults}</code>
                            </pre>

                        </details>
                    </aside>
                </div>

            </div>
        </>);
    }

    const LowLevel = () => {
        const [model, setModel] = useState('')
        const [isValidCheck, setIsValidCheck] = useState(false)
        const handleSelection = (item) => {
            setModel(item)
        };
        return (<>
            <div className="flex flex-col">
                <div className="flex flex-row gap-2 p-2">
                    <div>
                        <Dropdown
                            label="Choose Model"
                            items={ModelData}
                            onSelect={handleSelection}
                        />
                    </div>
                    <div>
                        <button
                            className="w-full rounded-lg bg-blue-600 text-sm font-semibold text-white transition-all px-2.5 py-1.5 hover:bg-blue-800 sm:w-auto"
                            onClick={async () => {
                                const formData = {
                                    topicRefId: topicRefId1,
                                    versionRefId: versionRefId1,
                                    model: model,
                                    isHighLevel: false
                                }
                                try {
                                    const res = await fetch(`${API_WRITEWISE_BASE_URL}/v1/topics/topic/versions/version/evaluate-response`, {
                                        method: "POST",
                                        headers: {"Content-Type": "application/json"},
                                        body: JSON.stringify(formData),
                                    });
                                    if (!res.ok) throw new Error('Submission failed');
                                    alert('Submitted successfully!');
                                } catch (err) {
                                    console.error(err);
                                    alert('Something went wrong.');
                                }
                            }}>
                            <div className="inline-flex">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                     className="my-1 size-4">
                                    <path fillRule="evenodd"
                                          d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97ZM6.75 8.25a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H7.5Z"
                                          clipRule="evenodd"/>
                                </svg>
                                <span className="mx-2 text-sm/6">Generate results</span>
                            </div>
                        </button>
                    </div>
                    <div>
                        <button
                            className="w-full rounded-lg bg-green-600 text-sm font-semibold text-white transition-all px-2.5 py-1.5 hover:bg-green-800 sm:w-auto"
                            onClick={async () => {
                                const formData = {
                                    topicRefId: topicRefId1,
                                    versionRefId: versionRefId1,
                                    model: model,
                                    isHighLevel: false
                                }
                                try {
                                    const res = await fetch(`${API_WRITEWISE_BASE_URL}/v1/topics/topic/versions/version/evaluate-response/validate`, {
                                        method: "POST",
                                        headers: {"Content-Type": "application/json"},
                                        body: JSON.stringify(formData),
                                    });
                                    if (!res.ok) throw new Error('Submission failed');
                                    const data = await res.json();
                                    setIsValidCheck(true)
                                    setValidateLLResults(Boolean(data.data));
                                    setTimeout(() => setIsValidCheck(false), 2000);
                                } catch (err) {
                                    console.error(err);
                                    alert('Something went wrong.');
                                }
                            }}>
                            <div className="inline-flex">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                     className="my-1 size-4">
                                    <path fillRule="evenodd"
                                          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                                          clipRule="evenodd"/>
                                </svg>
                                <span className="mx-2 text-sm/6">Validate results</span>
                            </div>
                        </button>
                    </div>
                    <div>
                        <button
                            className="w-full rounded-lg bg-yellow-600 text-sm font-semibold text-white transition-all px-2.5 py-1.5 hover:bg-yellow-800 sm:w-auto"
                            onClick={async () => {
                                const formData = {
                                    topicRefId: topicRefId1,
                                    versionRefId: versionRefId1,
                                    model: model,
                                    isHighLevel: false
                                }
                                try {
                                    const res = await fetch(`${API_WRITEWISE_BASE_URL}/v1/topics/topic//versions/version/submit-results`, {
                                        method: "POST",
                                        headers: {"Content-Type": "application/json"},
                                        body: JSON.stringify(formData),
                                    });
                                    if (!res.ok) throw new Error('Submission failed');
                                    alert('Submitted successfully.')
                                } catch (err) {
                                    console.error(err);
                                    alert('Something went wrong.');
                                }
                            }}>
                            <div className="inline-flex">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                     className="my-1 size-4">
                                    <path
                                        d="M21 6.375c0 2.692-4.03 4.875-9 4.875S3 9.067 3 6.375 7.03 1.5 12 1.5s9 2.183 9 4.875Z"/>
                                    <path
                                        d="M12 12.75c2.685 0 5.19-.586 7.078-1.609a8.283 8.283 0 0 0 1.897-1.384c.016.121.025.244.025.368C21 12.817 16.97 15 12 15s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.285 8.285 0 0 0 1.897 1.384C6.809 12.164 9.315 12.75 12 12.75Z"/>
                                    <path
                                        d="M12 16.5c2.685 0 5.19-.586 7.078-1.609a8.282 8.282 0 0 0 1.897-1.384c.016.121.025.244.025.368 0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.284 8.284 0 0 0 1.897 1.384C6.809 15.914 9.315 16.5 12 16.5Z"/>
                                    <path
                                        d="M12 20.25c2.685 0 5.19-.586 7.078-1.609a8.282 8.282 0 0 0 1.897-1.384c.016.121.025.244.025.368 0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.284 8.284 0 0 0 1.897 1.384C6.809 19.664 9.315 20.25 12 20.25Z"/>
                                </svg>
                                <span className="mx-2 text-sm/6">Submit results</span>
                            </div>
                        </button>
                    </div>
                </div>
                <div>
                    <aside className="mx-auto mt-2 w-full">
                        <details className="m-2 rounded border-l-4 border-blue-600 bg-blue-50 p-2">
                            <summary className="cursor-pointer text-sm font-semibold text-black/70">
                                <div className="inline-flex">
                                    <div>💡 Low-level results
                                        (click to expand) <LLStatusTracker
                                            topicRefId={topicRefId1} versionRefId={versionRefId1}/></div>
                                </div>
                            </summary>
                            <pre
                                className={`${lowLevelResultStatus ? `bg-yellow-100 animate-pulse` : `bg-blue-50`} ${(isValidCheck) ? (!validateLLResults) ? `bg-red-100  animate-pulse` : `bg-green-100 animate-pulse ` : ``} my-2 overflow-auto rounded-md  p-4 text-xs text-black/60`}>
                              <code>{lowLevelResult}</code>
                            </pre>
                        </details>
                    </aside>
                </div>

            </div>
        </>);
    }

    const tabs = [{
        id: 'highLevel', label: 'High-level', content: (<>
            <HighLevel/>
        </>),
    }, {
        id: 'lowLevel', label: 'Low-level', content: (<>
            <LowLevel/>
        </>),
    }];


    return (<>
        <h1 className="mb-4 text-center text-3xl font-bold text-gray-800">Writing Evaluator</h1>
        <div className="min-h-screen bg-gray-100 shadow-md">
            <div className="grid grid-cols-2 gap-4 p-4">
                <div className="col-span-2">
                    <VerticalTabInterface tabs={tabs}/>
                </div>
            </div>
        </div>
    </>);
}
const EvaluationPanel = ({topicRefId, versionRefId, responseVersion}) => {
    return (<>
        <Layout content={<>
            <MainPanel topicRefId1={topicRefId} versionRefId1={versionRefId} responseVersion={responseVersion}/>
        </>}/>
    </>);
}
export default EvaluationPanel;

export async function getServerSideProps(context) {
    const {params} = context;

    // Accessing the array of values
    const ids = params.ids;
    const topicRefId = ids[0];
    const versionRefId = ids[1];
    const responseVersion = await fetchData(`${API_WRITEWISE_BASE_URL}/v1/topics/topic/${topicRefId}/versions/version/${versionRefId}`)
    return {
        props: {
            topicRefId, versionRefId, responseVersion
        },
    };
}