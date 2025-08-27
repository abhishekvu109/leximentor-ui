import {useEffect, useState} from "react";
import {API_LEXIMENTOR_BASE_URL} from "@/constants";

const GetChallengeMetadata = () => {
    const [drillChallengeAnalytics, setDrillChallengeAnalytics] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            const res1 = await fetch(`${API_LEXIMENTOR_BASE_URL}/analytics/drill/challenge/metadata`); // Replace with your API endpoint
            const getChallengeMetadata = await res1.json();
            setDrillChallengeAnalytics(getChallengeMetadata);
        };

        fetchData();
    }, []);
    return (<>

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-xs text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <caption className="caption-bottom text-xs text-center font-bold italic p-2 text-gray-700 dark:text-gray-300">
                    Drill Challenge Analytics Summary
                </caption>
                <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th scope="col" className="px-3 py-3 text-left">
                        Drill type
                    </th>
                    <th scope="col" className="px-3 py-3 text-left">
                        Count
                    </th>
                    <th scope="col" className="px-3 py-3 text-left">
                        Mean
                    </th>
                    <th scope="col" className="px-3 py-3 text-left">
                        Lowest
                    </th>
                    <th scope="col" className="px-3 py-3 text-left">
                        Highest
                    </th>
                </tr>
                </thead>
                <tbody>
                {(drillChallengeAnalytics.data != null && drillChallengeAnalytics.data.length > 0) ? (<>
                    {drillChallengeAnalytics.data.map((item, index) => (<tr key={item.drillType}
                                                                            className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                        <th scope="row"
                            className="px-3 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-left">{item.drillType}</th>
                        <td className="px-3 py-4 text-left">{item.drillCount}</td>
                        <td className="px-3 py-4 text-left">{item.avgScore}</td>
                        <td className="px-3 py-4 text-left">{item.lowestScore}</td>
                        <td className="px-3 py-4 text-left">{item.highestScore}</td>
                    </tr>))}
                </>) : (<>
                    <tr>
                        <td className="px-6 py-4 text-center">No drills found</td>
                    </tr>
                </>)}

                </tbody>
            </table>
        </div>
    </>);
};
export default GetChallengeMetadata;

