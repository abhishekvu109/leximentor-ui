import {API_LEXIMENTOR_BASE_URL} from "@/constants";
import GetAllDrills from "@/components/data/GetAllDrills";
import DashboardCard from "@/components/widgets/DashboardCard";
import GetChallengeMetadata from "@/components/data/GetChallengeMetadata";
import React from "react"
import dynamic from "next/dynamic";

const PieChartWidget = dynamic(() => import("@/components/widgets/charts/PieChartWidget"), {
    ssr: false,
});

const BarChartWidget = dynamic(() => import("@/components/widgets/charts/BarChartWidget"), {
    ssr: false,
});


const DashboardStyleOne = ({getAllDrills}) => {
    return (<>
        <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="flex items-center justify-center  rounded-sm bg-gray-50 dark:bg-gray-800">
                <DashboardCard title="Words learnt"
                               amount="$12,500"
                               percentageChange="+24%"
                               changeText="since last week"
                               icon="M9 5v14m8-7h-2m0 0h-2m2 0v2m0-2v-2M3 11h6m-6 4h6m11 4H4c-.55228 0-1-.4477-1-1V6c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v12c0 .5523-.4477 1-1 1Z"
                               variant="orange"/>
            </div>
            <div className="flex items-center justify-center  rounded-sm bg-gray-50 dark:bg-gray-800">
                <DashboardCard title="Drill frequency"
                               amount="$12,500"
                               percentageChange="+24%"
                               changeText="since last week"
                               icon="M9 5v14m8-7h-2m0 0h-2m2 0v2m0-2v-2M3 11h6m-6 4h6m11 4H4c-.55228 0-1-.4477-1-1V6c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v12c0 .5523-.4477 1-1 1Z"
                               variant="yellow"/>
            </div>
            <div className="flex items-center justify-center  rounded-sm bg-gray-50 dark:bg-gray-800">
                <DashboardCard title="Avg. learning pace"
                               amount="$12,500"
                               percentageChange="+24%"
                               changeText="since last week"
                               icon="M9 5v14m8-7h-2m0 0h-2m2 0v2m0-2v-2M3 11h6m-6 4h6m11 4H4c-.55228 0-1-.4477-1-1V6c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v12c0 .5523-.4477 1-1 1Z"
                               variant="indigo"/>
            </div>
        </div>
        <div className="flex items-center justify-center px-4 py-4 rounded-sm bg-gray-50 dark:bg-gray-800">
            <GetAllDrills data={getAllDrills}></GetAllDrills>
        </div>
        <div className="flex flex-row rounded-2 gap-3 mt-4 items-center justify-center">
            <div className="basis-2/6 rounded-sm bg-gray-50 dark:bg-gray-800 p-4">
                <GetChallengeMetadata/>
            </div>
            <div className="basis-2/6 rounded-sm bg-gray-50 dark:bg-gray-800 p-2">
                <PieChartWidget/>
            </div>
            <div className="basis-2/6 rounded-sm  bg-gray-50 dark:bg-gray-800 p-2">
                <BarChartWidget/>
            </div>
        </div>
        {/*<div className="grid grid-cols-2 gap-4 mb-4">*/}
        {/*    <div className="flex items-center justify-center rounded-sm bg-gray-50 h-28 dark:bg-gray-800">*/}
        {/*        /!*<GetChallengeMetadata></GetChallengeMetadata>*!/*/}
        {/*    </div>*/}
        {/*    <div className="flex items-center justify-center rounded-sm bg-gray-50 h-28 dark:bg-gray-800">*/}
        {/*        <p className="text-2xl text-gray-400 dark:text-gray-500">*/}
        {/*            <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"*/}
        {/*                 fill="none" viewBox="0 0 18 18">*/}
        {/*                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"*/}
        {/*                      strokeWidth="2" d="M9 1v16M1 9h16"/>*/}
        {/*            </svg>*/}
        {/*        </p>*/}
        {/*    </div>*/}
        {/*    <div className="flex items-center justify-center rounded-sm bg-gray-50 h-28 dark:bg-gray-800">*/}
        {/*        <p className="text-2xl text-gray-400 dark:text-gray-500">*/}
        {/*            <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"*/}
        {/*                 fill="none" viewBox="0 0 18 18">*/}
        {/*                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"*/}
        {/*                      strokeWidth="2" d="M9 1v16M1 9h16"/>*/}
        {/*            </svg>*/}
        {/*        </p>*/}
        {/*    </div>*/}
        {/*    <div className="flex items-center justify-center rounded-sm bg-gray-50 h-28 dark:bg-gray-800">*/}
        {/*        <p className="text-2xl text-gray-400 dark:text-gray-500">*/}
        {/*            <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"*/}
        {/*                 fill="none" viewBox="0 0 18 18">*/}
        {/*                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"*/}
        {/*                      strokeWidth="2" d="M9 1v16M1 9h16"/>*/}
        {/*            </svg>*/}
        {/*        </p>*/}
        {/*    </div>*/}
        {/*</div>*/}
        {/*<div className="flex items-center justify-center h-48 mb-4 rounded-sm bg-gray-50 dark:bg-gray-800">*/}
        {/*    <p className="text-2xl text-gray-400 dark:text-gray-500">*/}
        {/*        <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"*/}
        {/*             viewBox="0 0 18 18">*/}
        {/*            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"*/}
        {/*                  d="M9 1v16M1 9h16"/>*/}
        {/*        </svg>*/}
        {/*    </p>*/}
        {/*</div>*/}
        {/*<div className="grid grid-cols-2 gap-4">*/}
        {/*    <div className="flex items-center justify-center rounded-sm bg-gray-50 h-28 dark:bg-gray-800">*/}
        {/*        <p className="text-2xl text-gray-400 dark:text-gray-500">*/}
        {/*            <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"*/}
        {/*                 fill="none" viewBox="0 0 18 18">*/}
        {/*                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"*/}
        {/*                      strokeWidth="2" d="M9 1v16M1 9h16"/>*/}
        {/*            </svg>*/}
        {/*        </p>*/}
        {/*    </div>*/}
        {/*    <div className="flex items-center justify-center rounded-sm bg-gray-50 h-28 dark:bg-gray-800">*/}
        {/*        <p className="text-2xl text-gray-400 dark:text-gray-500">*/}
        {/*            <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"*/}
        {/*                 fill="none" viewBox="0 0 18 18">*/}
        {/*                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"*/}
        {/*                      strokeWidth="2" d="M9 1v16M1 9h16"/>*/}
        {/*            </svg>*/}
        {/*        </p>*/}
        {/*    </div>*/}
        {/*    <div className="flex items-center justify-center rounded-sm bg-gray-50 h-28 dark:bg-gray-800">*/}
        {/*        <p className="text-2xl text-gray-400 dark:text-gray-500">*/}
        {/*            <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"*/}
        {/*                 fill="none" viewBox="0 0 18 18">*/}
        {/*                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"*/}
        {/*                      strokeWidth="2" d="M9 1v16M1 9h16"/>*/}
        {/*            </svg>*/}
        {/*        </p>*/}
        {/*    </div>*/}
        {/*    <div className="flex items-center justify-center rounded-sm bg-gray-50 h-28 dark:bg-gray-800">*/}
        {/*        <p className="text-2xl text-gray-400 dark:text-gray-500">*/}
        {/*            <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"*/}
        {/*                 fill="none" viewBox="0 0 18 18">*/}
        {/*                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"*/}
        {/*                      strokeWidth="2" d="M9 1v16M1 9h16"/>*/}
        {/*            </svg>*/}
        {/*        </p>*/}
        {/*    </div>*/}
        {/*</div>*/}
    </>);
};

export default DashboardStyleOne;

export async function getServerSideProps() {
    const [res] = await Promise.all([fetch(`${API_LEXIMENTOR_BASE_URL}/drill/metadata`)]); // Replace with your API endpoint

    const [getAllDrills] = await Promise.all([res.json(),]);

    return {
        props: {
            getAllDrills
        },
    };
}

