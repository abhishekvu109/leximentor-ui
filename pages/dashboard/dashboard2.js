import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import DashboardStyleOne from "@/components/widgets/DashboardStyleOne";
import { API_LEXIMENTOR_BASE_URL } from "@/constants";
import { fetchWithAuth } from "@/dataService";

const Dashboard2 = () => {
    const [data, setData] = useState({ data: [] });
    const [wordsData, setWordsData] = useState({ data: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const res = await fetchWithAuth(`${API_LEXIMENTOR_BASE_URL}/drill/metadata`);
                const result = await res.json();
                setData(result);

                if (result?.data && result.data.length > 0) {
                    const firstDrillId = result.data[0].refId;
                    const wordsRes = await fetchWithAuth(`${API_LEXIMENTOR_BASE_URL}/drill/metadata/sets/words/data/${firstDrillId}`);
                    const wData = await wordsRes.json();
                    setWordsData(wData);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadDashboardData();
    }, []);

    if (loading) return <Layout content={<div className="p-8 text-center text-slate-500 font-bold">Loading Dashboard...</div>} />;

    return <>
        <Layout content={<>
            <DashboardStyleOne getAllDrills={data} wordsData={wordsData} />
        </>} />
    </>
}
export default Dashboard2;


