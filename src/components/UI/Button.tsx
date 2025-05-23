import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger";
}

const Button: React.FC<ButtonProps> = ({ children, className = "", variant = "primary", ...props }) => {
    const baseStyle =
        "px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors cursor-pointer";
    let variantStyle = "";

    switch (variant) {
        case "primary":
            variantStyle = "bg-orange-500 hover:bg-orange-600 text-white focus:ring-orange-500";
            break;
        case "secondary":
            variantStyle = "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 focus:ring-gray-300";
            break;
        case "danger":
            variantStyle = "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500";
            break;
        default:
            variantStyle = "bg-orange-500 hover:bg-orange-600 text-white focus:ring-orange-500";
    }

    return (
        <button className={`${baseStyle} ${variantStyle} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default Button;
