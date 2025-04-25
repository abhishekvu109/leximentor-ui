import {API_LEXIMENTOR_BASE_URL} from "@/constants";
import Link from "next/link";

const EvaluationReport = ({evaluationReportData, challengeId}) => {
    return (<>
        <div className="alert alert-dark w-full font-bold text-center" role="alert">
            <h1 className="mb-4 text-2xl font-extrabold text-gray-900 dark:text-white md:text-5xl lg:text-6xl"><span
                className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">Evaluation</span> Report.
            </h1>
        </div>
        <div className="flex flex-row justify-center m-5 bg-red-50">
            <div className="grid grid-cols-10 gap-2 mx-2 w-full">
                <div>
                    <Link href="/dashboard/dashboard">
                        <button type="button"
                                className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Dashboard
                        </button>
                    </Link>
                </div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
        <div className="flex flex-row justify-center m-16 bg-blue-100 border-1">
            <div className="grid grid-cols-6 gap-2 m-2 w-3/4">
                <div><p className="text-sm font-medium text-gray-900 dark:text-white">Passed</p>
                </div>
                <div>{(evaluationReportData.data.passed) ? (<><span
                    className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-green-400 border border-green-400">Passed</span></>) : (<>
                    <span
                        className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-red-400 border border-red-400">Failed</span></>)}</div>
                <div><p className="text-sm font-medium text-gray-900 dark:text-white">Evaluator</p></div>
                <div><span
                    className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-400 border border-gray-500">{evaluationReportData.data.evaluator}</span>
                </div>
                <div><p className="text-sm font-medium text-gray-900 dark:text-white">Drill Type</p></div>
                <div><span
                    className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-400 border border-gray-500">{evaluationReportData.data.drillType}</span>
                </div>
                <div><p className="text-sm font-medium text-gray-900 dark:text-white">Score</p></div>
                <div><span
                    className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-400 border border-gray-500">{evaluationReportData.data.score}</span>
                </div>
                <div><p className="text-sm font-medium text-gray-900 dark:text-white">Total Correct</p></div>
                <div><span
                    className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-400 border border-gray-500">{evaluationReportData.data.totalCorrect}</span>
                </div>
                <div><p className="text-sm font-medium text-gray-900 dark:text-white">Total Incorrect</p></div>
                <div><span
                    className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-400 border border-gray-500">{evaluationReportData.data.totalIncorrect}</span>
                </div>
            </div>
        </div>
        {(evaluationReportData.data != null && evaluationReportData.data.drillEvaluationDTOS != null && evaluationReportData.data.drillEvaluationDTOS.length > 0) ? (evaluationReportData.data.drillEvaluationDTOS.map((item, index) => (<>
            <div
                className={(item.drillChallengeScoresDTO.correct != true) ? "flex flex-row my-2 m-16 bg-red-100 border-1" : "flex flex-row my-2 m-16 bg-green-100 border-1"}>
                <div className="grid grid-cols-12 gap-2 m-2 w-full">
                    <div className="col-span-1"><p
                        className="text-sm font-medium text-gray-900 dark:text-white">Question</p>
                    </div>
                    <div className="col-span-11"><span
                        className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-400 border border-gray-500">{item.drillChallengeScoresDTO.question}</span>
                    </div>
                    <div className="col-span-1"><p
                        className="text-sm font-medium text-gray-900 dark:text-white">Response</p></div>
                    <div className="col-span-11"><span
                        className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-400 border border-gray-500">{item.drillChallengeScoresDTO.response}</span>
                    </div>
                    <div className="col-span-1"><p
                        className="text-sm font-medium text-gray-900 dark:text-white">Correct</p></div>
                    <div className="col-span-11"><span
                        className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-400 border border-gray-500">{(item.drillChallengeScoresDTO.correct == true) ? "Yes" : "No"}</span>
                    </div>
                    <div className="col-span-1"><p
                        className="text-sm font-medium text-gray-900 dark:text-white">Evaluator response</p></div>
                    <div className="col-span-11">
                        <p className="text-sm text-gray-900 dark:text-white">{item.reason}</p>
                        {/*<span className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-400 border border-gray-500">{item.reason}</span>*/}
                    </div>
                    <div className="col-span-1"><p
                        className="text-sm font-medium text-gray-900 dark:text-white">Confidence</p></div>
                    <div className="col-span-11"><span
                        className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-400 border border-gray-500">{item.confidence}</span>
                    </div>
                </div>
            </div>
        </>))) : (<>
            <h1 className="mb-4 text-3xl font-extrabold text-gray-900 dark:text-white md:text-5xl lg:text-6xl"><span
                className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">No Data</span> Found.
            </h1>
        </>)}
    </>);
};
export default EvaluationReport;

export async function getServerSideProps(context) {
    const {challengeId} = context.params;
    const res = await fetch(`${API_LEXIMENTOR_BASE_URL}/drill/metadata/challenges/challenge/${challengeId}/report`); // Replace with your API endpoint
    const evaluationReportData = await res.json();
    // Pass data to the component via props
    return {
        props: {
            evaluationReportData, challengeId
        },
    };
}
