import React from 'react';


export default function ProgressBar({value}) {
    return (<div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
            <div
                className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full transition-all duration-300"
                style={{width: `${value}%`}}
            >
                {value}%
            </div>
        </div>);
}
