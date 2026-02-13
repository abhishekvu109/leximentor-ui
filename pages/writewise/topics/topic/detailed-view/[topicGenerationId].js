import { useState, useEffect } from "react";
import Link from "next/link";
import writewiseService from "../../../../../services/writewise.service";
import Layout from "@/components/layout/Layout";
import { useRouter } from "next/router";
import ErrorModal from "@/components/modal_notifications/ErrorModal";

const MainView = ({ data }) => {
    const router = useRouter();
    const [selectedTopicIndex, setSelectedTopicIndex] = useState(null);
    const [selectedTopicRefId, setSelectedTopicRefId] = useState(null);
    const [noTopicSelectedError, setNoTopicSelectedError] = useState(null);

    const updatedTopicRefIdAndIndex = (index, topicRefId) => {
        setSelectedTopicIndex(index);
        setSelectedTopicRefId(topicRefId);
    }

    const sendToWritingView = (topicGenerationRefId, topicRefId) => {
        if (selectedTopicRefId == null || selectedTopicIndex == null) {
            setNoTopicSelectedError("You haven't selected a topic. Please select a topic before proceeding.")
        } else {
            router.push(`/writewise/topics/topic/writing-view/${topicRefId}/${topicGenerationRefId}`);
        }
    }

    const capitalizeFirst = (str) => {
        return (!str ? '-' : str.charAt(0).toUpperCase() + str.slice(1));
    };

    const SideBar = ({ data }) => (
        <aside className="w-full md:w-1/3 bg-white p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">📝 Writing Setup</h2>
            <label className="block mb-2 text-sm font-semibold">Subject</label>
            <input type="text" disabled readOnly className="w-full mb-4 p-2 rounded border border-gray-300"
                value={capitalizeFirst(data.data.subject)} />

            <label className="block mb-2 text-sm font-semibold">Purpose</label>
            <input type="text" disabled readOnly className="w-full mb-4 p-2 rounded border border-gray-300"
                value={capitalizeFirst(data.data.purpose)} />

            <label className="block mb-2 text-sm font-semibold">Word Count</label>
            <input type="number" disabled readOnly className="w-full mb-4 p-2 rounded border border-gray-300"
                value={data.data.wordCount} />

            <label className="block mb-2 text-sm font-semibold">Number of Topics</label>
            <input type="number" disabled readOnly className="w-full mb-6 p-2 rounded border border-gray-300"
                value={data.data.numOfTopic} />

            <div className="mt-6 text-sm text-gray-600">
                <p>Status: <span className="text-green-600">{capitalizeFirst(data.data.status)}</span></p>
                <p>Ref ID: <code className="bg-gray-100 px-1 rounded">{`#${capitalizeFirst(data.data.refId)}`}</code></p>
            </div>
        </aside>
    );

    const Content = ({ data }) => (
        <main className="flex-1 p-6 space-y-6 overflow-auto">
            {/* Topics */}
            <section>
                <h2 className="text-xl font-bold text-white mb-4">🎯 Suggested Topics</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {data.data.topics?.length > 0 && data.data.topics.map((item, index) => {
                        const isSelected = selectedTopicIndex === index;
                        return (
                            <div
                                key={item.refId}
                                onClick={() => updatedTopicRefIdAndIndex(index, item.refId)}
                                className={`bg-white rounded-lg shadow p-4 border-l-4 cursor-pointer transition transform duration-300
                                            ${isSelected ? 'border-green-700 bg-blue-50 ring-2 ring-blue-400 scale-105' : 'border-blue-400 hover:scale-105 hover:shadow-lg'}`}
                            >
                                <h3 className="font-bold text-sm">{`${index + 1}. ${item.topic}`}</h3>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mt-1 inline-block">
                                    {capitalizeFirst(item.subject)}
                                </span>
                                <p className="mt-2 text-xs/tight text-justify">{capitalizeFirst(item.description)}</p>

                                {item.points?.length > 0 && (
                                    <ul className="list-disc list-inside text-xs/tight text-justify mt-3 space-y-1">
                                        {item.points.map((point, idx) => (<li key={idx}>{capitalizeFirst(point)}</li>))}
                                    </ul>
                                )}
                                <p className="mt-3 text-green-600 text-xs italic">💡 {item.learning}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Recommendations */}
            <section>
                <h2 className="text-xl font-bold text-white mb-2">🧠 Writing Tips</h2>
                {data.data.recommendations?.length > 0 && (
                    <div className="bg-white p-4 rounded shadow text-sm text-blue-900 space-y-2">
                        <ul className="list-disc list-inside space-y-1">
                            {data.data.recommendations.map((tip, idx) => (<li key={idx}>{capitalizeFirst(tip)}</li>))}
                        </ul>
                    </div>
                )}
            </section>

            {/* Call to Action */}
            <div className="text-right mt-4">
                <button
                    onClick={() => sendToWritingView(data.data.refId, selectedTopicRefId)}
                    className="bg-white/95 text-blue-600 font-semibold inline-flex items-center px-6 py-2 rounded shadow hover:bg-gray-600 hover:text-white transition"
                >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 4.182A4.136 4.136 0 0 1 16.9 3c1.087 0 2.13.425 2.899 1.182A4.01 4.01 0 0 1 21 7.037c0 1.068-.43 2.092-1.194 2.849L18.5 11.214l-5.8-5.71 1.287-1.31.012-.012Zm-2.717 2.763L6.186 12.13l2.175 2.141 5.063-5.218-2.141-2.108Zm-6.25 6.886-1.98 5.849a.992.992 0 0 0 .245 1.026 1.03 1.03 0 0 0 1.043.242L10.282 19l-5.25-5.168Zm6.954 4.01 5.096-5.186-2.218-2.183-5.063 5.218 2.185 2.15Z" />
                    </svg>
                    Start Writing Practice
                </button>
            </div>
        </main>
    );

    return (
        <>
            <ErrorModal message={noTopicSelectedError} isOpen={!!noTopicSelectedError} onClose={() => setNoTopicSelectedError(null)} />
            <div className="flex flex-col items-center">
                <div className="w-full mt-2">
                    <div className="grid grid-cols-3 gap-2 shadow-md border-2 border-gray-400">
                        <div className="col-span-3">
                            <div className="flex bg-blue-400 text-blue-900 font-sans">
                                <SideBar data={data} />
                                <Content data={data} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const ViewTopic = () => {
    const router = useRouter();
    const { topicGenerationId } = router.query;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (topicGenerationId) {
            const loadData = async () => {
                setLoading(true);
                try {
                    const result = await writewiseService.getTopicGenerationDetails(topicGenerationId);
                    setData(result);
                } catch (error) {
                    console.error("Failed to load topic details:", error);
                } finally {
                    setLoading(false);
                }
            };
            loadData();
        }
    }, [topicGenerationId]);

    if (loading) return <Layout content={<div className="p-8 text-center text-slate-500 font-bold">Loading Details...</div>} />;
    if (!data?.data) return <Layout content={<div className="p-8 text-center text-red-500 font-bold">Details not found.</div>} />;

    return (
        <Layout content={<MainView data={data} />} />
    );
}

export default ViewTopic;
