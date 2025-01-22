import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  loading?: boolean;
  loadingLabel?: string;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  loading = false,
  loadingLabel,
  icon,
  className = "",
  children,
  ...props
}) => {
  return (
    <button
      disabled={loading || props.disabled}
      className={`text-base lg:text-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition duration-200 flex items-center justify-center h-[40px]
      ${loading || props.disabled
          ? "bg-gray-400 text-gray-700 cursor-not-allowed"
          : "bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500"
        } ${className}`}
      {...props}
    >
      {loading ? (
        <span>{loadingLabel ? loadingLabel : 'Loading...'}</span>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {label || children}
        </>
      )}
    </button>
  );
};
