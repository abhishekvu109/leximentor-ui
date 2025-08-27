import {useEffect, useState} from "react";
import {CircularProgressBar, Sources} from "@/components/practice/VCDetailedViewComponents";
import {API_LEXIMENTOR_BASE_URL} from "@/constants";
import {fetchData} from "@/dataService";

const Main = ({word, width = '20rem', height = '14rem'}) => {
    console.log("The word is :"+JSON.stringify(word));
    const [flipped, setFlipped] = useState(false);

    const wrapperStyle = {
        perspective: '1000px', width, height,
    };

    const cardStyle = {
        width: '100%',
        height: '100%',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.7s ease-in-out',
        transform: flipped ? 'rotateY(180deg)' : 'none',
    };

    const faceStyle = {
        backfaceVisibility: 'hidden', width: '100%', height: '100%',
    };

    const backStyle = {
        ...faceStyle, transform: 'rotateY(180deg)',
    };
    return (<>

        <div className="flex justify-center">
            <div
                className="relative cursor-pointer"
                onClick={() => setFlipped(!flipped)}
                style={wrapperStyle}
            >
                <div className="relative" style={cardStyle}>
                    {/* Front Face */}
                    <div
                        className="absolute rounded-xl bg-gradient-to-r from-gray-200 to-black/5 shadow-md flex items-center justify-center text-5xl font-bold text-black/65"
                        style={faceStyle}
                    >
                        {word.data != null && word.data.word ? word.data.word : <>Dummy</>}
                    </div>

                    {/* Back Face */}
                    <div
                        className=" flex flex-col justify-center rounded-xl bg-blue-50 shadow-md p-4 text-sm text-gray-800 text-center"
                        style={backStyle}
                    >
                        <h2 className="text-blue-800 font-semibold mb-1 text-lg">Meaning</h2>
                        <p className="text-lg text-black/65">
                            {(word.data != null && word.data.meanings != null && word.data.meanings.length > 0) ? word.data.meanings.map((item, index) => (<>
                                <li key={item}>{item.meaning}</li>
                            </>)) : <>
                                <li>No meanings found</li>
                            </>}
                        </p>
                        <hr className="h-px my-3 bg-black/55 dark:bg-gray-700"/>
                        <h2 className="text-blue-800 font-semibold mb-1 text-lg">Local Meaning</h2>
                        <p className="text-lg text-black/65">{word.data.localMeaning}</p>
                        <hr className="h-px my-3 bg-black/55 dark:bg-gray-700"/>
                        <h2 className="text-blue-800 font-semibold mb-1 text-lg">Part of Speech</h2>
                        <p className="text-lg text-black/65 italic">The word
                            is: {word.data != null && word.data.partsOfSpeeches.length > 0 ? (<>
                                {word.data.partsOfSpeeches.map((item, index) => (<>
                                    <b key={item}>{item.pos} </b>
                                </>))}
                            </>) : (<></>)}</p>
                        <hr className="h-px my-3 bg-black/55 dark:bg-gray-700"/>
                        <h2 className="text-blue-800 font-semibold mb-1 text-lg">Mnemonic</h2>
                        <p className="text-lg text-black/65">🧠 {word.data.mnemonic}</p>
                    </div>
                </div>
            </div>
        </div>

    </>);
}

// const Progress = ({ currentIndex, size }) => {
//     const [animate, setAnimate] = useState(false);
//     const percentage = Math.round(((currentIndex + 1) / size) * 100);
//
//     useEffect(() => {
//         setAnimate(true);
//         const timeout = setTimeout(() => setAnimate(false), 500); // Animation lasts 500ms
//         return () => clearTimeout(timeout);
//     }, [percentage]);
//
//     return (
//         <div
//             className={`w-[65%] text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 transition-colors duration-500 ${
//                 animate ? "bg-green-500" : ""
//             }`}
//         >
//             {percentage}% Done
//         </div>
//     );
// };
const Progress = ({ currentIndex, size }) => {
    const [animate, setAnimate] = useState(false);
    const percentage = Math.round(((currentIndex + 1) / size) * 100);

    useEffect(() => {
        setAnimate(true);
        const timeout = setTimeout(() => setAnimate(false), 500);
        return () => clearTimeout(timeout);
    }, [percentage]);

    return (
        <div
            className={`w-[65%] text-white ${
                animate ? "bg-green-500" : "bg-indigo-400"
            } hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 transition-colors duration-500`}
        >
            {percentage}% Done
        </div>
    );
};
const FlashcardView = ({drillSetData, wordMetadata, sourcesData}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [size, setSize] = useState(drillSetData.data.length);
    const [drillMetadata, setDrillMetadata] = useState(drillSetData);
    const [wordData, setWordData] = useState(wordMetadata);
    const [sources, setSources] = useState(sourcesData);
    const [source, setSource] = useState(sourcesData.data[0]);

    const handleSources = (value) => {
        setSource(value);
    };

    const fetchWordData = async (wordId, source) => {
        const wordDataResponse = await fetchData(`${API_LEXIMENTOR_BASE_URL}/inventory/words/${wordId}/sources/${source}`);
        const sourcesDataResponse = await fetchData(`${API_LEXIMENTOR_BASE_URL}/inventory/words/${wordId}/sources`);
        setWordData(wordDataResponse);
        setSources(sourcesDataResponse);
    };

    useEffect(() => {
        fetchWordData(drillMetadata.data[currentIndex].wordRefId, source);
    }, [currentIndex, source, drillMetadata]);

    const prevWord = () => {
        setCurrentIndex((currentIndex - 1 + size) % size);
    };

    const nextWord = () => {
        setCurrentIndex((currentIndex + 1) % size);
    };

    return (<>
        <div className="flex flex-col items-center">
            <div className="w-[40%] p-2 mt-2">
                <div className="grid grid-cols-3 gap-x-5 gap-y-3">
                    <div className="col-span-3">
                        <Sources allSources={sources} onClick={handleSources}/>
                        <hr className="border-dashed border-1 my-2"/>
                    </div>
                    <div className="col-span-3">
                        <div className="flex flex-row justify-center">
                            <div>
                                <button type="button" onClick={prevWord}
                                        className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Prev
                                </button>
                            </div>
                            <div className="w-1/2 justify-items-center">
                                <Progress currentIndex={currentIndex} size={size}/>
                                {/*<div className="w-[65%] text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">{Math.round(((currentIndex + 1) / size) * 100)}% Completed</div>*/}
                            </div>
                            <div>
                                <button type="button" onClick={nextWord}
                                        className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Next
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-3">
                        <Main word={wordData} height="500px" width="600px"/>
                    </div>
                </div>
            </div>
        </div>
    </>);
}

export default FlashcardView;