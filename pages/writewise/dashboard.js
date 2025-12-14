import Layout from "@/components/layout/Layout";

const WritewiseDashboard = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Writewise Dashboard</h1>
            <p className="text-gray-500">This feature is coming soon.</p>
        </div>
    );
};

export default function Page() {
    return <Layout content={<WritewiseDashboard />} />;
}
