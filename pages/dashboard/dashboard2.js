import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import DashboardStyleOne from "@/components/widgets/DashboardStyleOne";
import leximentorService from "../../services/leximentor.service";

const Dashboard2 = () => {
    const [data, setData] = useState({ data: [] });
    const [wordsData, setWordsData] = useState({ data: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const result = await leximentorService.getDrillsMetadata();
                setData(result);

                if (result?.data && result.data.length > 0) {
                    const firstDrillId = result.data[0].refId;
                    const wData = await leximentorService.getDrillSetWords(firstDrillId);
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


