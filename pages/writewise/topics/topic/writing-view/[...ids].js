import {fetchData, postDataAsJson} from "@/dataService";
import {API_LEXIMENTOR_BASE_URL, API_WRITEWISE_BASE_URL} from "@/constants";
import Layout from "@/components/layout/Layout";
import {useEffect, useState} from "react";

const Content = ({topics, responseVersions}) => {

    const Data = () => {
        if (topics == null || topics.data == null) {
            return (<>
                <p className="text-black/50 text-sm font-semibold italic">Internal error in loading the topics.</p>
            </>);
        } else {
            return <><HTML topic={topics.data} recommendations={topics.data.recommendations}
                           responseVersions={responseVersions}/> </>
        }
    }


    const HTML = ({topic, recommendations, responseVersions}) => {
        const [selectedVersion, setSelectedVersion] = useState((responseVersions?.data?.responseVersionDTOs && responseVersions.data.responseVersionDTOs.length > 0) ? responseVersions.data.responseVersionDTOs[0] : null);
        const [essay, setEssay] = useState('');
        const wordCount = essay.trim().length > 0 ? essay.trim().split(/\s+/).length : 0;
        const [formData, setFormData] = useState({
            writingSessionRefId: topic.writingSessionRefId, topicRefId: topic.refId, responseType: 0, response: ""

        })

        useEffect(() => {
            if (responseVersions?.data?.responseVersionDTOs && responseVersions.data.responseVersionDTOs.length > 0) {
                const firstVersion = responseVersions.data.responseVersionDTOs[0];
                setSelectedVersion(firstVersion);
                setEssay(firstVersion.response);
            }
        }, [responseVersions]);


        const handleChange = (e) => {
            const text = e.target.value;
            setEssay(text);
        };

        const handleSubmit = async (e, submitType) => {
            e.preventDefault();
            formData.response = essay;
            formData.responseType = submitType == 'Draft' ? 0 : 1;
            try {
                const res = await fetch(`${API_WRITEWISE_BASE_URL}/v1/response`, {
                    method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(formData),
                });
                if (!res.ok) throw new Error("Failed to save or submit.");
                const data = await res.json();
                alert(`Essay ${submitType === "submit" ? "submitted" : "saved"} successfully!`);
            } catch (err) {
                console.error(err);
                alert("There was an error. Please try again.");
            }
        };


        return (<div className="min-h-screen bg-gray-50 p-6 text-gray-800 font-sans flex flex-col gap-6">
            {/* Header */}
            <header className="max-w-4xl mx-auto w-full">
                <h1 className="text-lg font-bold mb-2">{`📝 ${topic.topicNo}. Topic: ${topic.topic}`}</h1>

                {/* Dropdown for topic versions */}
                {responseVersions.data && responseVersions.data.responseVersionDTOs.length > 0 && (
                    <div className="mb-2">
                        <label htmlFor="versionSelect" className="text-xs font-medium text-gray-600 mr-2">
                            Select version:
                        </label>
                        <select
                            id="versionSelect"
                            // value={selectedVersion}
                            onChange={(e) => {
                                const version = responseVersions.data.responseVersionDTOs[e.target.selectedIndex];
                                setSelectedVersion(version);
                                setEssay(version.response);
                            }}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {responseVersions.data.responseVersionDTOs.map((version, index) => (
                                <option key={index} value={version}>
                                    v{version.versionNumber}.0
                                </option>))}
                        </select>
                    </div>)}

                <p className="text-xs text-gray-600">
                    <strong>Description:</strong> {topic.description}
                </p>
            </header>

            {/* Writing area */}

            <section className="max-w-4xl mx-auto w-full bg-white shadow rounded-lg p-6">
                {selectedVersion != null && String(selectedVersion.responseStatus).toUpperCase() === 'SUBMITTED' ? <>
                    <button type="submit" onClick={(e) => {
                        e.preventDefault();
                        setEssay("");
                        setSelectedVersion(null);
                    }}
                            className="bg-green-200 inline-flex text-gray-800 px-6 py-1 text-xs border border-gray-500  rounded hover:bg-gray-300 transition mb-3 hover:bg-green-400">
                        <svg className="w-4 h-4 text-gray-800 dark:text-white mr-2" aria-hidden="true"
                             xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                             viewBox="0 0 24 24">
                            <path fillRule="evenodd"
                                  d="M12 2c-.791 0-1.55.314-2.11.874l-.893.893a.985.985 0 0 1-.696.288H7.04A2.984 2.984 0 0 0 4.055 7.04v1.262a.986.986 0 0 1-.288.696l-.893.893a2.984 2.984 0 0 0 0 4.22l.893.893a.985.985 0 0 1 .288.696v1.262a2.984 2.984 0 0 0 2.984 2.984h1.262c.261 0 .512.104.696.288l.893.893a2.984 2.984 0 0 0 4.22 0l.893-.893a.985.985 0 0 1 .696-.288h1.262a2.984 2.984 0 0 0 2.984-2.984V15.7c0-.261.104-.512.288-.696l.893-.893a2.984 2.984 0 0 0 0-4.22l-.893-.893a.985.985 0 0 1-.288-.696V7.04a2.984 2.984 0 0 0-2.984-2.984h-1.262a.985.985 0 0 1-.696-.288l-.893-.893A2.984 2.984 0 0 0 12 2Zm3.683 7.73a1 1 0 1 0-1.414-1.413l-4.253 4.253-1.277-1.277a1 1 0 0 0-1.415 1.414l1.985 1.984a1 1 0 0 0 1.414 0l4.96-4.96Z"
                                  clipRule="evenodd"/>
                        </svg>

                        New
                    </button>
                </> : <></>}

                <textarea id="essay" rows="16" placeholder="Start writing your essay here..." value={essay}
                          onChange={handleChange}
                          disabled={selectedVersion != null && String(selectedVersion.responseStatus).toUpperCase() === 'SUBMITTED'}
                          className={`w-full border border-gray-300 rounded-md p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y`}/>
                <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
                    <p><span>{wordCount}</span> words</p>
                    <div className="flex gap-2">
                        <button type="submit" onClick={(e) => handleSubmit(e, 'Draft')}
                                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition">
                            Save as Draft
                        </button>
                        <button type="submit" onClick={(e) => handleSubmit(e, 'Submit')}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                            Submit
                        </button>
                    </div>
                </div>
            </section>
            {/* Tips */}
            {recommendations && recommendations.length > 0 && (<aside className="max-w-4xl mx-auto w-full mt-2">
                <details className="bg-blue-50 border-l-4 border-blue-400 rounded p-4">
                    <summary className="font-medium cursor-pointer">💡 Writing Tips (click to expand)</summary>
                    <ul className="mt-3 list-disc list-inside text-sm text-gray-700 space-y-1">
                        {recommendations.map((item, index) => (<li key={index}>{item}</li>))}
                    </ul>
                </details>
            </aside>)}
        </div>);
    };


    return (<>
        <Data/>
    </>);
}
const WritingPad = ({topics, responseVersions}) => {
    return (<>
        <Layout content={<> <Content topics={topics} responseVersions={responseVersions}/></>}/>
    </>);
}

export default WritingPad;

export async function getServerSideProps(context) {
    const {params} = context;

    // Accessing the array of values
    const ids = params.ids;
    const topicRefId = ids[0];
    const topics = await fetchData(`${API_WRITEWISE_BASE_URL}/v1/topics/topic/${topicRefId}`)
    const responseVersions = await fetchData(`${API_WRITEWISE_BASE_URL}/v1/response/response-version/${topicRefId}`)

    return {
        props: {
            topics, responseVersions
        },
    };
}