import {useState} from "react";

const HorizontalTabInterface = ({tabs = []}) => {
    const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');

    return (
        <div className="p-6 bg-white shadow rounded-lg border border-gray-200 flex">
            {/* Vertical Tabs */}
            <div className="flex flex-col w-48 border-r border-gray-300 pr-4 space-y-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`text-left py-2 px-3 text-sm font-medium rounded transition 
                            ${activeTab === tab.id
                            ? 'bg-blue-100 text-blue-700 font-semibold'
                            : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Dynamic Content */}
            <div className="flex-1 pl-6">
                {tabs.map((tab) => (
                    tab.id === activeTab && (
                        <div key={tab.id} className="text-gray-700">
                            {typeof tab.content === 'function' ? tab.content() : tab.content}
                        </div>
                    )
                ))}
            </div>
        </div>
    );
}

export default HorizontalTabInterface;