import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import writewiseService from '@/services/writewise.service';

const AnalyticsPage = () => {
    const [analytics, setAnalytics] = useState(null);
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [insightsLoading, setInsightsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('analytics');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await writewiseService.getInstantAnalytics();
            setAnalytics(response.data);
        } catch (err) {
            setError('Failed to load analytics. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateInsights = async () => {
        try {
            setInsightsLoading(true);
            setError(null);
            const response = await writewiseService.generateLlmInsights();
            setInsights(response.data);
            setActiveTab('insights');
        } catch (err) {
            setError('Failed to generate insights. Please try again.');
            console.error(err);
        } finally {
            setInsightsLoading(false);
        }
    };

    return (
        <Layout
            content={
                <div className="min-h-screen bg-gray-50 p-6">
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">Writing Analytics</h1>
                            <p className="text-gray-600">Understand your writing patterns and get personalized improvement insights</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                                {error}
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="mb-6 border-b border-gray-200">
                            <div className="flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('analytics')}
                                    className={`py-2 px-1 font-medium border-b-2 transition-colors ${
                                        activeTab === 'analytics'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Instant Analytics
                                </button>
                                <button
                                    onClick={() => setActiveTab('insights')}
                                    className={`py-2 px-1 font-medium border-b-2 transition-colors ${
                                        activeTab === 'insights'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    AI Insights {insights && '✓'}
                                </button>
                            </div>
                        </div>

                        {/* Analytics Tab */}
                        {activeTab === 'analytics' && (
                            <div className="space-y-6">
                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <p className="mt-4 text-gray-600">Loading analytics...</p>
                                    </div>
                                ) : analytics ? (
                                    <>
                                        {/* Summary Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <SummaryCard
                                                title="Total Essays"
                                                value={analytics.totalEssays}
                                                icon="📝"
                                            />
                                            <SummaryCard
                                                title="Average Score"
                                                value={`${analytics.overallAverageScore.toFixed(1)}/100`}
                                                icon="⭐"
                                            />
                                            <SummaryCard
                                                title="Improvement"
                                                value={`${analytics.improvementRate.toFixed(1)}%`}
                                                icon="📈"
                                            />
                                            <SummaryCard
                                                title="Essays Analyzed"
                                                value={analytics.scoreTrend.length}
                                                icon="📊"
                                            />
                                        </div>

                                        {/* Category Scores */}
                                        <div className="bg-white rounded-lg shadow p-6">
                                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Category Performance</h2>
                                            <div className="space-y-3">
                                                {Object.entries(analytics.categoryAverages)
                                                    .sort((a, b) => b[1] - a[1])
                                                    .map(([category, score]) => (
                                                        <div key={category}>
                                                            <div className="flex justify-between mb-1">
                                                                <span className="font-medium text-gray-700">{category}</span>
                                                                <span className="font-bold text-gray-900">{score.toFixed(1)}</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className={`h-2 rounded-full transition-all ${
                                                                        score >= 85 ? 'bg-green-500' : score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                                                    }`}
                                                                    style={{ width: `${Math.min(score, 100)}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>

                                        {/* Score Trend */}
                                        {analytics.scoreTrend.length > 0 && (
                                            <div className="bg-white rounded-lg shadow p-6">
                                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Score Trend</h2>
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full text-left text-sm">
                                                        <thead className="border-b border-gray-200">
                                                            <tr>
                                                                <th className="px-4 py-2 font-semibold text-gray-900">Essay</th>
                                                                <th className="px-4 py-2 font-semibold text-gray-900">Topic</th>
                                                                <th className="px-4 py-2 font-semibold text-gray-900">Score</th>
                                                                <th className="px-4 py-2 font-semibold text-gray-900">Date</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {analytics.scoreTrend.map((trend, idx) => (
                                                                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                                                    <td className="px-4 py-3">v{trend.versionNumber}</td>
                                                                    <td className="px-4 py-3 text-gray-700">{trend.topicName}</td>
                                                                    <td className="px-4 py-3">
                                                                        <span className="font-bold text-lg">{trend.score.toFixed(1)}</span>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-gray-600">
                                                                        {new Date(trend.date).toLocaleDateString()}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* Top Errors */}
                                        {analytics.topErrors.length > 0 && (
                                            <div className="bg-white rounded-lg shadow p-6">
                                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Top Errors</h2>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {analytics.topErrors.slice(0, 10).map((error, idx) => (
                                                        <div key={idx} className="border border-gray-200 rounded p-4">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <p className="font-semibold text-gray-900">{error.subType}</p>
                                                                    <p className="text-sm text-gray-600">{error.type}</p>
                                                                </div>
                                                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-bold">
                                                                    {error.count}x
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Strengths & Weaknesses */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {analytics.strengths.length > 0 && (
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                                    <h3 className="text-xl font-bold text-green-900 mb-3">✓ Strengths</h3>
                                                    <ul className="space-y-2">
                                                        {analytics.strengths.map((strength, idx) => (
                                                            <li key={idx} className="text-green-700">
                                                                • {strength} ({analytics.categoryAverages[strength]?.toFixed(1)})
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {analytics.weaknesses.length > 0 && (
                                                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                                    <h3 className="text-xl font-bold text-red-900 mb-3">⚠ Areas to Improve</h3>
                                                    <ul className="space-y-2">
                                                        {analytics.weaknesses.map((weakness, idx) => (
                                                            <li key={idx} className="text-red-700">
                                                                • {weakness} ({analytics.categoryAverages[weakness]?.toFixed(1)})
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                        {/* Generate Insights CTA */}
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                                            <h3 className="text-xl font-bold text-blue-900 mb-2">Get AI-Powered Insights</h3>
                                            <p className="text-blue-700 mb-4">
                                                Get personalized improvement recommendations powered by our AI writing coach.
                                            </p>
                                            <button
                                                onClick={handleGenerateInsights}
                                                disabled={insightsLoading}
                                                className={`px-6 py-2 rounded font-semibold transition-colors ${
                                                    insightsLoading
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                }`}
                                            >
                                                {insightsLoading ? 'Generating...' : 'Generate AI Insights'}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                                        <p className="text-yellow-800">No completed evaluations yet. Start writing to see your analytics!</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Insights Tab */}
                        {activeTab === 'insights' && (
                            <div className="space-y-6">
                                {insightsLoading ? (
                                    <div className="text-center py-12">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <p className="mt-4 text-gray-600">Generating personalized insights...</p>
                                    </div>
                                ) : insights ? (
                                    <div className="bg-white rounded-lg shadow p-8">
                                        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                                            {insights.insight}
                                        </div>
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <p className="text-sm text-gray-500">
                                                Generated on {new Date(insights.generatedAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleGenerateInsights}
                                            disabled={insightsLoading}
                                            className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition-colors"
                                        >
                                            Regenerate Insights
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                                        <p className="text-blue-800 mb-4">No insights generated yet. Click the button to generate AI-powered insights.</p>
                                        <button
                                            onClick={handleGenerateInsights}
                                            disabled={insightsLoading}
                                            className={`px-6 py-2 rounded font-semibold transition-colors ${
                                                insightsLoading
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                            }`}
                                        >
                                            {insightsLoading ? 'Generating...' : 'Generate AI Insights'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            }
        />
    );
};

const SummaryCard = ({ title, value, icon }) => (
    <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="text-4xl mb-2">{icon}</div>
        <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
);

export default function Page() {
    return <AnalyticsPage />;
}
