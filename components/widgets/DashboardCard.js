const colorMap = {
    purple: "bg-purple-500",
    green: "bg-green-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
    yellow: "bg-yellow-500",
    orange: "bg-orange-500",
    gray: "bg-gray-500"
};

const DashboardCard = ({
                           title, amount, percentageChange, changeText, icon, variant = "purple", // pass "green", "red", etc.
                       }) => {
    const colorClass = colorMap[variant] || "bg-purple-500";

    return (<div className={`${colorClass} p-1 rounded-xl w-full`}>
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
            <div>
                <h5 className="text-sm text-gray-500 font-semibold">{title}</h5>
                <h3 className="text-2xl font-bold text-gray-900">{amount}</h3>
                <p className="text-sm text-green-500 font-medium mt-1">
                    {percentageChange} <span className="text-gray-500">{changeText}</span>
                </p>
            </div>
            <div className={`${colorClass} rounded-full p-3 text-white`}>
                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true"
                     xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d={icon}/>
                </svg>
            </div>
        </div>
    </div>)
};

export default DashboardCard;

// "M9 5v14m8-7h-2m0 0h-2m2 0v2m0-2v-2M3 11h6m-6 4h6m11 4H4c-.55228 0-1-.4477-1-1V6c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v12c0 .5523-.4477 1-1 1Z"
