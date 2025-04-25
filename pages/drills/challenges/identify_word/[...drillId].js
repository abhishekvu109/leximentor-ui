import {useState} from 'react';
import axios from 'axios';
import Script from "next/script";
import {API_LEXIMENTOR_BASE_URL, API_TEXT_TO_SPEECH} from "@/constants";
import {fetchData} from "@/dataService";

const LoadIdentifyWordDrillChallenge = ({drillSetData, challengeId}) => {
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
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                      stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
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
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                      stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
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

    const handleConvertToSpeech = async (text) => {
        try {
            const response = await axios.post(API_TEXT_TO_SPEECH, {text}, {responseType: 'arraybuffer'});
            const audioUrl = URL.createObjectURL(new Blob([response.data]));
            const audio = new Audio(audioUrl);
            audio.play();
        } catch (error) {
            console.error('Error converting text to speech:', error);
        }
    };

    return (<>
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></Script>

        <div className="alert alert-dark w-full font-bold text-center" role="alert">
            Identify the right word from the Speech.
        </div>
    {notificationVisible ? (<ShowNotification isVisible={notificationVisible} isSuccess={notificationSuccess}
                                              message={notificationMessage}/>) : (
        <ShowNotification isVisible={false} isSuccess={notificationSuccess}
                          message={notificationMessage}/>)}
        <form className="p-4 md:p-5" onSubmit={handleSubmit}>
            <div className="container border-1">
                <table className="table-auto w-full" cellPadding="10" cellSpacing="10">
                    <tbody>
                    {drillSetData.data.map((item, index) => (<>
                            <tr className="bg-blue-300 border-2 border-blue-600" key={index}>
                                <td>
                                    <label className="font-semibold mr-3 my-2">Word:</label>
                                    <button type="button" className=" text-gray-900 bg-gradient-to-r from-teal-200 to-lime-200
                                hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4
                                focus:outline-none focus:ring-lime-200 dark:focus
                        :ring-teal-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                                            onClick={() => handleConvertToSpeech(item.word)}>Click to listen
                                    </button>
                                </td>
                            </tr>
                            <tr className="bg-gray-100 border-2 border-gray-600" key={`${item.refId}-response`}>
                                <td>
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
}

export default LoadIdentifyWordDrillChallenge;

export async function getServerSideProps(context) {
    const {params} = context;

    // Accessing the array of values
    const drillId = params.drillId;
    const challengeId = drillId[1];
    const drillSetData = await fetchData(`${API_LEXIMENTOR_BASE_URL}/drill/metadata/sets/${drillId[0]}`)
    return {
        props: {
            drillSetData, challengeId
        },
    };

}


// export default function Home() {
//     const [text, setText] = useState('');
//
//     const handleConvertToSpeech = async () => {
//         try {
//             const response = await axios.post('http://192.168.1.5:8300/text-to-speech', { text }, { responseType: 'arraybuffer' });
//             const audioUrl = URL.createObjectURL(new Blob([response.data]));
//             const audio = new Audio(audioUrl);
//             audio.play();
//         } catch (error) {
//             console.error('Error converting text to speech:', error);
//         }
//     };
//
//     return (
//         <div>
//             <textarea value={text} onChange={(e) => setText(e.target.value)} />
//             <button onClick={handleConvertToSpeech}>Convert to Speech</button>
//         </div>
//     );
// }
