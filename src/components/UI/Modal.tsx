import React from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="relative mx-auto p-6 border border-gray-200 w-full max-w-lg shadow-lg rounded-lg bg-white">
                <div className="text-center">
                    {title && <h3 className="text-lg leading-6 font-semibold text-gray-800 mb-4">{title}</h3>}
                    <div className="mb-6">{children}</div>
                    <div className="flex justify-center">
                        {/* <button
                            className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-md border border-gray-300 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors cursor-pointer"
                            onClick={onClose}
                        >
                            Close
                        </button> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
