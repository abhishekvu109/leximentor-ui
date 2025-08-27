import Layout from "@/components/layout/Layout";
import Link from "next/link";
import {API_LEXIMENTOR_BASE_URL, API_WRITEWISE_BASE_URL} from "@/constants";
import {deleteData, fetchData, postDataAsJson} from "@/dataService";
import {useState} from "react";
import VerticalTabInterface from "@/components/widgets/tabs/VerticalTabInterface";
import ModalConfirmation from "@/components/modal_notifications/ModalConfirmation";

const FormHeading = () => {
    return (<>
        <div className="flex flex-col justify-center items-center justify-items-center text-center">
            <div className="w-[100%]">
                <h2 className="text-2xl text-black font-bold">Generate topics</h2>
                <p className="mt-2 text-sm font-semibold text-black/65">Enhance your skills with
                    tailored topics, focused writing points, and instant feedback—powered by advanced AI
                    to guide every word.</p>
            </div>
        </div>
    </>);
}
const GenerateTopicForm = () => {
    const [generateTopicFormData, setGenerateTopicFormData] = useState({
        subject: "economy", numOfTopic: 3, purpose: "IELTS exam", wordCount: 1000
    });

    const incrementValue = (field) => {
        setGenerateTopicFormData((prev) => ({
            ...prev, [field]: Number(prev[field]) + 1
        }));
    };

    const decrementValue = (field, min = 0) => {
        setGenerateTopicFormData((prev) => ({
            ...prev, [field]: Math.max(Number(prev[field]) - 1, min)
        }));
    };


    const handleGenerateTopicsFormData = (e) => {
        // Update form data state when input fields change
        setGenerateTopicFormData({...generateTopicFormData, [e.target.name]: e.target.value});
    };
    const onSubmit = async (e) => {
        e.preventDefault();
        console.log(JSON.stringify(generateTopicFormData));
        const URL = `${API_WRITEWISE_BASE_URL}/v1/topics`
        const body = generateTopicFormData
        const response = await postDataAsJson(URL, body);
    }


    const onReset = (e) => {
        e.preventDefault();
        setGenerateTopicFormData({
            subject: "economy", numOfTopic: 3, purpose: "IELTS exam", wordCount: 1000
        });
    }

    return (<>
        <form onSubmit={onSubmit} onReset={onReset}>
            <div
                className="grid grid-cols-3 gap-2 border shadow-md rounded-lg border-dotted border-black/50 p-4 justify-items-center">
                <div>
                    <label htmlFor="subject"
                           className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select
                        an option</label>
                    <select id="subject" name="subject" className="bg-gray-50
                                    border
                                    border-gray-300
                                    text-gray-900
                                    text-sm
                                    rounded-lg
                                    focus:ring-blue-500 focus:border-blue-500 block
                                    p-2.5
                                    dark:bg-gray-700
                                    dark:border-gray-600
                                    dark:placeholder-gray-400
                                    dark:text-white
                                    dark:focus:ring-blue-500
                                    dark:focus:border-blue-500" value={generateTopicFormData.subject}
                            onChange={handleGenerateTopicsFormData}>
                        <option selected>Choose a subject</option>
                        <option value="Economics">Economics</option>
                        <option value="History">History</option>
                        <option value="Politics">Politics</option>
                        <option value="Science & Technology">Science & Technology</option>
                    </select>
                    <p id="helper-text-explanation"
                       className="mt-2 text-xs text-gray-500 dark:text-gray-400">Please select the
                        subject (Economics/Politics etc.)</p>
                </div>
                <div>
                    <label htmlFor="words-input"
                           className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Words
                        count:</label>
                    <div className="relative flex items-center max-w-[11rem]">
                        <button type="button" id="words-decrement-button" onClick={() => decrementValue('wordCount', 1)}
                                data-input-counter-decrement="words-input"
                                className="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-s-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                            <svg className="w-3 h-3 text-gray-900 dark:text-white" aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
                                <path stroke="currentColor" strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2" d="M1 1h16"/>
                            </svg>
                        </button>
                        <input type="text" id="words-input" name="wordCount" data-input-counter
                               aria-describedby="helper-text-explanation"
                               data-input-counter-min="1000" onChange={handleGenerateTopicsFormData}
                               data-input-counter-max="5000"
                               className="bg-gray-50 border-x-0 border-gray-300 h-11 font-medium text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full pb-6 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                               placeholder="" value={String(generateTopicFormData.wordCount)} required/>
                        <div
                            className="absolute bottom-1 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 flex items-center text-xs text-gray-400 space-x-1 rtl:space-x-reverse">
                            <svg className="w-4 h-4 text-gray-800 dark:text-white"
                                 aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                 fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd"
                                      d="M9 7V2.221a2 2 0 0 0-.5.365L4.586 6.5a2 2 0 0 0-.365.5H9Zm2 0V2h7a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9h5a2 2 0 0 0 2-2Zm-1.02 4.804a1 1 0 1 0-1.96.392l1 5a1 1 0 0 0 1.838.319L12 15.61l1.143 1.905a1 1 0 0 0 1.838-.319l1-5a1 1 0 0 0-1.962-.392l-.492 2.463-.67-1.115a1 1 0 0 0-1.714 0l-.67 1.116-.492-2.464Z"
                                      clipRule="evenodd"/>
                            </svg>
                            <span>Words</span>
                        </div>
                        <button type="button" id="words-increment-button" onClick={() => incrementValue('wordCount')}
                                data-input-counter-increment="words-input"
                                className="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-e-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                            <svg className="w-3 h-3 text-gray-900 dark:text-white" aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                      strokeWidth="2" d="M9 1v16M1 9h16"/>
                            </svg>
                        </button>
                    </div>
                    <p id="helper-text-explanation"
                       className="mt-2 text-xs text-gray-500 dark:text-gray-400">Please select the
                        number of
                        words.</p>
                </div>
                <div>
                    <label htmlFor="topics-input"
                           className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Topics
                        count:</label>
                    <div className="relative flex items-center max-w-[11rem]">
                        <button type="button" id="topics-decrement-button"
                                onClick={() => decrementValue('numOfTopic', 1)}
                                data-input-counter-decrement="topics-input"
                                className="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-s-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                            <svg className="w-3 h-3 text-gray-900 dark:text-white" aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
                                <path stroke="currentColor" strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2" d="M1 1h16"/>
                            </svg>
                        </button>
                        <input type="text" id="topics-input" name="numOfTopic" data-input-counter
                               data-input-counter-min="3" onChange={handleGenerateTopicsFormData}
                               data-input-counter-max="5" aria-describedby="helper-text-explanation"
                               className="bg-gray-50 border-x-0 border-gray-300 h-11 font-medium text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full pb-6 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                               placeholder="" value={String(generateTopicFormData.numOfTopic)} required/>
                        <div
                            className="absolute bottom-1 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 flex items-center text-xs text-gray-400 space-x-1 rtl:space-x-reverse">
                            <svg className="w-4 h-4 text-gray-800 dark:text-white" aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                 fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd"
                                      d="M11 4.717c-2.286-.58-4.16-.756-7.045-.71A1.99 1.99 0 0 0 2 6v11c0 1.133.934 2.022 2.044 2.007 2.759-.038 4.5.16 6.956.791V4.717Zm2 15.081c2.456-.631 4.198-.829 6.956-.791A2.013 2.013 0 0 0 22 16.999V6a1.99 1.99 0 0 0-1.955-1.993c-2.885-.046-4.76.13-7.045.71v15.081Z"
                                      clipRule="evenodd"/>
                            </svg>
                            <span>Topics</span>
                        </div>
                        <button type="button" id="topics-increment-button" onClick={() => incrementValue('numOfTopic')}
                                data-input-counter-increment="topics-input"
                                className="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-e-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                            <svg className="w-3 h-3 text-gray-900 dark:text-white" aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                      strokeWidth="2" d="M9 1v16M1 9h16"/>
                            </svg>
                        </button>
                    </div>
                    <p id="helper-text-explanation"
                       className="mt-2 text-xs text-gray-500 dark:text-gray-400">Please select the
                        number of
                        topics.</p>
                </div>
            </div>
            <div className="col-span-3">
                <div className="grid grid-cols-3">
                    <div>
                        <button type="submit"
                                className="mt-3
                                                rounded-md
                                                text-white font-semibold
                                                px-3 py-2
                                                bg-blue-500 hover:bg-blue-700">
                            Generate
                        </button>
                        <button type="reset"
                                className="mt-3 m-4
                                                rounded-md
                                                text-black font-semibold
                                                border-1 border-blue-500
                                                px-3 py-2
                                                bg-white/10
                                                hover:bg-gray-400">
                            Reset
                        </button>
                    </div>
                </div>
            </div>
        </form>
    </>);
}

const CardView = () => {
    return <>

        <div x-data="topicSets()" className="bg-gray-100 min-h-screen p-6 text-gray-800 font-sans">
            <h1 className="text-2xl font-bold mb-6">📚 Writing Topic Sets</h1>


            <div className="mb-4 bg-white rounded shadow">
                <button
                    className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-blue-50 font-semibold flex justify-between items-center">
                    <span>Economy – IELTS Exam</span>
                    <span className="text-sm text-gray-500">#REF123</span>
                </button>

                <div x-show="open === 1" x-transition className="p-4 border-t">

                    <div className="mb-4 p-4 border-l-4 border-blue-500 bg-blue-50 rounded">
                        <h3 className="font-bold text-blue-900">1. Global Trade Agreements</h3>
                        <p className="text-sm mt-1">Explore how global trade agreements affect economies.</p>
                        <ul className="list-disc list-inside text-sm mt-2 ml-4 space-y-1">
                            <li>WTO, NAFTA overview</li>
                            <li>Impact on GDP & jobs</li>
                            <li>Country outcomes</li>
                            <li>Future trade trends</li>
                        </ul>
                        <p className="text-green-700 italic text-sm mt-2">💡 Strengthens data-driven writing.</p>
                    </div>


                    <div className="mb-4 p-4 border-l-4 border-blue-500 bg-blue-50 rounded">
                        <h3 className="font-bold text-blue-900">2. Central Banks & Policy</h3>
                        <p className="text-sm mt-1">Monetary tools and policy effects.</p>
                        <ul className="list-disc list-inside text-sm mt-2 ml-4 space-y-1">
                            <li>Role of central banks</li>
                            <li>Interest rates</li>
                            <li>Quantitative easing</li>
                            <li>Policy pros & cons</li>
                        </ul>
                        <p className="text-green-700 italic text-sm mt-2">💡 Improves persuasive writing.</p>
                    </div>
                </div>
            </div>


            <div className="mb-4 bg-white rounded shadow">
                <button
                    className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-blue-50 font-semibold flex justify-between items-center">
                    <span>Politics – UPSC Essay</span>
                    <span className="text-sm text-gray-500">#REF456</span>
                </button>

                <div x-show="open === 2" x-transition className="p-4 border-t">

                    <div className="mb-4 p-4 border-l-4 border-blue-500 bg-blue-50 rounded">
                        <h3 className="font-bold text-blue-900">1. Democracy in the Digital Age</h3>
                        <p className="text-sm mt-1">Impact of technology on democratic processes.</p>
                        <ul className="list-disc list-inside text-sm mt-2 ml-4 space-y-1">
                            <li>Social media influence</li>
                            <li>Election security</li>
                            <li>Fake news</li>
                            <li>Voter behavior</li>
                        </ul>
                        <p className="text-green-700 italic text-sm mt-2">💡 Enhances analytical thinking.</p>
                    </div>


                    <div className="mb-4 p-4 border-l-4 border-blue-500 bg-blue-50 rounded">
                        <h3 className="font-bold text-blue-900">2. Public Policy Reforms</h3>
                        <p className="text-sm mt-1">Key reforms shaping society.</p>
                        <ul className="list-disc list-inside text-sm mt-2 ml-4 space-y-1">
                            <li>Education reforms</li>
                            <li>Healthcare access</li>
                            <li>Transparency laws</li>
                            <li>Welfare schemes</li>
                        </ul>
                        <p className="text-green-700 italic text-sm mt-2">💡 Refines argumentative writing.</p>
                    </div>
                </div>
            </div>
        </div>
    </>
}

const TopicsDatatableView = ({data}) => {
    console.log("JSON Data:" + JSON.stringify(data));
    const [topicData, setTopicData] = useState(data);
    const deleteTopic = async ({topicRefId}) => {
        console.log("The topicRefId for delete:" + topicRefId);
        await deleteData(`${API_WRITEWISE_BASE_URL}/v1/topics/topic/${topicRefId}`);
        await LoadTable();
    }
    const LoadTable = async () => {
        const URL = `${API_WRITEWISE_BASE_URL}/v1/topics`;
        const topics = await fetchData(URL)
        setTopicData(topics);
    };
    const capitalizeFirst = (str) => {
        return ((str == null || str == '') ? '-' : str.charAt(0).toUpperCase() + str.slice(1));
    }

    return (<>
        <div className="mt-2 border-1 border-black/25 shadow-md rounded-md ">
            <table
                className="w-full text-[8pt] text-left rtl:text-right text-gray-500 dark:text-gray-400 shadow-md sm:rounded-lg">
                <caption
                    className="caption-bottom text-xm text-center font-bold italic p-2 text-gray-700 dark:text-gray-300">
                    List of all the word drills
                </caption>
                <thead
                    className="text-[9pt] text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th scope="col" className="px-3 py-1.5 text-center">
                        Serial
                    </th>
                    <th scope="col" className="px-3 py-1.5 text-center">
                        Subject
                    </th>
                    <th scope="col" className="px-3 py-1.5 text-center">
                        Topics
                    </th>
                    <th scope="col" className="px-3 py-1.5 text-center">
                        Words
                    </th>
                    <th scope="col" className="px-3 py-1.5 text-center">
                        Status
                    </th>
                    <th scope="col" className="px-3 py-1.5 text-center">
                        View
                    </th>
                    <th scope="col" className="px-3 py-1.5 text-center">
                        Delete
                    </th>
                </tr>
                </thead>
                <tbody>
                {(topicData.data != null && topicData.data.length > 0) ? <>{topicData.data.map((item, index) => (<>
                    <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                        <th scope="row"
                            className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center">{index + 1}
                        </th>
                        <td className="px-3 py-2 text-center">{capitalizeFirst(item.subject)}</td>
                        <td className="px-3 py-2 text-center">
                            {item.numOfTopic}
                        </td>
                        <td className="px-3 py-2 text-center">{item.wordCount}</td>
                        <td className="px-3 py-2 text-center">{capitalizeFirst(item.status)}</td>
                        <td className="px-3 py-2 text-center">
                            <Link href={`/writewise/topics/topic/detailed-view/${item.refId}`}
                                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Click
                            </Link>
                        </td>
                        <td className="px-3 py-2 text-center">
                            <Link href="#" onClick={() => deleteTopic(item.refId)}
                                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Click
                            </Link>
                        </td>
                    </tr>
                </>))}</> : <>
                    <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                        <td colSpan="7" className="px-3 py-2 text-center">No data found</td>
                    </tr>
                </>}

                </tbody>
            </table>
        </div>
    </>);
}
const AllTopicsDatatableView = ({data}) => {
    const [allTopicData, setAllTopicData] = useState(data);
    const deleteTopic = async ({topicRefId}) => {
        console.log("The topicRefId for delete:" + topicRefId);
        await deleteData(`${API_WRITEWISE_BASE_URL}/v1/topics/topic/${topicRefId}`);
        await LoadTable();
    }
    const LoadTable = async () => {
        const URL = `${API_WRITEWISE_BASE_URL}/v1/topics/all-topics`;
        const topics = await fetchData(URL)
        setAllTopicData(topics);
    };
    const capitalizeFirst = (str) => {
        return ((str == null || str == '') ? '-' : str.charAt(0).toUpperCase() + str.slice(1));
    }

    return (<>
        <div className="mt-2 border-1 border-black/25 shadow-md rounded-md ">
            <table
                className="w-full text-[8pt] text-left rtl:text-right text-gray-500 dark:text-gray-400 shadow-md sm:rounded-lg">
                <caption
                    className="caption-bottom text-xm text-center font-bold italic p-2 text-gray-700 dark:text-gray-300">
                    List of all topics.
                </caption>
                <thead
                    className="text-[9pt] text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th scope="col" className="px-3 py-1.5 text-center">
                        Serial
                    </th>
                    <th scope="col" className="px-3 py-1.5 text-center">
                        Subject
                    </th>
                    <th scope="col" className="px-3 py-1.5 text-center">
                        Topic
                    </th>
                    <th scope="col" className="px-3 py-1.5 text-center">
                        View
                    </th>
                    <th scope="col" className="px-3 py-1.5 text-center">
                        Delete
                    </th>
                </tr>
                </thead>
                <tbody>
                {(allTopicData.data != null && allTopicData.data.length > 0) ? <>{allTopicData.data.map((item, index) => (<>
                    <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                        <th scope="row"
                            className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center">{index + 1}
                        </th>
                        <td className="px-3 py-2 text-center">{capitalizeFirst(item.subject)}</td>
                        <td className="px-3 py-2 text-center">
                            {item.topic}
                        </td>
                        <td className="px-3 py-2 text-center">
                            <Link href={`/writewise/topics/topic/writing-view/${item.refId}`}
                                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Click
                            </Link>
                        </td>
                        <td className="px-3 py-2 text-center">
                            <Link href="#" onClick={() => deleteTopic(item.refId)}
                                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Click
                            </Link>
                        </td>
                    </tr>
                </>))}</> : <>
                    <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                        <td colSpan="5" className="px-3 py-2 text-center">No data found</td>
                    </tr>
                </>}

                </tbody>
            </table>
        </div>
    </>);
}

const SubmittedResponsesDatatableView = ({data}) => {
    const [submittedResponsesData, setSubmittedResponsesData] = useState(data);
    const [isEvaluationModalOpen, setEvaluationModalOpen] = useState(false);
    const [evalFormData, setEvalFormData] = useState({
        topicRefId: "", versionRefId: ""
    })

    const handleConfirm = async (formData) => {
        setEvaluationModalOpen(false);
        try {
            const res = await fetch(`${API_WRITEWISE_BASE_URL}/v1/evaluate`, {
                method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(formData),
            });
            if (!res.ok) throw new Error('Submission failed');
            alert('Submitted successfully!');
        } catch (err) {
            console.error(err);
            alert('Something went wrong.');
        }
    };
    const LoadTable = async () => {
        const URL = `${API_WRITEWISE_BASE_URL}/v1/response/submitted-responses`;
        const submittedResponses = await fetchData(URL)
        setSubmittedResponsesData(submittedResponses);
    };
    const capitalizeFirst = (str) => {
        return ((str == null || str == '') ? '-' : str.charAt(0).toUpperCase() + str.slice(1));
    }

    return (<>
        <ModalConfirmation
            isOpen={isEvaluationModalOpen}
            onClose={() => setEvaluationModalOpen(false)}
            onConfirm={() => handleConfirm(evalFormData)}
            title="Confirm Submission"
            message="Do you really want to submit this?"
        />
        <div className="mt-2 border-1 border-black/25 shadow-md rounded-md ">
            <table
                className="w-full text-[8pt] text-left rtl:text-right text-gray-500 dark:text-gray-400 shadow-md sm:rounded-lg">
                <caption
                    className="caption-bottom text-xm text-center font-bold italic p-2 text-gray-700 dark:text-gray-300">
                    List of all topics.
                </caption>
                <thead
                    className="text-[9pt] text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th scope="col" className="px-3 py-1.5 text-center">
                        Serial
                    </th>
                    <th scope="col" className="px-3 py-1.5 text-center">
                        Subject
                    </th>
                    <th scope="col" className="px-3 py-1.5 text-center">
                        Topic
                    </th>
                    <th scope="col" className="px-3 py-1.5 text-center">
                        View
                    </th>
                    <th scope="col" className="px-3 py-1.5 text-center">
                        Evaluate
                    </th>
                </tr>
                </thead>
                <tbody>
                {(submittedResponsesData.data != null && submittedResponsesData.data.length > 0) ? <>{submittedResponsesData.data.map((item, index) => (<>
                    {item.responseVersionDTOs.length > 0 ? <>
                        <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                            <th scope="row"
                                className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center">{index + 1}
                            </th>
                            <td className="px-3 py-2 text-center">{capitalizeFirst(item.topic.subject)}</td>
                            <td className="px-3 py-2 text-center">
                                {item.topic.topic}
                            </td>
                            <td className="px-3 py-2 text-center">
                                <Link
                                    href={`/writewise/topics/topic/writing-view/${item.responseVersionDTOs[0].refId}`}
                                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Click
                                </Link>
                            </td>
                            {/*<td className="px-3 py-2 text-center">*/}
                            {/*    <Link href="#" onClick={() => {*/}
                            {/*        evalFormData.topicRefId = item.topic.refId;*/}
                            {/*        evalFormData.versionRefId = item.responseVersionDTOs[0].refId;*/}
                            {/*        setEvaluationModalOpen(true);*/}
                            {/*    }}*/}
                            {/*          className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Click*/}
                            {/*    </Link>*/}
                            {/*</td>*/}
                            <td className="px-3 py-2 text-center">
                                <Link
                                    href={`/writewise/topics/topic/evaluation-view/${item.topic.refId}/${item.responseVersionDTOs[0].refId}`}
                                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Click
                                </Link>
                            </td>
                        </tr>
                    </> : <>
                        <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                            <td colSpan="5" className="px-3 py-2 text-center">No data found</td>
                        </tr>
                    </>}
                </>))}</> : <>
                    <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                        <td colSpan="5" className="px-3 py-2 text-center">No data found</td>
                    </tr>
                </>}

                </tbody>
            </table>
        </div>
    </>);
}


const EvaluatedResultsDatatableView = ({data}) => {
    const [evaluatedResultsData, setEvaluatedResultsData] = useState(data);
    const [isEvaluationModalOpen, setEvaluationModalOpen] = useState(false);
    const [evalFormData, setEvalFormData] = useState({
        topicRefId: "", versionRefId: ""
    })

    const handleConfirm = async (formData) => {
        setEvaluationModalOpen(false);
        try {
            const res = await fetch(`${API_WRITEWISE_BASE_URL}/v1/evaluate`, {
                method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(formData),
            });
            if (!res.ok) throw new Error('Submission failed');
            alert('Submitted successfully!');
        } catch (err) {
            console.error(err);
            alert('Something went wrong.');
        }
    };
    const LoadTable = async () => {
        const URL = `${API_WRITEWISE_BASE_URL}/v1/response/submitted-responses`;
        const submittedResponses = await fetchData(URL)
        setSubmittedResponsesData(submittedResponses);
    };
    const capitalizeFirst = (str) => {
        return ((str == null || str == '') ? '-' : str.charAt(0).toUpperCase() + str.slice(1));
    }

    return (<>
        <ModalConfirmation
            isOpen={isEvaluationModalOpen}
            onClose={() => setEvaluationModalOpen(false)}
            onConfirm={() => handleConfirm(evalFormData)}
            title="Confirm Submission"
            message="Do you really want to submit this?"
        />
        <div className="mt-2 border-1 border-black/25 shadow-md rounded-md ">
            <table
                className="w-full text-[8pt] text-left rtl:text-right text-gray-500 dark:text-gray-400 shadow-md sm:rounded-lg">
                <caption
                    className="caption-bottom text-xm text-center font-bold italic p-2 text-gray-700 dark:text-gray-300">
                    List of all topics.
                </caption>
                <thead
                    className="text-[9pt] text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th scope="col" className="px-3 py-1.5 text-center">
                        Serial
                    </th>
                    <th scope="col" className="px-3 py-1.5 text-center">
                        Subject
                    </th>
                    <th scope="col" className="px-3 py-1.5 text-center">
                        Topic
                    </th>
                    <th scope="col" className="px-3 py-1.5 text-center">
                        View
                    </th>
                    <th scope="col" className="px-3 py-1.5 text-center">
                        Evaluate
                    </th>
                </tr>
                </thead>
                <tbody>
                {(evaluatedResultsData.data != null && evaluatedResultsData.data.length > 0) ? <>{evaluatedResultsData.data.map((item, index) => (<>
                    <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                        <th scope="row"
                            className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center">{index + 1}
                        </th>
                        <td className="px-3 py-2 text-center">{capitalizeFirst(item.topic.subject)}</td>
                        <td className="px-3 py-2 text-center">
                            {item.topic.topic}
                        </td>
                        <td className="px-3 py-2 text-center">
                            <Link
                                href={`/writewise/topics/topic/writing-view/${item.responseRefId}`}
                                className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Click
                            </Link>
                        </td>
                        <td className="px-3 py-2 text-center">
                            <Link
                                href={`/writewise/topics/topic/evaluation-result/${item.responseRefId}/${item.responseVersion.refId}`}
                                className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Click
                            </Link>
                        </td>
                    </tr>
                </>))}</> : <>
                    <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                        <td colSpan="5" className="px-3 py-2 text-center">No data found</td>
                    </tr>
                </>}
                </tbody>
            </table>
        </div>
    </>);
}


const MainDesign = ({all_topics_data, load_all_topics, load_all_submitted_responses, load_all_evaluated_responses}) => {
    const tabs = [{
        id: 'TopicGeneration', label: 'Topic generation', content: () => (<>
            <TopicsDatatableView data={all_topics_data}/>
        </>),
    }, {
        id: 'AllTopics', label: 'All topics', content: (<div>
            <AllTopicsDatatableView data={load_all_topics}/>
        </div>),
    }, {
        id: 'submittedResponses', label: 'Submitted', content: (<div>
            <SubmittedResponsesDatatableView data={load_all_submitted_responses}/>
        </div>),
    }, {
        id: 'evaluated', label: 'Evaluated', content: (<>
            <div>
                <EvaluatedResultsDatatableView data={load_all_evaluated_responses}/>
            </div>
        </>),
    }, {
        id: 'settings', label: 'Settings', content: <p>Manage genres, goals, and personal preferences.</p>,
    },];
    return (<>
        <div className="flex flex-col items-center">
            <div className="w-[60%] p-2 mt-2">
                <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-3">
                        <FormHeading/>
                    </div>
                    <div className="col-span-3">
                        <GenerateTopicForm/>
                        <hr className="border-1 border-black/50 border-dashed"/>
                    </div>
                    {/*<div className="col-span-3">*/}
                    {/*    <TopicsDatatableView data={all_topics_data}/>*/}
                    {/*</div>*/}
                    <div className="col-span-3">
                        <VerticalTabInterface tabs={tabs}/>
                    </div>
                </div>
            </div>
        </div>
    </>);
}
export default function GenerateTopics({
                                           load_topics_response,
                                           load_all_topics,
                                           load_all_submitted_responses,
                                           load_all_evaluated_responses
                                       }) {
    return (<>
        <Layout content={<><MainDesign all_topics_data={load_topics_response} load_all_topics={load_all_topics}
                                       load_all_submitted_responses={load_all_submitted_responses}
                                       load_all_evaluated_responses={load_all_evaluated_responses}/></>}/>
    </>);
}

export async function getServerSideProps(context) {
    const load_topics_response = await fetchData(`${API_WRITEWISE_BASE_URL}/v1/topic-generations`);
    const load_all_topics = await fetchData(`${API_WRITEWISE_BASE_URL}/v1/topics`)
    const load_all_submitted_responses = await fetchData(`${API_WRITEWISE_BASE_URL}/v1/response/submitted-responses`)
    const load_all_evaluated_responses = await fetchData(`${API_WRITEWISE_BASE_URL}/v1/response/evaluated-responses`)
    return {
        props: {
            load_topics_response, load_all_topics, load_all_submitted_responses, load_all_evaluated_responses
        },
    };
}
