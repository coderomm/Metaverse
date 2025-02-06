import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  id?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  id,
  className = '',
  ...props
}) => {
  return (
    <>
      <div className="input-group">
        {label && label !== '' &&
          <label {...(id && { htmlFor: id })} className="block text-sm font-medium text-gray-700 mb-1 select-none cursor-pointer">
            {label}
          </label>
        }
        <input
          {...(id && { id })}
          className={`w-full py-1 px-2 md:px-4 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition 
          ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </div>
    </>
  );
};