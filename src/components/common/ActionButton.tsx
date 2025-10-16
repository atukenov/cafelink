"use client";

import { LucideIcon } from "lucide-react";
import React from "react";

export interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  variant: "primary" | "secondary" | "danger";
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon: Icon,
  label,
  variant = "primary",
  onClick,
  loading = false,
  disabled = false,
  className = "",
  type = "button",
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-blue-600 hover:bg-blue-700 text-white";
      case "secondary":
        return "bg-gray-100 hover:bg-gray-200 text-gray-800";
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white";
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg
        font-medium transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getVariantClasses()}
        ${className}
      `}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <Icon className="w-5 h-5" />
      )}
      {label}
    </button>
  );
};
