import {useState} from "react";

const ModalDialog = ({notificationType, message, isShow, showModals}) => {

    const [isVisible, setIsVisible] = useState(isShow === "true" ? true : false);

    const handleVisibility = (isVisible) => {
        setIsVisible(isVisible);
        showModals(false);
    };
    const success = (message, isVisible) => {
        return ((isVisible) ? (<>
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="fixed inset-0 bg-black opacity-50"></div>
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 w-1/3 z-50">
                    <button
                        type="button"
                        className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                        data-modal-hide="popup-modal" onClick={() => handleVisibility(false)}
                    >
                        <svg
                            className="w-3 h-3"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 14 14"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                            />
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                    <div className="p-4 md:p-5 text-center">
                        <svg className="mx-auto mb-4 text-green-500 w-12 h-12 dark:text-green-200" aria-hidden="true"
                             xmlns="http://www.w3.org/2000/svg" fill="none"
                             viewBox="0 0 24 24">
                            <path stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 2c-.791 0-1.55.314-2.11.874l-.893.893a.985.985 0 0 1-.696.288H7.04A2.984 2.984 0 0 0 4.055 7.04v1.262a.986.986 0 0 1-.288.696l-.893.893a2.984 2.984 0 0 0 0 4.22l.893.893a.985.985 0 0 1 .288.696v1.262a2.984 2.984 0 0 0 2.984 2.984h1.262c.261 0 .512.104.696.288l.893.893a2.984 2.984 0 0 0 4.22 0l.893-.893a.985.985 0 0 1 .696-.288h1.262a2.984 2.984 0 0 0 2.984-2.984V15.7c0-.261.104-.512.288-.696l.893-.893a2.984 2.984 0 0 0 0-4.22l-.893-.893a.985.985 0 0 1-.288-.696V7.04a2.984 2.984 0 0 0-2.984-2.984h-1.262a.985.985 0 0 1-.696-.288l-.893-.893A2.984 2.984 0 0 0 12 2Zm3.683 7.73a1 1 0 1 0-1.414-1.413l-4.253 4.253-1.277-1.277a1 1 0 0 0-1.415 1.414l1.985 1.984a1 1 0 0 0 1.414 0l4.96-4.96Z"
                            />
                        </svg>

                        <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                            {message}
                        </h3>
                    </div>
                </div>
            </div>
        </>) : (<></>));
    };


    const failure = (message, isVisible) => {
        return ((isVisible) ? (<>
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="fixed inset-0 bg-black opacity-50"></div>
                <div
                    className="relative bg-white rounded-lg shadow dark:bg-gray-700 w-1/3 z-50 border-x border-8 border-red-300">
                    <button
                        type="button"
                        className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                        data-modal-hide="popup-modal" onClick={() => handleVisibility(false)}
                    >
                        <svg
                            className="w-3 h-3"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 14 14"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                            />
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                    <div className="p-4 md:p-5 text-center">
                        <svg className="mx-auto mb-4 text-red-500 w-12 h-12 dark:text-red-200" aria-hidden="true"
                             xmlns="http://www.w3.org/2000/svg"
                             fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm7.707-3.707a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L12 10.586 9.707 8.293Z"
                            />
                        </svg>
                        <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                            {message}
                        </h3>
                    </div>
                </div>
            </div>
        </>) : (<></>));
    };
    return (((notificationType === "success") ? (success(message, isVisible)) : (failure(message, isVisible))));
};

export default ModalDialog;
