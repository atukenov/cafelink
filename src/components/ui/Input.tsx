import React from "react";

type InputType = "input" | "select";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  className?: string;
  iconLeft?: React.ReactNode;
  as?: InputType;
  children?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  className = "",
  iconLeft,
  as = "input",
  children,
  ...props
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {iconLeft && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {iconLeft}
          </span>
        )}
        {as === "select" ? (
          <select
            {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-800 ${
              error ? "border-red-500" : "border-gray-300"
            }`}
          >
            {children}
          </select>
        ) : (
          <input
            {...props}
            className={`w-full ${
              iconLeft ? "pl-10" : "px-3"
            } py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 ${
              error ? "border-red-500" : "border-gray-300"
            }`}
          />
        )}
      </div>
      {helper && !error && (
        <p className="text-xs text-gray-500 mt-1">{helper}</p>
      )}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
};
