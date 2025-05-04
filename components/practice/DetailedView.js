import axios from "axios";
import {API_LEXIMENTOR_BASE_URL, API_TEXT_TO_SPEECH} from "@/constants";
import {
    AntonymFlashcard,
    CircularProgressBar,
    CollapsibleWidget,
    MnemonicFlashcard,
    PronunciationFlashcard,
    Sources,
    SynonymFlashcard,
    WordFlashcard
} from "@/components/practice/VCDetailedViewComponents";
import Link from "next/link";
import {SpeakerWaveIcon} from "@heroicons/react/24/solid";
import {fetchData} from "@/dataService";
import {useEffect, useState} from "react";

const Main = ({drillSetData, wordMetadata, sourcesData}) => {
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
    const handleConvertToSpeech = async (text) => {
        try {
            const response = await axios.post(API_TEXT_TO_SPEECH, {text}, {responseType: 'arraybuffer'});
            const audioUrl = URL.createObjectURL(new Blob([response.data]));
            const audio = new Audio(audioUrl);
            await audio.play();
        } catch (error) {
            console.error('Error converting text to speech:', error);
        }
    };
    return (<>
        <div className="flex flex-col items-center">
            <div className="w-[50%] p-2 mt-2">
                <div className="grid grid-cols-2 gap-x-5 gap-y-5">
                    <div className="col-span-2">
                        <Sources allSources={sources} onClick={handleSources}/>
                        <hr className="my-2 border-dashed"/>
                    </div>
                    <div className="col-span-2">
                        <div className="flex flex-row">
                            <div className="w-1/4">
                                <div className="flex flex-col">
                                    <div className="basis-3/4">
                                        {/*Start of the progress information*/}
                                        <CircularProgressBar
                                            progressInfo={Math.round(((currentIndex + 1) / size) * 100)}></CircularProgressBar>
                                    </div>
                                    {/*Pronunciation speaker*/}
                                    <div className="basis-1/4 ml-11 mt-3">
                                        <div className="bg-blue-500 p-2 w-10 rounded-full shadow-md">
                                            <Link href="#"
                                                  onClick={() => handleConvertToSpeech(wordData.data.word)}><SpeakerWaveIcon
                                                className="size-6 text-white"/></Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-3/4">
                                <WordFlashcard word={wordData} meanings={["Meaning-1", "Meaning-2"]}></WordFlashcard>
                            </div>
                        </div>
                    </div>
                    <div>
                        <SynonymFlashcard word={wordData.data.word} synonyms={wordData.data.synonyms}/>
                    </div>
                    <div>
                        <AntonymFlashcard word={wordData.data.word} antonyms={wordData.data.antonyms}/>
                    </div>
                    <div>
                        <MnemonicFlashcard word={wordData.data.word} mnemonic={wordData.data.mnemonic}/>
                    </div>
                    <div>
                        <PronunciationFlashcard word={wordData.data.word} pronunciation={wordData.data.pronunciation}/>
                    </div>
                    <div className="col-span-2">
                        <div className="flex flex-row">
                            <div className="w-full">
                                <CollapsibleWidget body={wordData.data.examples}/>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-2">
                        <div className="flex">
                            <div className="w-full">
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 h-14 border rounded-3xl">
                                    <div className="flex items-center justify-between h-full px-4">
                                        {/* Previous Button */}
                                        <button type="button" data-modal-target="create-new-drill-modal-form"
                                                data-model-toggle="create-new-drill-modal-form" onClick={prevWord}
                                                className="px-4 py-2.5 text-base font-medium text-xs text-white inline-flex items-center bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-2xl text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                            <svg className="w-4 h-4 text-white me-2" aria-hidden="true"
                                                 xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                 fill="currentColor"
                                                 viewBox="0 0 24 24">
                                                <path fillRule="evenodd"
                                                      d="M13.729 5.575c1.304-1.074 3.27-.146 3.27 1.544v9.762c0 1.69-1.966 2.618-3.27 1.544l-5.927-4.881a2 2 0 0 1 0-3.088l5.927-4.88Z"
                                                      clipRule="evenodd"/>
                                            </svg>
                                            Prev
                                        </button>

                                        {/* Page Indicator */}
                                        <p className="text-center font-bold">{currentIndex + 1}/{size}</p>

                                        {/* Next Button */}
                                        <button type="button" data-modal-target="create-new-drill-modal-form"
                                                data-model-toggle="create-new-drill-modal-form" onClick={nextWord}
                                                className="px-4 py-2.5 text-base font-medium text-xs text-white inline-flex items-center bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-2xl text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                            Next
                                            <svg className="w-4 h-4 text-white me-2" aria-hidden="true"
                                                 xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                 fill="currentColor"
                                                 viewBox="0 0 24 24">
                                                <path fillRule="evenodd"
                                                      d="M10.271 5.575C8.967 4.501 7 5.43 7 7.12v9.762c0 1.69 1.967 2.618 3.271 1.544l5.927-4.881a2 2 0 0 0 0-3.088l-5.927-4.88Z"
                                                      clipRule="evenodd"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>);
}

const DetailedView = ({drillSetData, drillId, wordMetadata, sourcesData}) => {
    return (<>
        <Main wordMetadata={wordMetadata} drillSetData={drillSetData} sourcesData={sourcesData}/>
    </>);
}

export default DetailedView;