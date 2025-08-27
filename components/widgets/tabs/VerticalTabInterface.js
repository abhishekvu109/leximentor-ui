import {useState} from 'react';

/**
 * @param {Object[]} tabs - Array of tabs [{ id, label, content }]
 */
export default function VerticalTabInterface({tabs = []}) {
    const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');

    return (<div className="p-6 bg-white shadow rounded-lg border border-gray-200">
            {/* Tabs */}
            <div className="border-b border-gray-300 flex space-x-6">
                {tabs.map((tab) => (<button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-2 text-sm font-medium border-b-2 transition ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300'}`}
                    >
                        {tab.label}
                    </button>))}
            </div>

            {/* Dynamic Content */}
            <div className="mt-6 text-gray-700">
                {tabs.map((tab) => tab.id === activeTab && (<div key={tab.id}>
                        {typeof tab.content === 'function' ? tab.content() : tab.content}
                    </div>))}
            </div>
        </div>);
}
