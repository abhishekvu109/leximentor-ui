'use client';

import React, { useState, useRef } from 'react';

export default function FloatingBox({header,buttonLabel,content}) {
    const [visible, setVisible] = useState(false);
    const boxRef = useRef(null);
    const pos = useRef({ dx: 0, dy: 0 });

    const handleMouseDown = (e) => {
        const box = boxRef.current;
        if (!box) return;

        pos.current.dx = e.clientX - box.offsetLeft;
        pos.current.dy = e.clientY - box.offsetTop;

        const handleMouseMove = (moveEvent) => {
            if (box) {
                box.style.left = `${moveEvent.clientX - pos.current.dx}px`;
                box.style.top = `${moveEvent.clientY - pos.current.dy}px`;
            }
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <>
            <button
                onClick={() => setVisible(true)}
                className="px-2 py-2 text-xs font-semibold bg-blue-500 text-white rounded hover:bg-blue-700"
            >
                {buttonLabel}
            </button>

            {visible && (
                <div
                    ref={boxRef}
                    onMouseDown={handleMouseDown}
                    className="fixed bg-white shadow-lg border border-gray-300 rounded-lg p-4 w-[50%] h-72 overflow-y-scroll z-50 cursor-move"
                    style={{top: '100px', left: '100px'}}
                >
                    <div className="mb-2">
                        <div className="flex flex-row justify-between items-center">
                            <h2 className="text-lg font-semibold text-blue-600">{header}</h2>
                            <button
                                onClick={() => setVisible(false)}
                                className="text-red-500 font-bold hover:text-red-700"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="size-6"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>
                        <hr className="mt-2"/>
                    </div>

                    <div className="mt-2">{content}</div>
                </div>
            )}
        </>
    );
}
