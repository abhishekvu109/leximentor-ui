import {useEffect, useState} from "react";
import WordFlashcard, {
    CircularProgressBar, Sources, Stepper
} from "@/components/practice/VCDetailedViewComponents";
import ProgressBar from "@/components/widgets/ProgressBar";
import axios from "axios";
import {API_LEXIMENTOR_BASE_URL, API_TEXT_TO_SPEECH} from "@/constants";
import {fetchData} from "@/dataService";
import Link from "next/link";
import {SpeakerWaveIcon} from "@heroicons/react/24/solid";

const Main = ({word, width = '20rem', height = '14rem'}) => {

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

        <div className="flex justify-center bg-gray-100">
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
const FlashcardView = ({drillSetData, drillId, wordMetadata, sourcesData}) => {
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
        <Sources allSources={sources} onClick={handleSources}/>
        <div className="flex flex-row my-2">
            <div>
                <CircularProgressBar progressInfo={Math.round(((currentIndex + 1) / size) * 100)}></CircularProgressBar>
            </div>
        </div>
        <div className="flex flex-row mb-2 p-2">
            {/*<button type="button" onClick={prevWord}*/}
            {/*        className="bg-blue-400 text-white font-bold  px-4 py-2 rounded-lg hover:bg-blue-700 mr-20">Prev*/}
            {/*</button>*/}
            <button onClick={prevWord}
                    className="relative mr-20 inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
                <span
                    className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                Prev
                </span>
            </button>
            {/*<button type="button" onClick={nextWord}*/}
            {/*        className="bg-blue-400 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 ml-20">Next*/}
            {/*</button>*/}
            <button onClick={nextWord}
                    className="relative ml-20 inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
                <span
                    className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                Next
                </span>
            </button>
        </div>
        <Main word={wordData}
              height="480px" width="600px"/>
    </>);
}

export default FlashcardView;