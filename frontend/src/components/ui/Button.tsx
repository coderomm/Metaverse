import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  loading?: boolean;
  loadingLabel?: string;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary";
}

export const Button: React.FC<ButtonProps> = ({
  label,
  loading = false,
  loadingLabel,
  icon,
  className = "",
  children,
  variant = "primary",
  ...props
}) => {
  const variants = {
    primary: "bg-primary hover:bg-primary-hover text-primary-btn-text focus:primary",
    secondary: "bg-secondary hover:bg-secondary-hover text-secondary-btn-text focus:secondary",
  };
  const loadingStyles = {
    base: "cursor-not-allowed",
    primary: "bg-gray-400 text-gray-700",
    secondary: "bg-gray-300 text-gray-500 border-gray-300",
  };
  return (
    <button
      disabled={loading || props.disabled}
      className={`text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 w-full py-2 px-4 rounded-md transition duration-200 flex items-center justify-center h-[40px]
       ${loading || props.disabled ? loadingStyles[variant] : variants[variant]} 
        ${loading ? loadingStyles.base : ""}
        ${className}`}
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
