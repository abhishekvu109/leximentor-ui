import {StarIcon} from "@heroicons/react/24/solid";
import {useState} from "react";

export const CircularProgressBar = ({progressInfo}) => {
    const progress = progressInfo;
    const dashArray = 100;
    const dashOffset = 100 - progress;
    return (<>
        <div className="relative w-32 h-32">
            <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 36 36">
                <path
                    className="text-gray-200 stroke-current"
                    strokeWidth="2"
                    fill="none"
                    d="M18 2.0845
         a 15.9155 15.9155 0 0 1 0 31.831
         a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                    className="text-blue-500 stroke-current"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="100"
                    strokeDashoffset={100 - progress}
                    d="M18 2.0845
         a 15.9155 15.9155 0 0 1 0 31.831
         a 15.9155 15.9155 0 0 1 0 -31.831"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-semibold">{progress}%</span>
                <span className="text-xs text-gray-600">Intermediate</span>
            </div>
        </div>
    </>);
}
export const WordPanel = ({word}) => {

    return (<>
        <div
            className="flex-1 relative bg-gradient-to-r from-indigo-300 to-blue-500 text-white p-6 rounded-3xl shadow-lg flex justify-between items-center h-full w-full">
            <div>
                <h1 className="text-5xl font-bold">{word.data != null && word.data.word ? word.data.word : <>Dummy</>}</h1>
                <p data-popover-target="popover-pos" data-popover-placement="top" data-popover-trigger="hover"
                   className="mt-4 text-sm text-black/50 bg-gray-100 px-3 py-1 rounded-2 inline-block hover:bg-gray-200 hover:text-black">POS</p>
                <div data-popover id="popover-pos" role="tooltip"
                     className="absolute z-10 invisible inline-block w-64 text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-xs opacity-0 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800">
                    <div
                        className="px-3 py-2 bg-blue-100 border-b border-gray-200 rounded-t-lg dark:border-gray-600 dark:bg-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Parts Of Speech</h3>
                    </div>
                    <div className="px-3 py-2">
                        <p>The word is: {word.data != null && word.data.partsOfSpeeches.length > 0 ? (<>
                            {word.data.partsOfSpeeches.map((item, index) => (<>
                                <b key={item}>{item.pos} </b>
                            </>))}
                        </>) : (<></>)}</p>
                    </div>
                    <div data-popper-arrow></div>
                </div>

                <p data-popover-target="popover-lang" data-popover-placement="top"
                   className="mt-4 ml-2 text-sm text-black/50 bg-gray-100 px-3 py-1 rounded-2 inline-block hover:bg-gray-200 hover:text-black">Language</p>
                <div data-popover id="popover-lang" role="tooltip"
                     className="absolute z-10 invisible inline-block w-64 text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-xs opacity-0 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800">
                    <div
                        className="px-3 py-2 bg-blue-100 border-b border-gray-200 rounded-t-lg dark:border-gray-600 dark:bg-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Word Language</h3>
                    </div>
                    <div className="px-3 py-2">
                        <p>The word is in: {word.data != null && word.data.language ? (<>
                            <b>{word.data.language}</b>
                        </>) : (<></>)}</p>
                    </div>
                    <div data-popper-arrow></div>
                </div>

                <p data-popover-target="popover-local-meaning" data-popover-placement="top"
                   className="mt-4 ml-2 text-sm text-black/50 bg-gray-100 px-3 py-1 rounded-2 inline-block hover:bg-gray-200 hover:text-black">Local</p>
                <div data-popover id="popover-local-meaning" role="tooltip"
                     className="absolute z-10 invisible inline-block w-64 text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-xs opacity-0 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800">
                    <div
                        className="px-3 py-2 bg-blue-100 border-b border-gray-200 rounded-t-lg dark:border-gray-600 dark:bg-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Local Meaning</h3>
                    </div>
                    <div className="px-3 py-2">
                        <p>In the local dictionary the meaning of the word is
                            : {word.data != null && word.data.localMeaning ? (<>
                                <b>{word.data.localMeaning}</b>
                            </>) : (<></>)}</p>
                    </div>
                    <div data-popper-arrow></div>
                </div>

                <p data-popover-target="popover-category" data-popover-placement="top"
                   className="mt-4 ml-2 text-sm text-black/50 bg-gray-100 px-3 py-1 rounded-2 inline-block hover:bg-gray-200 hover:text-black">Category</p>
                <div data-popover id="popover-category" role="tooltip"
                     className="absolute z-10 invisible inline-block w-64 text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-xs opacity-0 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800">
                    <div
                        className="px-3 py-2 bg-blue-100 border-b border-gray-200 rounded-t-lg dark:border-gray-600 dark:bg-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Category</h3>
                    </div>
                    <div className="px-3 py-2">
                        <p>Category : {word.data != null && word.data.category ? (<>
                            <b>{word.data.category}</b>
                        </>) : (<></>)}</p>
                    </div>
                    <div data-popper-arrow></div>
                </div>

            </div>
            <div className="absolute top-5 right-10 bg-yellow-200 p-2 rounded-full shadow-md">
                <StarIcon className="size-6 text-yellow-600"/>
            </div>
        </div>
    </>);
}

export const WordFlashcard = ({word, meanings}) => {
    const [flipped, setFlipped] = useState(false);

    return (<div className="w-full h-full [perspective:1000px]" onClick={() => setFlipped(!flipped)}>
        <div
            className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}
        >
            {/* Front */}
            <div className="absolute w-full h-full [backface-visibility:hidden] cursor-pointer">
                <WordPanel word={word}/>
            </div>

            {/* Back */}
            <div
                className="absolute p-4 w-full h-full justify-start bg-gradient-to-r from-blue-100 to-blue-50 rounded-3xl shadow-md flex border-1  text-gray-800 text-xl [backface-visibility:hidden] [transform:rotateY(180deg)] cursor-pointer">
                {meanings != null && meanings.length > 0 ? (<>
                    <ul className="mt-2 space-y-1 list-disc list-inside text-lg">
                        {(word.data != null && word.data.meanings != null && word.data.meanings.length > 0) ? word.data.meanings.map((item, index) => (<>
                            <li key={item}>{item.meaning}</li>
                        </>)) : meanings.map((item, index) => (<>
                            <li key={item}>{item}</li>
                        </>))}
                    </ul>
                </>) : (<></>)}
            </div>
        </div>
    </div>);
}

export const SynonymFlashcard = ({word, synonyms}) => {
    const [flipped, setFlipped] = useState(false);
    return (<div
        onClick={() => setFlipped(!flipped)}
        className="w-full h-48 [perspective:1000px]"
    >
        <div
            className={`relative w-full h-full justify-content-center transition-transform duration-700 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>

            {/* Front Side */}
            <div
                className="absolute w-full h-full rounded-3xl border-1 bg-gradient-to-r from-gray-50 to-gray-100 text-white p-3 shadow-md flex flex-col justify-between [backface-visibility:hidden] cursor-pointer">
                <div className="flex justify-between">
                    {/*<h1 className="text-3xl font-bold text-black-50">Synonyms</h1>*/}
                    <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Synonyms</h5>
                    <div className="bg-gray-100 rounded-2">
                        {/*<CheckIcon className="h-4 w-4 text-white"/>*/}
                        <span>
                                    <svg className="w-10 h-10 text-blue-700 dark:text-white font-bold"
                                         aria-hidden="true"
                                         xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                                         viewBox="0 0 24 24">
                                      <path fillRule="evenodd"
                                            d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z"
                                            clipRule="evenodd"/>
                                    </svg>

                        </span>
                    </div>

                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-justify">Synonyms are words that mean the
                    same or
                    almost the same as other words. They help you say
                    things in different ways and make your speaking and writing more interesting.</p>
            </div>

            {/* Back Side */}
            <div
                className="absolute w-full h-full rounded-3xl border-1 bg-white text-gray-800 shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)] cursor-pointer">
                <div className="flex flex-col">
                    <div
                        className="basis-1/4 rounded-top-3 text-center font-bold font-sans text-2xl border-b-2 border-gray-200">
                        <div className="p-2">
                            {(word == '' || word == null) ? <>Word</> : <>{word}</>}
                        </div>
                    </div>
                    <div className="basis-3/4">
                        <div className="flex flex-wrap gap-2 p-1 mt-2">
                            {(synonyms && synonyms.length > 1 ? synonyms : [{synonym: "dummy"}, {synonym: "placeholder"}, {synonym: "example"}]).map((item, index) => (
                                <span key={index}
                                      className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded-2 border-1">
                            {item.synonym}
                          </span>))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>);
}
export const AntonymFlashcard = ({word, antonyms}) => {
    const [flipped, setFlipped] = useState(false);

    return (<div
        onClick={() => setFlipped(!flipped)}
        className="w-full h-48 [perspective:1000px]"
    >
        <div
            className={`relative w-full h-full justify-content-center transition-transform duration-700 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>

            {/* Front Side */}
            <div
                className="absolute w-full h-full rounded-3xl border-1 bg-gradient-to-r from-gray-50 to-gray-100 text-white p-3 shadow-md flex flex-col justify-between [backface-visibility:hidden] cursor-pointer">
                <div className="flex justify-between">
                    {/*<h1 className="text-3xl font-bold text-black-50">Synonyms</h1>*/}
                    <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Antonyms</h5>
                    <div className="bg-gray-100 rounded-2">
                        {/*<CheckIcon className="h-4 w-4 text-white"/>*/}
                        <span>

                            <svg className="w-10 h-10 text-blue-700 dark:text-white font-bold" aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                                 viewBox="0 0 24 24">
                              <path fillRule="evenodd"
                                    d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm5.757-1a1 1 0 1 0 0 2h8.486a1 1 0 1 0 0-2H7.757Z"
                                    clipRule="evenodd"/>
                            </svg>
                        </span>
                    </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-justify">Antonyms are words that mean the
                    opposite of
                    other words. They help you show contrast or differences in meaning, making your speech or writing
                    clearer and more interesting.</p>
            </div>

            {/* Back Side */}
            <div
                className="absolute w-full h-full rounded-3xl border-1 bg-white text-gray-800 shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)] cursor-pointer">
                <div className="flex flex-col">
                    <div
                        className="basis-1/4 rounded-top-3 text-center font-bold font-sans text-2xl border-b-2 border-gray-200">
                        <div className="p-2">
                            {(word == '' || word == null) ? <>Word</> : <>{word}</>}
                        </div>
                    </div>
                    <div className="basis-3/4">
                        <div className="flex flex-wrap gap-2 p-1 mt-2">
                            {(antonyms && antonyms.length > 1 ? antonyms : [{antonym: "dummy"}, {antonym: "placeholder"}, {antonym: "example"}]).map((item, index) => (
                                <span
                                    key={index}
                                    className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded-2 border-1"
                                >
                            {item.antonym}
                          </span>))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>);
}
export const MnemonicFlashcard = ({word, mnemonic}) => {
    const [flipped, setFlipped] = useState(false);

    return (<div
        onClick={() => setFlipped(!flipped)}
        className="w-full h-48 [perspective:1000px]"
    >
        <div
            className={`relative w-full h-full justify-content-center transition-transform duration-700 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>

            {/* Front Side */}
            <div
                className="absolute w-full h-full rounded-3xl border-1 bg-gradient-to-r from-gray-50 to-gray-100 text-white p-3 shadow-md flex flex-col justify-between [backface-visibility:hidden] cursor-pointer">
                <div className="flex justify-between">
                    {/*<h1 className="text-3xl font-bold text-black-50">Synonyms</h1>*/}
                    <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Mnemonic</h5>
                    <div className="bg-gray-100 rounded-2">
                        {/*<CheckIcon className="h-4 w-4 text-white"/>*/}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                             className="w-10 h-10 text-blue-700 dark:text-white font-bold">
                            <path
                                d="M12 .75a8.25 8.25 0 0 0-4.135 15.39c.686.398 1.115 1.008 1.134 1.623a.75.75 0 0 0 .577.706c.352.083.71.148 1.074.195.323.041.6-.218.6-.544v-4.661a6.714 6.714 0 0 1-.937-.171.75.75 0 1 1 .374-1.453 5.261 5.261 0 0 0 2.626 0 .75.75 0 1 1 .374 1.452 6.712 6.712 0 0 1-.937.172v4.66c0 .327.277.586.6.545.364-.047.722-.112 1.074-.195a.75.75 0 0 0 .577-.706c.02-.615.448-1.225 1.134-1.623A8.25 8.25 0 0 0 12 .75Z"/>
                            <path fillRule="evenodd"
                                  d="M9.013 19.9a.75.75 0 0 1 .877-.597 11.319 11.319 0 0 0 4.22 0 .75.75 0 1 1 .28 1.473 12.819 12.819 0 0 1-4.78 0 .75.75 0 0 1-.597-.876ZM9.754 22.344a.75.75 0 0 1 .824-.668 13.682 13.682 0 0 0 2.844 0 .75.75 0 1 1 .156 1.492 15.156 15.156 0 0 1-3.156 0 .75.75 0 0 1-.668-.824Z"
                                  clipRule="evenodd"/>
                        </svg>

                    </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-justify">Mnemonics are memory tricks that
                    help you
                    remember information easily. They use patterns, short phrases, or associations to make learning
                    things like spelling, facts, or lists simpler.</p>
            </div>

            {/* Back Side */}
            <div
                className="absolute w-full h-full rounded-3xl border-1 bg-white text-gray-800 shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)] cursor-pointer">
                <div className="flex flex-col">
                    <div
                        className="basis-1/4 rounded-top-3 text-center font-bold font-sans text-2xl border-b-2 border-gray-200">
                        <div className="p-2">
                            {(word == '' || word == null) ? <>Word</> : <>{word}</>}
                        </div>
                    </div>
                    <div className="basis-3/4">
                        <div className="flex flex-wrap gap-2 p-1 mt-2">
                            {mnemonic == null || mnemonic == '' ? <></> :
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-justify">{mnemonic}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>);
}


export const PronunciationFlashcard = ({word, pronunciation}) => {
    const [flipped, setFlipped] = useState(false);

    return (<div
        onClick={() => setFlipped(!flipped)}
        className="w-full h-48 [perspective:1000px]"
    >
        <div
            className={`relative w-full h-full justify-content-center transition-transform duration-700 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>

            {/* Front Side */}
            <div
                className="absolute w-full h-full rounded-3xl border-1 bg-gradient-to-r from-gray-50 to-gray-100 text-white p-3 shadow-md flex flex-col justify-between [backface-visibility:hidden] cursor-pointer">
                <div className="flex justify-between">
                    {/*<h1 className="text-3xl font-bold text-black-50">Synonyms</h1>*/}
                    <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Pronunciation</h5>
                    <div className="bg-gray-100 rounded-2">
                        {/*<CheckIcon className="h-4 w-4 text-white"/>*/}
                        <span>

                            <svg className="w-10 h-10 text-blue-700 dark:text-white font-bold" aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                                 viewBox="0 0 24 24">
                              <path
                                  d="M17.133 12.632v-1.8a5.406 5.406 0 0 0-4.154-5.262.955.955 0 0 0 .021-.106V3.1a1 1 0 0 0-2 0v2.364a.955.955 0 0 0 .021.106 5.406 5.406 0 0 0-4.154 5.262v1.8C6.867 15.018 5 15.614 5 16.807 5 17.4 5 18 5.538 18h12.924C19 18 19 17.4 19 16.807c0-1.193-1.867-1.789-1.867-4.175ZM6 6a1 1 0 0 1-.707-.293l-1-1a1 1 0 0 1 1.414-1.414l1 1A1 1 0 0 1 6 6Zm-2 4H3a1 1 0 0 1 0-2h1a1 1 0 1 1 0 2Zm14-4a1 1 0 0 1-.707-1.707l1-1a1 1 0 1 1 1.414 1.414l-1 1A1 1 0 0 1 18 6Zm3 4h-1a1 1 0 1 1 0-2h1a1 1 0 1 1 0 2ZM8.823 19a3.453 3.453 0 0 0 6.354 0H8.823Z"/>
                            </svg>
                        </span>

                    </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-justify">Pronunciation is the way we say a
                    word. It includes how each sound is spoken, such as vowels, consonants, stress. Good
                    pronunciation helps others understand you clearly when you speak.
                </p>
            </div>

            {/* Back Side */}
            <div
                className="absolute w-full h-full rounded-3xl border-1 bg-white text-gray-800 shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)] cursor-pointer">
                <div className="flex flex-col">
                    <div
                        className="basis-1/4 rounded-top-3 text-center font-bold font-sans text-2xl border-b-2 border-gray-200">
                        <div className="p-2">
                            {(word == '' || word == null) ? <>Word</> : <>{word}</>}
                        </div>
                    </div>
                    <div className="basis-3/4 justify-items-center">
                        <div className="flex flex-wrap gap-2 py-4 mt-2 text-center">
                            <h6 className="text-lg dark:text-white">{pronunciation == null || pronunciation == '' ? <>Dummy
                                pronunciation</> : pronunciation}</h6>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>);
}

export const Sources = ({allSources, onClick}) => {
    return (<>
        <div className="flex flex-row text-center">
            <div className="w-[100%]">
                {allSources.data != null && allSources.data.length > 0 ? (allSources.data.map((item, index) => (<>
                    <button
                        key={index}
                        type="button"
                        data-modal-target="create-new-drill-modal-form"
                        onClick={() => onClick(item)}
                        data-model-toggle="create-new-drill-modal-form"
                        className=" mr-2 px-4 py-2.5 text-base font-medium text-xs text-white bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                        {item}
                    </button>
                </>))) : (<p className="text-lg text-center">No sources found</p>)}
            </div>
        </div>
    </>);
};


export const CollapsibleWidget = ({heading, body}) => {
    const [open, setOpen] = useState(false);
    const togglePanel = () => {
        setOpen(!open);
    };

    return (<div className="w-full">
        {/* Button to toggle the panel */}
        <button
            onClick={togglePanel}
            className="w-full text-left rounded-t-md border-1 bg-gradient-to-r from-gray-50 to-gray-100 p-4 focus:outline-none transition duration-300 ease-in-out flex items-center justify-between"
        >
            <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{heading == '' || heading == null ? <>Example
                Usage</> : heading}</h5>
            {/* Arrow toggle */}
            <span className="text-xl">
          {open ? <>
              <svg className="w-10 h-10 text-blue-700 dark:text-white font-bold" aria-hidden="true"
                   xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd"
                        d="M5.575 13.729C4.501 15.033 5.43 17 7.12 17h9.762c1.69 0 2.618-1.967 1.544-3.271l-4.881-5.927a2 2 0 0 0-3.088 0l-4.88 5.927Z"
                        clipRule="evenodd"/>
              </svg>

          </> : <>
              <svg className="w-10 h-10 text-blue-700 dark:text-white font-bold" aria-hidden="true"
                   xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd"
                        d="M18.425 10.271C19.499 8.967 18.57 7 16.88 7H7.12c-1.69 0-2.618 1.967-1.544 3.271l4.881 5.927a2 2 0 0 0 3.088 0l4.88-5.927Z"
                        clipRule="evenodd"/>
              </svg>
          </>} {/* Up arrow when open, down when closed */}
        </span>
        </button>

        {/* Collapsible panel */}
        {open && (
            <div className="bg-white shadow-md p-4 border-1 rounded-b-3xl transition-all duration-300 ease-in-out">
                <ul className="max-w-md space-y-1 text-gray-500 list-inside dark:text-gray-400">
                    {body != null && body.length > 0 ? body.map((item, index) => (<>
                        <li key={index} className="flex items-center text-sm text-justify">
                            <svg className="w-3.5 h-3.5 me-2 text-blue-500 dark:text-blue-400 shrink-0"
                                 aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                            </svg>
                            {item.example}
                        </li>
                    </>)) : <>
                        <li className="flex items-center">
                            <svg className="w-3.5 h-3.5 me-2 text-green-500 dark:text-green-400 shrink-0"
                                 aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                            </svg>
                            At least 10 characters
                        </li>
                    </>}

                </ul>
            </div>)}
    </div>);
};

export const Stepper = () => {
    return (<>
        <div className="flex justify-center">
            <div className="w-3/4">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 h-14 border rounded-3xl">
                    <div className="flex items-center justify-between h-full px-4">
                        {/* Previous Button */}
                        <button type="button" data-modal-target="create-new-drill-modal-form"
                                data-model-toggle="create-new-drill-modal-form"
                                className="px-4 py-2.5 text-base font-medium text-xs text-white inline-flex items-center bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-2xl text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            <svg className="w-4 h-4 text-white me-2" aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                                 viewBox="0 0 24 24">
                                <path fill-rule="evenodd"
                                      d="M13.729 5.575c1.304-1.074 3.27-.146 3.27 1.544v9.762c0 1.69-1.966 2.618-3.27 1.544l-5.927-4.881a2 2 0 0 1 0-3.088l5.927-4.88Z"
                                      clip-rule="evenodd"/>
                            </svg>
                            Prev
                        </button>

                        {/* Page Indicator */}
                        <p className="text-center font-bold">1/14</p>

                        {/* Next Button */}
                        <button type="button" data-modal-target="create-new-drill-modal-form"
                                data-model-toggle="create-new-drill-modal-form"
                                className="px-4 py-2.5 text-base font-medium text-xs text-white inline-flex items-center bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-2xl text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            Next
                            <svg className="w-4 h-4 text-white me-2" aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
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
    </>);
}

export default WordFlashcard;