"use client";

import React from "react";

export type StatusType = "success" | "error" | "warning" | "info";

export interface StatusBadgeProps {
  status: StatusType;
  text: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  className = "",
}) => {
  const getStatusStyles = (type: StatusType) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "info":
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(
        status
      )} ${className}`}
    >
      {text}
    </span>
  );
};
