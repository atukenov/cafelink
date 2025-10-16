"use client";

import { LucideIcon } from "lucide-react";
import React from "react";

export interface ListItemProps {
  leftIcon?: LucideIcon;
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const ListItem: React.FC<ListItemProps> = ({
  leftIcon: Icon,
  title,
  subtitle,
  rightElement,
  onClick,
  className = "",
}) => {
  const baseClasses = "flex items-center gap-4 p-4 bg-white";
  const interactiveClasses = onClick ? "cursor-pointer hover:bg-gray-50" : "";

  return (
    <div
      className={`${baseClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      {Icon && (
        <div className="flex-shrink-0">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {rightElement && <div className="flex-shrink-0">{rightElement}</div>}
    </div>
  );
};
