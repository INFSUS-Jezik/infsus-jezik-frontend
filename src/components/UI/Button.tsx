import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  ...props
}) => {
  const baseStyle = 'px-4 py-2 rounded font-semibold focus:outline-none focus:ring-2 focus:ring-opacity-75';
  let variantStyle = '';

  switch (variant) {
    case 'primary':
      variantStyle = 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500';
      break;
    case 'secondary':
      variantStyle = 'bg-gray-300 hover:bg-gray-400 text-gray-800 focus:ring-gray-300';
      break;
    case 'danger':
      variantStyle = 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500';
      break;
    default:
      variantStyle = 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500';
  }

  return (
    <button
      className={`${baseStyle} ${variantStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
