import dynamic from 'next/dynamic';
import Script from "next/script";
import Head from "next/head";
import {API_LEXIMENTOR_BASE_URL} from "@/constants";
import DashboardCard from "@/components/widgets/DashboardCard";

const Drills = dynamic(() => import("../../components/data/GetAllDrills"), {ssr: false});

export default function Home({data}) {
    return (<>
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></Script>
        <Head></Head>
        <div className="flex flex-row">
            <div className="flex-auto">
                <DashboardCard title="REVENUE"
                               amount="$12,500"
                               percentageChange="+24%"
                               changeText="since last week"
                               icon="M9 5v14m8-7h-2m0 0h-2m2 0v2m0-2v-2M3 11h6m-6 4h6m11 4H4c-.55228 0-1-.4477-1-1V6c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v12c0 .5523-.4477 1-1 1Z"
                               variant="orange"/>
            </div>
            <div className="flex-auto">
                <DashboardCard title="REVENUE"
                               amount="$12,500"
                               percentageChange="+24%"
                               changeText="since last week"
                               icon="M9 5v14m8-7h-2m0 0h-2m2 0v2m0-2v-2M3 11h6m-6 4h6m11 4H4c-.55228 0-1-.4477-1-1V6c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v12c0 .5523-.4477 1-1 1Z"
                               variant="yellow"/>
            </div>
            <div className="flex-auto">
                <DashboardCard title="REVENUE"
                               amount="$12,500"
                               percentageChange="+24%"
                               changeText="since last week"
                               icon="M9 5v14m8-7h-2m0 0h-2m2 0v2m0-2v-2M3 11h6m-6 4h6m11 4H4c-.55228 0-1-.4477-1-1V6c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v12c0 .5523-.4477 1-1 1Z"
                               variant="indigo"/>
            </div>
            <div className="flex-auto">
                <DashboardCard title="REVENUE"
                               amount="$12,500"
                               percentageChange="+24%"
                               changeText="since last week"
                               icon="M9 5v14m8-7h-2m0 0h-2m2 0v2m0-2v-2M3 11h6m-6 4h6m11 4H4c-.55228 0-1-.4477-1-1V6c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v12c0 .5523-.4477 1-1 1Z"
                               variant="red"/>
            </div>
        </div>
        <Drills data={data}/>
    </>);
}

export async function getServerSideProps() {
    // Fetch data from your API endpoint
    const res = await fetch(`${API_LEXIMENTOR_BASE_URL}/drill/metadata`); // Replace with your API endpoint
    const data = await res.json();


    // Pass data to the component via props
    return {
        props: {
            data
        },
    };
}