'use client';

import {useState} from 'react';

export default function Stepper({steps}) {
    const [currentStep, setCurrentStep] = useState(0);

    return (
        <div className="min-h-screen">
            <div className="bg-white p-8 flex flex-col items-center justify-center">
                <div className="w-full max-w-screen mb-10">
                    <div className="flex items-center justify-between relative">
                        {steps.map((step, index) => (
                            <div key={index} className="flex items-center w-full">
                                <div className="flex flex-col items-center z-10">
                                    <div
                                        className={`w-10 h-10 flex items-center justify-center rounded-full border-2 font-bold transition-all duration-300
                    ${
                                            index < currentStep
                                                ? 'bg-blue-600 text-white border-green-600'
                                                : index === currentStep
                                                    ? 'bg-blue-100 text-green-700 border-blue-600'
                                                    : 'bg-gray-100 text-gray-400 border-gray-300'
                                        }`}
                                    >
                                        {index < currentStep ? '✓' : index + 1}
                                    </div>
                                    <p
                                        className={`mt-2 text-sm font-medium ${
                                            index === currentStep
                                                ? 'text-blue-700'
                                                : index < currentStep
                                                    ? 'text-blue-600'
                                                    : 'text-gray-400'
                                        }`}
                                    >
                                        {step.title}
                                    </p>
                                </div>
                                {index !== steps.length - 1 && (
                                    <div
                                        className={`flex-auto h-1 mx-2 transition-all duration-300 ${
                                            index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-full max-w-screen bg-gray-50 p-6 rounded-xl shadow-md">
                    {steps[currentStep].content}
                    <div className="flex justify-between mt-6">
                        <button
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                            onClick={() => setCurrentStep((prev) => prev - 1)}
                            disabled={currentStep === 0}
                        >
                            Back
                        </button>
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            onClick={() => setCurrentStep((prev) => prev + 1)}
                            disabled={currentStep === steps.length - 1}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
