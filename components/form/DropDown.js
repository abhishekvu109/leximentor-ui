import {useState, useRef, useEffect} from 'react';

const Dropdown = ({
                      label = "Select option", items = [], selected,            // Optional external control
                      onSelect
                  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [internalSelected, setInternalSelected] = useState(null);
    const dropdownRef = useRef(null);

    // Close dropdown when clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Determine final selected item: external > internal
    const displayedSelected = selected ?? internalSelected;

    const handleSelect = (item) => {
        if (selected === undefined) {
            setInternalSelected(item); // Uncontrolled mode
        }
        onSelect?.(item); // Notify parent
        setIsOpen(false);
    };

    return (<div className="relative inline-block text-left w-full" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex justify-between w-full px-4 py-2.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none"
            >
                {displayedSelected || label}
                <svg
                    className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
            </button>

            {isOpen && (<div
                    className="absolute z-10 w-full mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg animate-fade-in">
                    <div className="py-1 max-h-60 overflow-y-auto">
                        {items.map((item, idx) => (<button
                                key={idx}
                                onClick={() => handleSelect(item)}
                                className={`w-full px-4 py-2 text-left text-xs font-extralight text-gray-700 hover:bg-gray-100 focus:bg-gray-100 ${displayedSelected === item ? 'bg-gray-100 font-medium' : ''}`}
                            >
                                {item}
                            </button>))}
                    </div>
                </div>)}
        </div>);
};

export default Dropdown;
