import { useEffect } from 'react';
import { CheckCircleIcon, ExclamationIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

const Toast = ({ message, type = 'info', duration = 5000, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    let bgColor = 'bg-blue-50';
    let textColor = 'text-blue-800';
    let borderColor = 'border-blue-200';
    let icon = <InformationCircleIcon className="w-5 h-5 text-blue-400" />;

    if (type === 'success') {
        bgColor = 'bg-green-50';
        textColor = 'text-green-800';
        borderColor = 'border-green-200';
        icon = <CheckCircleIcon className="w-5 h-5 text-green-400" />;
    } else if (type === 'error') {
        bgColor = 'bg-red-50';
        textColor = 'text-red-800';
        borderColor = 'border-red-200';
        icon = <ExclamationIcon className="w-5 h-5 text-red-400" />;
    } else if (type === 'warning') {
        bgColor = 'bg-amber-50';
        textColor = 'text-amber-800';
        borderColor = 'border-amber-200';
        icon = <ExclamationIcon className="w-5 h-5 text-amber-400" />;
    }

    return (
        <div className={`fixed top-4 right-4 max-w-md rounded-lg border ${borderColor} ${bgColor} p-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300`}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    {icon}
                </div>
                <div className="flex-1">
                    <p className={`text-sm font-medium ${textColor}`}>
                        {message}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className={`flex-shrink-0 ${textColor} hover:opacity-70 transition`}
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default Toast;
