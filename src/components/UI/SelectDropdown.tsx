import React from "react";

interface SelectDropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options: { value: string | number; label: string }[];
    label?: string;
}

const SelectDropdown: React.FC<SelectDropdownProps> = ({ options, label, className = "", ...props }) => {
    return (
        <div className="mb-4">
            {label && (
                <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <select
                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 text-gray-700 bg-white focus:outline-none focus:ring-orange-500 focus:border-orange-500 rounded-md shadow-sm ${className}`}
                {...props}
            >
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default SelectDropdown;
