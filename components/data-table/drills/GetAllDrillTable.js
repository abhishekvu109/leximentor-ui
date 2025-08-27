import {API_LEXIMENTOR_BASE_URL} from "@/constants";
import Link from "next/link";
import {useCallback, useEffect, useState} from "react";

export const GetAllDrillTable = ({drillMetadata}) => {
    const [analyticsCache, setAnalyticsCache] = useState({});


    const GetDrillAnalytics = useCallback(async (drillRefId) => {
        if (analyticsCache[drillRefId]) return;

        try {
            const response = await fetch(`${API_LEXIMENTOR_BASE_URL}/analytics/drill/${drillRefId}`, {
                method: 'GET', headers: {'Content-Type': 'application/json'}
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            setAnalyticsCache(prev => ({
                ...prev, [drillRefId]: {
                    avgScore: data.data.avgDrillScore,
                    wordCount: data.data.countOfWordsLearned,
                    challengeCount: data.data.countOfChallenges
                }
            }));
        } catch (error) {
            console.error('Error:', error);
        }
    }, [analyticsCache, setAnalyticsCache]);

    useEffect(() => {
        drillMetadata.data?.forEach(item => {
            GetDrillAnalytics(item.refId);
        });
    }, [drillMetadata.data, GetDrillAnalytics]);
    const NameTags = ({apiText}) => {
        apiText = String(apiText || '');
        // Extract and clean keywords
        const keywords = apiText.match(/"([^"]+)"/g)?.map((str) => str.replace(/"/g, '')) || [];

        return (<div className="flex flex-wrap gap-2">
            {keywords.map((word, index) => (<span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
            >
          {word}
        </span>))}
        </div>);
    }

    const RemoveDrill = async (drillRefId) => {
        try {
            const response = await fetch(`${API_LEXIMENTOR_BASE_URL}/drill/metadata/${drillRefId}`, {
                method: 'DELETE', headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Response data:', data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const GenerateName = async (drillRefId) => {
        try {
            const response = await fetch(`${API_LEXIMENTOR_BASE_URL}/drill/metadata/assign-name/${drillRefId}`, {
                method: 'POST', headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Response data:', data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (<>
        <div className="grid grid-cols-3 gap-4">
            <div className="col-span-3">
                <table className="w-full text-xs text-left rtl:text-right text-gray-500 dark:text-gray-400 shadow-md sm:rounded-lg">
                    <caption
                        className="caption-bottom text-xm text-center font-bold italic p-2 text-gray-700 dark:text-gray-300">
                        List of all the word drills
                    </caption>
                    <thead
                        className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-center">
                            Serial
                        </th>
                        <th scope="col" className="px-6 py-3 text-center">
                            ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-center">
                            Drill Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-center">
                            Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-center">
                            Avg Score
                        </th>
                        <th scope="col" className="px-6 py-3 text-center">
                            Total words
                        </th>
                        <th scope="col" className="px-6 py-3 text-center">
                            Total Challenges
                        </th>
                        <th scope="col" className="px-6 py-3 text-center">
                            LEARN
                        </th>
                        <th scope="col" className="px-6 py-3 text-center">
                            CHALLENGE
                        </th>
                        <th scope="col" className="px-6 py-3 text-center">
                            Remove
                        </th>
                        <th scope="col" className="px-6 py-3 text-center">
                            Generate name
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {(drillMetadata.data != null && drillMetadata.data.length > 0) ? (<>
                        {drillMetadata.data.map((item, index) => (<tr key={item.refId}
                                                                      className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                            <th scope="row"
                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center">{index + 1}</th>
                            <td className="px-6 py-4 text-center">{item.refId}</td>
                            <td className="px-6 py-4 text-center">
                                <Link data-popover-target={item.refId} data-popover-placement="bottom" href="#"
                                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                    {(item.namedObjectDTO != null && item.namedObjectDTO.name != null && item.namedObjectDTO.name != '') ? item.namedObjectDTO.name : <>-</>}
                                </Link>
                                {(item.namedObjectDTO != null && item.namedObjectDTO.name != null && item.namedObjectDTO.name != '') ? <>
                                    <div data-popover id={item.refId} role="tooltip"
                                         className="absolute z-10
                                             invisible inline-block
                                             w-1/3 text-sm text-gray-500
                                             transition-opacity duration-300
                                             bg-white border border-gray-200
                                             rounded-lg shadow-xs opacity-0
                                             dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800">
                                        <div
                                            className="px-3 py-2 bg-gray-100 border-b border-gray-200 rounded-t-lg dark:border-gray-600 dark:bg-gray-700">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{item.namedObjectDTO.name}</h3>
                                        </div>
                                        {item.namedObjectDTO.description != null && item.namedObjectDTO.description != '' ? <>
                                            <div className="px-3 py-2">
                                                <h4 className="font-bold text-black/60 text-left mb-1">Description</h4>
                                                <p className="text-justify">{item.namedObjectDTO.description}</p>
                                            </div>
                                            <hr className="my-2 mx-2 border-dashed"/>
                                        </> : <></>}

                                        {item.namedObjectDTO.tags != null && item.namedObjectDTO.tags != '' ? <>
                                            <div className="px-3 py-2">
                                                <h4 className="font-bold text-black/60 text-left mb-2">Tags</h4>
                                                <NameTags
                                                    apiText={item.namedObjectDTO.tags}/>
                                            </div>
                                            <hr className="my-2 mx-2 border-dashed"/>
                                        </> : <></>}

                                        <div className="px-3 py-2">
                                            <h4 className="font-bold text-black/60 text-left mb-2">Genre</h4>
                                            <p className="text-justify">{item.namedObjectDTO.genre}</p>
                                        </div>
                                        <hr className="my-2 mx-2 border-dashed"/>
                                        <div className="px-3 py-2">
                                            <h4 className="font-bold text-black/60 text-left mb-2">Genre</h4>
                                            <p className="text-justify">{item.namedObjectDTO.subGenre}</p>
                                        </div>
                                        <div data-popper-arrow></div>
                                    </div>
                                </> : <>-</>}

                            </td>
                            <td className="px-6 py-4 text-center">{item.status}</td>
                            <td className="px-6 py-4 text-center">{analyticsCache[item.refId]?.avgScore ?? '...'}</td>
                            <td className="px-6 py-4 text-center">
                                {analyticsCache[item.refId]?.wordCount ?? '...'}
                            </td>
                            <td className="px-6 py-4 text-center">
                                {analyticsCache[item.refId]?.challengeCount ?? '-'}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <Link href={"/drills/learning/practice/" + item.refId}
                                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                    Click
                                </Link>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <Link href={"/challenges/" + item.refId}
                                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                    Click
                                </Link>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <Link href="#" onClick={() => RemoveDrill(item.refId)}
                                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                    Click
                                </Link>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <Link href="#" onClick={() => GenerateName(item.refId)}
                                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                    Click
                                </Link>
                            </td>
                        </tr>))}
                    </>) : (<>
                        <tr>
                            <td className="px-6 py-4 text-center">No drills found</td>
                        </tr>
                    </>)}

                    </tbody>
                </table>
            </div>
        </div>
    </>);
}