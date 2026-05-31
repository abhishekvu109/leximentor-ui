import Link from "next/link";
import Layout from "@/components/layout/Layout";

const WritewiseDashboard = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Writewise Dashboard</h1>
                <p className="text-gray-600 mb-8">Improve your writing skills with AI-powered feedback and insights</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Write Essays Card */}
                    <Link href="/writewise/topics/generate-topics">
                        <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6">
                            <div className="text-4xl mb-3">✍️</div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Write Essays</h2>
                            <p className="text-gray-600">
                                Generate topics and practice writing essays on various subjects.
                            </p>
                            <div className="mt-4 text-blue-600 font-semibold">Get Started →</div>
                        </div>
                    </Link>

                    {/* Analytics Card */}
                    <Link href="/writewise/analytics">
                        <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6">
                            <div className="text-4xl mb-3">📊</div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics & Insights</h2>
                            <p className="text-gray-600">
                                View your writing performance metrics and get AI-powered improvement suggestions.
                            </p>
                            <div className="mt-4 text-blue-600 font-semibold">View Analytics →</div>
                        </div>
                    </Link>

                    {/* Evaluated Responses Card */}
                    <Link href="/writewise/topics">
                        <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6">
                            <div className="text-4xl mb-3">📝</div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">My Essays</h2>
                            <p className="text-gray-600">
                                View all your essays and their detailed evaluation results with suggestions.
                            </p>
                            <div className="mt-4 text-blue-600 font-semibold">View Essays →</div>
                        </div>
                    </Link>

                    {/* Tips Card */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="text-4xl mb-3">💡</div>
                        <h2 className="text-2xl font-bold text-blue-900 mb-2">Tips</h2>
                        <ul className="text-blue-700 space-y-2">
                            <li>• Write regularly to improve your skills</li>
                            <li>• Review feedback carefully after each essay</li>
                            <li>• Check Analytics to track your progress</li>
                            <li>• Follow AI recommendations for targeted improvement</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function Page() {
    return <Layout content={<WritewiseDashboard />} />;
}
