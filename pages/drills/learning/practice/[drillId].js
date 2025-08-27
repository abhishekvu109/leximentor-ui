import Layout from "@/components/layout/Layout";
import {useEffect, useState} from "react";
import {fetchData} from "@/dataService";
import {API_LEXIMENTOR_BASE_URL} from "@/constants";
import FlashcardView from "@/components/practice/FlashcardView";
import DetailedView from "@/components/practice/DetailedView";
// import {DetailedView} from "@/pages/drills/learning/practice/DetailedView";
// import {FlashcardView} from "@/pages/drills/learning/practice/FlashcardView";

export default function VocabularyCard({drillSetData, drillId, wordMetadata, sourcesData}) {
    const [isToggleChecked, setIsToggleChecked] = useState(false);
    const [isRendering, setIsRendering] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined" && window.initFlowbite) {
            window.initFlowbite();
        }
    }, []);

    const handleToggle = () => {
        setIsRendering(true);
        setTimeout(() => {
            setIsToggleChecked(prev => !prev);
            setIsRendering(false);
        }, 300); // delay to allow transition
    };

    return (<Layout content={<>
            <div className="flex flex-row justify-center text-center">
                <div className="w-[20%] py-2 px-2 mb-2 justify-items-center">
                    <label className="inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isToggleChecked}
                            onChange={handleToggle}
                        />
                        <div
                            className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4
                peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700
                peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full
                peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px]
                after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full
                after:h-5 after:w-5 after:transition-all dark:border-gray-600
                peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"
                        ></div>
                        <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                {isToggleChecked ? 'Turn off to Detailed view' : 'Turn on to Flashcard view'}
              </span>
                    </label>
                </div>
            </div>

            <div
                className={`transition duration-300 ease-in-out transform 
            ${isRendering ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                {isToggleChecked ? (<FlashcardView
                        drillSetData={drillSetData}
                        sourcesData={sourcesData}
                        wordMetadata={wordMetadata}
                    />) : (<DetailedView
                        drillId={drillId}
                        drillSetData={drillSetData}
                        sourcesData={sourcesData}
                        wordMetadata={wordMetadata}
                    />)}
            </div>
        </>}/>);
}
// export default function VocabularyCard({drillSetData, drillId, wordMetadata, sourcesData}) {
//     const [isToggleChecked, setIsToggleChecked] = useState(false);
//     useEffect(() => {
//         // Run only once on mount to initialize all Flowbite components
//         if (typeof window !== 'undefined' && window.initFlowbite) {
//             window.initFlowbite();
//         }
//     }, []);
//
//     useEffect(() => {
//         // Wait for DOM to render, then initialize popover
//         if (typeof window !== 'undefined' && window.initFlowbite) {
//             window.initFlowbite(); // This re-initializes all Flowbite components
//         }
//     }, [isToggleChecked]);
//     const handleToggle = () => {
//         setIsToggleChecked(!isToggleChecked);
//         console.log("After the toggle"+JSON.stringify(wordMetadata));
//     };
//
//
//     return (<Layout content={<>
//         <div className="flex flex-row justify-center text-center">
//             <div className="w-[20%] py-2 px-2 mb-2 border border-gray-300 justify-items-center">
//                 <label className="inline-flex items-center cursor-pointer">
//                     <input
//                         type="checkbox"
//                         className="sr-only peer"
//                         checked={isToggleChecked}
//                         onChange={handleToggle}
//                     />
//                     <div
//                         className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
//                     <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
//                   {isToggleChecked ? 'Turn off to Detailed view' : 'Turn on to Flashcard view'}
//                 </span>
//                 </label>
//             </div>
//         </div>
//         {isToggleChecked ? <><FlashcardView drillSetData={drillSetData}
//                                             sourcesData={sourcesData}
//                                             wordMetadata={wordMetadata}/></> : <><DetailedView drillId={drillId}
//                                                                                                drillSetData={drillSetData}
//                                                                                                sourcesData={sourcesData}
//                                                                                                wordMetadata={wordMetadata}/></>}
//
//     </>}/>);
// }

export async function getServerSideProps(context) {
    const {drillId} = context.params;
    const drillSetData = await fetchData(`${API_LEXIMENTOR_BASE_URL}/drill/metadata/sets/${drillId}`);
    const sourcesData = await fetchData(`${API_LEXIMENTOR_BASE_URL}/inventory/words/${drillSetData.data[0].wordRefId}/sources`);
    const wordMetadata = await fetchData(`${API_LEXIMENTOR_BASE_URL}/inventory/words/${drillSetData.data[0].wordRefId}/sources/${sourcesData.data[0]}`);
    return {
        props: {
            drillSetData, drillId, wordMetadata, sourcesData,
        },
    };
}