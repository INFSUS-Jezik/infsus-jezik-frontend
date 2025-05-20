import React from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, id, error, className = "", ...props }) => {
    const baseStyle =
        "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
    const errorStyle = error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "";

    return (
        <div className="mb-4">
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <input id={id} className={`${baseStyle} ${errorStyle} ${className}`} {...props} />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default InputField;
