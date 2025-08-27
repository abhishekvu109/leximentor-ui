'use client';

import {useState} from 'react';
import {ChevronDown, ChevronUp} from 'lucide-react';

export default function CollapsiblePanel({title, children}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center px-4 py-3 text-left text-gray-800 font-semibold text-sm hover:bg-gray-50 transition"
            >
                <span>{title}</span>
                {isOpen ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
            </button>

            <div
                className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen p-4' : 'max-h-0 p-0'} overflow-hidden text-sm text-gray-700`}
            >
                {children}
            </div>
        </div>
    );
}
