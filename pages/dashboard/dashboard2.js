import Layout from "@/components/layout/Layout";
import DashboardStyleOne from "@/components/widgets/DashboardStyleOne";
import { API_LEXIMENTOR_BASE_URL } from "@/constants";

const Dashboard2 = ({ data, wordsData }) => {
    return <>
        <Layout content={<>
            <DashboardStyleOne getAllDrills={data} wordsData={wordsData} />
        </>} />
    </>
}
export default Dashboard2;

export async function getServerSideProps() {
    try {
        const res = await fetch(`${API_LEXIMENTOR_BASE_URL}/drill/metadata`);
        const data = await res.json();

        let wordsData = { data: [] };
        if (data?.data && data.data.length > 0) {
            // Fetch words from the first drill to populate Lexi-Discover
            const firstDrillId = data.data[0].refId;
            const wordsRes = await fetch(`${API_LEXIMENTOR_BASE_URL}/drill/metadata/sets/words/data/${firstDrillId}`);
            wordsData = await wordsRes.json();
        }

        return {
            props: {
                data,
                wordsData
            },
        };
    } catch (e) {
        console.error("Error fetching dashboard data:", e);
        return {
            props: {
                data: { data: [] },
                wordsData: { data: [] }
            },
        };
    }
}


