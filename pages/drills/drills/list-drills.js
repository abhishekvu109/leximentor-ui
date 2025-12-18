import GetAllDrills from "@/components/data/GetAllDrills";
import { API_LEXIMENTOR_BASE_URL } from "@/constants";
import Layout from "@/components/layout/Layout";

export default function ListDrills({ data }) {
    return <Layout content={<>
        <GetAllDrills data={data} />
    </>} />
}
export async function getServerSideProps() {
    // Fetch data from your API endpoint
    const res = await fetch(`${API_LEXIMENTOR_BASE_URL}/drill/metadata`); // Replace with your API endpoint
    const data = await res.json();

    // Pass data to the component via props
    return {
        props: {
            data,
        },
    };
}