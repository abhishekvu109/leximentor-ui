import {useState} from "react";
import Script from "next/script";
import {API_LEXIMENTOR_BASE_URL} from "@/constants";
import {fetchData} from "@/dataService";
import Link from "next/link";

const LoadMeaningDrillChallenge = ({drillSetData, challengeId, drillRefId}) => {
    const [formData, setFormData] = useState(drillSetData.data.map(item => ({
        drillSetRefId: item.refId, drillChallengeRefId: challengeId, response: '',
    })));

    const [notificationVisible, setNotificationVisible] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState("");
    const [notificationSuccess, setNotificationSuccess] = useState(false);

    const NotificationClose = () => {
        setNotificationVisible(false);
    };
    const ShowNotification = ({isVisible, message, isSuccess}) => {
        if (isVisible) {
            if (!isSuccess) {
                return <>
                    <div id="alert-border-2"
                         className="flex items-center  p-4 mb-4 text-red-800 border-t-4 border-red-300 bg-red-50 dark:text-red-400 dark:bg-gray-800 dark:border-red-800"
                         role="alert">
                        <svg className="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                             fill="currentColor" viewBox="0 0 20 20">
                            <path
                                d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                        </svg>
                        <div className="ms-3 text-sm font-medium">
                            {message}
                        </div>
                        <button type="button" onClick={NotificationClose}
                                className="ms-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"
                                data-dismiss-target="#alert-border-2" aria-label="Close">
                            <span className="sr-only">Dismiss</span>
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                                 viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                      strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                        </button>
                    </div>
                </>
            } else {
                return <>
                    <div id="alert-border-3"
                         className="flex items-center p-4 mb-4 text-green-800 border-t-4 border-green-300 bg-green-50 dark:text-green-400 dark:bg-gray-800 dark:border-green-800"
                         role="alert">
                        <svg className="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                             fill="currentColor" viewBox="0 0 20 20">
                            <path
                                d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                        </svg>
                        <div className="ms-3 text-sm font-medium">
                            {message}
                        </div>
                        <button type="button" onClick={NotificationClose}
                                className="ms-auto -mx-1.5 -my-1.5 bg-green-50 text-green-500 rounded-lg focus:ring-2 focus:ring-green-400 p-1.5 hover:bg-green-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700"
                                data-dismiss-target="#alert-border-3" aria-label="Close">
                            <span className="sr-only">Dismiss</span>
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                                 viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                      strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                        </button>
                    </div>
                </>
            }

        }
    };

    const handleChange = (index, name, value) => {
        setFormData(prevFormData => {
            const updatedFormData = [...prevFormData];
            updatedFormData[index] = {...updatedFormData[index], [name]: value};
            return updatedFormData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);
        try {
            const URL = `${API_LEXIMENTOR_BASE_URL}/drill/metadata/challenges/challenge/${challengeId}/scores`;
            console.log('The URL is ' + URL)
            const response = await fetch(URL, {
                method: 'PUT', headers: {
                    'Content-Type': 'application/json',
                }, body: JSON.stringify(formData),
            });

            if (!response.ok) {
                setNotificationSuccess(false);
                setNotificationMessage("Network response was not ok");
                setNotificationVisible(true);
                throw new Error('Network response was not ok');
            }

            // Handle successful response
            const data = await response.json();
            console.log('Response data:', data);
            setNotificationSuccess(true);
            setNotificationMessage("Response has been updated.");
            setNotificationVisible(true);
        } catch (error) {
            console.error('Error:', error);
            setNotificationSuccess(false);
            setNotificationMessage("Network response was not ok " + error);
            setNotificationVisible(true);
        }
    };

    return (<>
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></Script>

        <div className="alert alert-dark w-full font-bold text-center" role="alert">
            Practice words and their meanings.
        </div>
        {notificationVisible ? (<ShowNotification isVisible={notificationVisible} isSuccess={notificationSuccess}
                                                  message={notificationMessage}/>) : (
            <ShowNotification isVisible={false} isSuccess={notificationSuccess}
                              message={notificationMessage}/>)}
        <div className="container mx-auto my-4 px-3 py-3 border-1 border-gray-300">
            <div className="flex flex-row ...">
                <div>
                    <Link href="/dashboard/dashboard">
                        <button type="button"
                                className="px-3 py-2 mr-3 text-xs font-medium text-center inline-flex items-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            <svg className="w-3 h-3 text-white me-2" aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg"
                                 fill="currentColor" viewBox="0 0 20 16">
                                <path fillRule="evenodd"
                                      d="M11.293 3.293a1 1 0 0 1 1.414 0l6 6 2 2a1 1 0 0 1-1.414 1.414L19 12.414V19a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-3h-2v3a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2v-6.586l-.293.293a1 1 0 0 1-1.414-1.414l2-2 6-6Z"
                                      clipRule="evenodd"/>
                            </svg>
                            Dashboard
                        </button>
                    </Link>
                </div>
                <div>
                    <Link href={`/challenges/${drillRefId}`}>
                        <button type="button"
                                className="px-3 py-2 mr-3 text-xs font-medium text-center inline-flex items-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            <svg className="w-4 h-4 text-white me-2" aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                                 viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M5 12h14M5 12l4-4m-4 4 4 4"/>
                            </svg>
                            Go back
                        </button>
                    </Link>

                </div>
            </div>
        </div>
        <form className="p-4 md:p-5" onSubmit={handleSubmit}>
            <div className="container border-1">
                <table className="table-auto w-full" cellPadding="10" cellSpacing="10">
                    <tbody>
                    {drillSetData.data.map((item, index) => (<>
                        <tr className="bg-blue-300 border-2 border-blue-600" key={index}>
                            <td>
                                <label className="font-semibold mr-3 my-2">Word:</label>
                                <label>{item.word}</label>
                            </td>
                        </tr>
                        <tr className="bg-gray-100 border-2 border-gray-600" key={`${item.refId}-response`}>
                            <td>
                                <input
                                    type="text"
                                    name="refId"
                                    value={item.refId}
                                    onChange={(e) => handleChange(index, e.target.name, e.target.value)}
                                    className="hidden"
                                />
                                <textarea
                                    className="form-control"
                                    name="response"
                                    value={item.response}
                                    onChange={(e) => handleChange(index, e.target.name, e.target.value)}
                                />
                            </td>
                        </tr>
                    </>))}
                    </tbody>
                </table>
                <div className="flex flex-row my-4">
                    <div className="basis-1/12">
                        <button type="submit" className="btn btn-primary bg-blue-400 w-3/4 font-semibold">Submit
                        </button>
                    </div>
                    <div className="basis-1/12">
                        <button type="reset" className="btn btn-danger bg-red-400 w-3/4 font-semibold">Reset</button>
                    </div>
                    <div className="basis-10/12">
                    </div>
                </div>
            </div>
        </form>
    </>);
};

export default LoadMeaningDrillChallenge;


export async function getServerSideProps(context) {
    const {params} = context;

    // Accessing the array of values
    const drillId = params.drillId;
    const drillRefId = drillId[0];
    const challengeId = drillId[1];
    const drillSetData = await fetchData(`${API_LEXIMENTOR_BASE_URL}/drill/metadata/sets/${drillId[0]}`)
    return {
        props: {
            drillSetData, challengeId, drillRefId
        },
    };

}