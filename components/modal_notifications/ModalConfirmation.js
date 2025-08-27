'use client';
import React from 'react';

const ModalConfirmation = ({
                               isOpen,
                               onClose,
                               onConfirm,
                               title = "Are you sure?",
                               message = "Do you really want to proceed? This action cannot be undone."
                           }) => {
    if (!isOpen) return null;

    return (<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
                <h2 className="text-lg font-semibold mb-2">{title}</h2>
                <p className="text-sm text-gray-700 mb-4">{message}</p>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>);
};

export default ModalConfirmation;