import { useEffect } from "react";

export default function ErrorModal({ message, isOpen, onClose }) {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 transition ease-out duration-300 transform scale-95">
            <div className="bg-white p-6 max-w-md w-full rounded shadow-lg border border-red-300">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-red-600">🚨 Error</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-red-600 font-bold text-lg"
                    >
                        &times;
                    </button>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{message}</p>
                <div className="mt-4 text-right">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
