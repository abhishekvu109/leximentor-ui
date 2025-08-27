import Layout from "@/components/layout/Layout";
import {useEffect, useState} from "react";

const MainDesign = () => {
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState("info");
    useEffect(() => {
        const msg = sessionStorage.getItem('message');
        const severityLevel = sessionStorage.getItem('severity')
        if (msg) {
            setMessage(msg);
            setSeverity(severityLevel)
            sessionStorage.removeItem('message');
            sessionStorage.removeItem('severity');
        }
    }, []);
    const getColor = (severity) => {
        if (severity == "info") {
            return "blue";
        } else if (severity == "warn") {
            return "yellow";
        } else if (severity == "error") {
            return "red";
        } else {
            return "green";
        }
    }

    const getHeader = (severity) => {
        if (severity == "info") {
            return "Info";
        } else if (severity == "warn") {
            return "Warning";
        } else if (severity == "error") {
            return "Error";
        } else {
            return "Success";
        }
    }
    return (<><Layout content={
        <div
            className={`w-full rounded-xl border-l-4 border-${getColor(severity)}-600 bg-${getColor(severity)}-50 p-5 mb-4`}>
            <div className="flex items-start space-x-3">
                <svg className={`w-6 h-6 text-${getColor(severity)}-600 mt-1`} fill="none" viewBox="0 0 24 24"
                     stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                <div>
                    <h3 className={`text-lg font-semibold text-${getColor(severity)}-800`}>{getHeader(severity)}</h3>
                    <p className={`text-sm text-${getColor(severity)}-700`}>{message}</p>
                </div>
            </div>
        </div>
    }/> </>);
}

export default MainDesign;