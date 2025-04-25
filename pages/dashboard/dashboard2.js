import Layout from "@/components/layout/Layout";
import DashboardStyleOne from "@/components/widgets/DashboardStyleOne";
import {API_LEXIMENTOR_BASE_URL} from "@/constants";

const Dashboard2 = ({data}) => {
    return <>
        <Layout content={<>
            <DashboardStyleOne getAllDrills={data}/>
        </>}/>
    </>
}
export default Dashboard2;

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


