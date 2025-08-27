import {useEffect, useRef, useState} from 'react';
import Layout from "@/components/layout/Layout";
import {fetchData, ModelData} from "@/dataService";
import {API_WRITEWISE_BASE_URL} from "@/constants";
import HorizontalTabInterface from "@/components/widgets/tabs/HorizontalTabInterface";
import Dropdown from "@/components/form/DropDown";
import FloatingBox from "@/components/widgets/FloatingBox/FloatingBox";

// const feedbackData = {
//     grammar: {
//         title: 'Grammar',
//         score: 75,
//         color: 'blue',
//         comments: [
//             'Awkward phrasing and unclear structure in some sentences.',
//             'Sentence: “Its role has evolved…” needs restructuring.'
//         ],
//         suggestions: [
//             'Rephrase to: “Platforms like Twitter have transformed discourse…”',
//             'Change “Many users don’t verify…” → “Users often fail to verify…”'
//         ]
//     },
//     spelling: {
//         title: 'Spelling',
//         score: 90,
//         color: 'purple',
//         comments: [
//             'Minor inconsistencies like “media” vs. “social media”',
//             'All key terms are spelled correctly'
//         ],
//         suggestions: ['Use “media” consistently for a sophisticated tone']
//     },
//     punctuation: {
//         title: 'Punctuation',
//         score: 85,
//         color: 'rose',
//         comments: [
//             'Overuse of commas in introduction',
//             'Could benefit from more strategic colons or em dashes'
//         ],
//         suggestions: ['Consider using a colon after strong summary statements']
//     },
//     vocabulary: {
//         title: 'Vocabulary',
//         score: 70,
//         color: 'green',
//         comments: [
//             'Repetitive use of “discourse”',
//             'Could benefit from more advanced or academic terms'
//         ],
//         suggestions: ['Replace “discourse” with synonyms like “debate” or “conversation”']
//     },
//     style: {
//         title: 'Style & Tone',
//         score: 78,
//         color: 'yellow',
//         comments: ['Clear and informative, but lacks strong engagement'],
//         suggestions: ['Use rhetorical devices and active voice for better impact']
//     },
//     creativity: {
//         title: 'Creativity',
//         score: 65,
//         color: 'indigo',
//         comments: ['Lacks original insight or deep analysis'],
//         suggestions: ['Add unique perspectives or compare with historical trends']
//     }
// };
//
// const HLEvaluationResult = () => {
//     const [activeTab, setActiveTab] = useState('grammar');
//     const feedback = feedbackData[activeTab];
//
//     return (
//         <div className="flex items-center justify-center px-2 py-2">
//             <div
//                 className="w-full rounded-2xl border border-dashed border-black/50 bg-white p-6 transition-all duration-500 ease-in-out border-1">
//                 <h1 className="mb-6 text-center text-2xl font-bold text-gray-800 animate-fade-in">High-Level Evaluation
//                     Results</h1>
//
//                 {/* Tabs */}
//                 <div className="mb-6 flex flex-wrap justify-center space-x-2">
//                     {Object.keys(feedbackData).map((key) => (
//                         <button
//                             key={key}
//                             onClick={() => setActiveTab(key)}
//                             className={`transform transition-all duration-300 hover:scale-105 active:scale-95 px-4 py-2 rounded-full font-medium text-sm ${
//                                 activeTab === key
//                                     ? `bg-${feedbackData[key].color}-100 text-${feedbackData[key].color}-700`
//                                     : 'bg-gray-200 text-gray-700'
//                             }`}
//                         >
//                             {feedbackData[key].title}
//                         </button>
//                     ))}
//                 </div>
//
//                 {/* Feedback Content with animation */}
//                 <div className="transition-all duration-500 ease-out animate-fade-in">
//                     <h2 className={`text-xl font-semibold text-${feedback.color}-700 mb-2`}>
//                         {feedback.title} – Score: {feedback.score}
//                     </h2>
//                     <div className={`bg-${feedback.color}-50 p-4 rounded-xl mb-4 shadow-sm animate-slide-up`}>
//                         <p className={`font-semibold text-sm text-${feedback.color}-800 mb-1`}>Comments:</p>
//                         <ul className={`text-sm text-${feedback.color}-900 list-disc list-inside space-y-1`}>
//                             {feedback.comments.map((comment, idx) => (
//                                 <li key={idx} className="opacity-90 animate-fade-in">{comment}</li>
//                             ))}
//                         </ul>
//                     </div>
//                     <div className="rounded-xl bg-white p-4 shadow-inner delay-200 animate-slide-up">
//                         <p className={`font-semibold text-sm text-${feedback.color}-800 mb-1`}>Suggestions:</p>
//                         <ul className="list-inside list-disc text-sm text-gray-800 space-y-1">
//                             {feedback.suggestions.map((suggestion, idx) => (
//                                 <li key={idx} className="opacity-90 animate-fade-in">{suggestion}</li>
//                             ))}
//                         </ul>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }


const MainView = ({data}) => {
    const [model, setModel] = useState('')
    const [topic, setTopic] = useState((data != null && data.data != null && data.data.topic != null) ? data.data.topic : null);
    const [responseVersion] = useState((data != null && data.data.responseVersionDTOs != null && data.data.responseVersionDTOs.length > 0) ? data.data.responseVersionDTOs[0] : null);
    const [evaluations, setEvaluations] = useState((responseVersion != null && responseVersion.evaluations != null && responseVersion.evaluations.length > 0) ? responseVersion.evaluations : []);
    const [evaluation, setEvaluation] = useState(evaluations[0]);
    const assessmentParam = ["Grammar", "Spelling", "Punctuation", "Vocabulary", "Style & Tone", "Creativity & Thinking"];
    const assessmentParamMap = {
        "Grammar": "grammar",
        "Spelling": "spelling",
        "Punctuation": "punctuation",
        "Vocabulary": "vocabulary",
        "Style & Tone": "styleAndTone",
        "Creativity & Thinking": "creativityAndThinking",
    }
    const models = [];
    if (evaluations != null && evaluations.length > 0) {
        for (let i = 0; i < evaluations.length; i++) {
            models.push(evaluations[i].evaluator);
        }
    }
    const handleSelection = (item) => {
        setModel(item);
        const evaluationData = evaluations.find(eval_data => eval_data.evaluator === item);
        setEvaluation(evaluationData);
    };

    const HLEvaluationResult = () => {
        const [activeTab, setActiveTab] = useState(assessmentParam[0]);
        const highLevelResult = evaluation.evaluationResult[assessmentParamMap[activeTab]];
        return (<div className="flex items-center justify-center px-2 py-2">
            <div
                className="w-full rounded-2xl border border-dashed border-black/50 bg-white p-6 transition-all duration-500 ease-in-out border-1">

                <div className="flex flex-col gap-y-3">
                    <div>
                        <div className="flex flex-row items-center justify-between">
                            {/* Left Section: H1 and FloatingBox */}
                            <div className="flex items-center gap-2 ml-2">
                                <h1 className="text-2xl font-bold text-gray-800 animate-fade-in">
                                    {topic.topic}
                                </h1>
                                <FloatingBox
                                    header={topic.topic}
                                    content={<>
                                        <p className="text-sm/snug font-light text-justify">
                                            {responseVersion.response}
                                        </p>
                                    </>}
                                    buttonLabel={`User Response`}
                                />
                            </div>

                            {/* Right Section: Score */}
                            <span
                                className="inline-flex items-center justify-center w-12 h-12 mr-2 text-md font-semibold text-white bg-green-600 rounded-full animate-pulse">
      {highLevelResult.score}
    </span>
                        </div>
                    </div>

                    <div>
                        <div
                            className="border-dotted bg-gray-100 p-3 text-justify italic rounded-2 border-3 text-md">
                            <ul className="list-inside list-decimal text-gray-500 space-y-1 dark:text-gray-400">
                                {topic.points != null && topic.points.length > 0 && topic.points.map((item, index) => (
                                    <li key={index}>{item}</li>))}
                            </ul>
                        </div>

                    </div>
                    <div>
                        {/* Tabs */}
                        <div className="mb-6 flex flex-wrap justify-center space-x-2 mt-3">
                            {assessmentParam.map((key) => (<button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`transform transition-all duration-300 hover:scale-105 active:scale-95 px-4 py-2 rounded-full font-medium text-md ${activeTab === key ? `bg-blue-100 text-black-700` : 'bg-gray-200 text-gray-700'}`}
                            >
                                {key}
                                <span
                                    class="inline-flex items-center justify-center w-6 h-6 ml-4 text-xs font-semibold text-white bg-blue-600 rounded-full">
                                    {evaluation.evaluationResult[assessmentParamMap[key]].score}
                                </span>
                            </button>))}
                        </div>


                        {/* Feedback Content with animation */}
                        <div className="transition-all duration-500 ease-out animate-fade-in">
                            <div className={`bg-blue-50 p-4 rounded-l-xl 
                                                    border-l-8
                                                    border-l-blue-500 
                                                    border-y-2 
                                                    border-r-2
                                                    border-r-black/10
                                                    border-y-black/10 
                                                    mb-4 shadow-sm animate-slide-up`}>
                                <p className={`font-semibold text-lg text-black-800 mb-3 ml-4`}>Comments:</p>
                                <ul className={`text-xs/5 text-black-900 list-disc list-inside space-y-1`}>
                                    {highLevelResult.comments.map((comment, idx) => (
                                        <li key={idx} className="opacity-90 animate-fade-in">{comment}</li>))}
                                </ul>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-l-xl
                                                    border-l-8
                                                    border-l-blue-500
                                                    border-y-2
                                                    border-r-2
                                                    border-r-black/10
                                                    border-y-black/10
                                                    mb-4 shadow-sm animate-slide-up">
                                <p className={`font-semibold text-lg text-black-800 mb-3 ml-4`}>Alternate
                                    Suggestions:</p>
                                <ul className={`text-xs/5 text-black-900 list-disc list-inside space-y-1`}>
                                    {highLevelResult.alternateSuggestion.map((suggestion, idx) => (
                                        <li key={idx} className="opacity-90 animate-fade-in">{suggestion}</li>))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>);
    }

    const LLEvaluationResult = () => {
        const [activeTab, setActiveTab] = useState(assessmentParam[0]);
        const highLevelResult = evaluation.evaluationResult[assessmentParamMap[activeTab]];
        return (<div className="flex items-center justify-center px-2 py-2">
            <div
                className="w-full rounded-2xl border border-dashed border-black/50 bg-white p-6 transition-all duration-500 ease-in-out border-1">

                <div className="flex flex-col gap-y-3">
                    <div>
                        <div className="flex flex-row justify-between items-center">
                            <h1 className="text-lg font-bold text-gray-800 ml-2 animate-fade-in">
                                {topic.topic}
                            </h1>
                            <span
                                className="inline-flex items-center justify-center w-12 h-12 ml-4 mr-2 text-md font-semibold text-white bg-green-600 rounded-full animate-pulse">
                                {highLevelResult.score}
                            </span>
                        </div>

                    </div>
                    <div>
                        <div
                            className="border-dotted bg-gray-100 p-3 text-justify italic rounded-2 border-3 text-md">
                            <ul className="list-inside list-decimal text-gray-500 space-y-1 dark:text-gray-400">
                                {topic.points != null && topic.points.length > 0 && topic.points.map((item, index) => (
                                    <li key={index}>{item}</li>))}
                            </ul>
                        </div>

                    </div>
                    <div>
                        {/* Tabs */}
                        <div className="mb-6 flex flex-wrap justify-center space-x-2 mt-3">
                            {assessmentParam.map((key) => (<button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`transform transition-all duration-300 hover:scale-105 active:scale-95 px-4 py-2 rounded-full font-medium text-md ${activeTab === key ? `bg-blue-100 text-black-700` : 'bg-gray-200 text-gray-700'}`}
                            >
                                {key}
                                <span
                                    class="inline-flex items-center justify-center w-6 h-6 ml-4 text-xs font-semibold text-white bg-blue-600 rounded-full">
                                    {evaluation.evaluationResult[assessmentParamMap[key]].score}
                                </span>
                            </button>))}
                        </div>


                        {/* Feedback Content with animation */}
                        <div className="transition-all duration-500 ease-out animate-fade-in">
                            <div className={`bg-blue-50 p-4 rounded-l-xl 
                                                    border-l-8
                                                    border-l-blue-500 
                                                    border-y-2 
                                                    border-r-2
                                                    border-r-black/10
                                                    border-y-black/10 
                                                    mb-4 shadow-sm animate-slide-up`}>
                                <p className={`font-semibold text-lg text-black-800 mb-3 ml-4`}>Comments:</p>
                                <ul className={`text-xs/5 text-black-900 list-disc list-inside space-y-1`}>
                                    {highLevelResult.comments.map((comment, idx) => (
                                        <li key={idx} className="opacity-90 animate-fade-in">{comment}</li>))}
                                </ul>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-l-xl
                                                    border-l-8
                                                    border-l-blue-500
                                                    border-y-2
                                                    border-r-2
                                                    border-r-black/10
                                                    border-y-black/10
                                                    mb-4 shadow-sm animate-slide-up">
                                <p className={`font-semibold text-lg text-black-800 mb-3 ml-4`}>Alternate
                                    Suggestions:</p>
                                <ul className={`text-xs/5 text-black-900 list-disc list-inside space-y-1`}>
                                    {highLevelResult.alternateSuggestion.map((suggestion, idx) => (
                                        <li key={idx} className="opacity-90 animate-fade-in">{suggestion}</li>))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>);
    }

    const AnnotatedTextPage = () => {
        const containerRef = useRef(null);

        const text = responseVersion.response;

        const errors = evaluation.errorList;

        const splitTextWithErrors = (text, errors) => {
            const segments = [];
            let currentIndex = 0;
            errors.sort((a, b) => a.start - b.start);

            for (const err of errors) {
                if (currentIndex < err.start) {
                    segments.push({text: text.slice(currentIndex, err.start)});
                }
                segments.push({
                    text: text.slice(err.start, err.end), error: true, data: err,
                });
                currentIndex = err.end;
            }
            if (currentIndex < text.length) {
                segments.push({text: text.slice(currentIndex)});
            }
            return segments;
        };

        useEffect(() => {
            const container = containerRef.current;
            const segments = splitTextWithErrors(text, errors);
            container.innerHTML = '';

            segments.forEach((seg) => {
                if (!seg.error) {
                    container.appendChild(document.createTextNode(seg.text));
                } else {
                    const span = document.createElement('span');
                    span.className = 'relative group cursor-pointer text-pink-600 font-semibold border-b-2 border-dotted border-pink-500';

                    const textNode = document.createTextNode(seg.text);
                    span.appendChild(textNode);

                    const tooltip = document.createElement('div');
                    tooltip.className = "absolute z-50 hidden group-hover:flex flex-col bg-white text-gray-800 text-sm rounded-xl p-4 w-80 bottom-full left-1/2 transform -translate-x-1/2 mb-3 shadow-xl border border-gray-200 transition-opacity duration-300 ease-in-out group-hover:opacity-100 before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-transparent before:border-t-white";

                    tooltip.innerHTML = `
          <div class="font-semibold mb-1 text-pink-600">${seg.data.type} - ${seg.data.subType}</div>
          <div><strong>Incorrect:</strong> ${seg.data.incorrectText}</div>
          <div><strong>Corrected:</strong> ${seg.data.correctedText}</div>
          <div class="mt-2 text-sm text-gray-600">${seg.data.explanation}</div>
        `;

                    span.appendChild(tooltip);
                    container.appendChild(span);
                }
            });
        }, []);

        return (<div className="min-h-screen bg-gray-100 py-12 px-6 flex justify-center items-start">
                <div className="bg-white shadow-lg rounded-xl p-8 max-w-4xl w-full">
                    <h1 className="text-2xl font-bold mb-6 text-gray-800">Annotated Writing with Error Highlights</h1>
                    <p ref={containerRef} className="text-gray-700 text-lg leading-relaxed whitespace-pre-line"></p>
                </div>
            </div>);
    };


    return (<>
        <Layout content={<>
            <div className="mb-2">
                <Dropdown
                    onSelect={handleSelection}
                    label="Choose Model"
                    items={models}
                />
            </div>
            <HorizontalTabInterface
                tabs={[{
                    id: 'HighLevelResult',
                    label: 'High-Level Result',
                    content: (<><HLEvaluationResult/></>)
                }, {
                    id: 'LowLevelResult',
                    label: 'Low-Level Result',
                    content: (<><LLEvaluationResult/></>)
                }, {id: 'Annotations', label: 'Annotations', content: (<><AnnotatedTextPage/></>)},]}
            />

        </>}/>
    </>);
}
export default MainView;

export async function getServerSideProps(context) {
    const {params} = context;

    // Accessing the array of values
    const ids = params.ids;
    const responseRefId = ids[0];
    const versionRefId = ids[1];

    // response_by_responseRefId_and_versionRefId
    const data = await fetchData(`${API_WRITEWISE_BASE_URL}/v1/responses/response/${responseRefId}/versions/version/${versionRefId}`)

    return {
        props: {
            data
        },
    };
}