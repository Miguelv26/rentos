import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  const generatedId = useId();
  const inputId = props.id || `input-${generatedId}`;
  const errorId = `${inputId}-error`;
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-[10px] font-bold uppercase text-gray-500 mb-1 tracking-wider">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full bg-[#1A1A24] border ${error ? 'border-red-500' : 'border-gray-700'} rounded-lg p-2.5 text-sm text-white focus:border-[#00E5FF] focus:outline-none transition ${className}`}
        {...props}
      />
      {error && <p id={errorId} role="alert" className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};
