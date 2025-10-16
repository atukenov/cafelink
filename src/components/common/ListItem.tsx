"use client";

import { LucideIcon } from "lucide-react";
import React from "react";

export interface ListItemProps {
  leftIcon?: LucideIcon;
  leftElement?: React.ReactNode;
  title: string;
  subtitle?: string;
  description?: string;
  rightElement?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const ListItem: React.FC<ListItemProps> = ({
  leftIcon: Icon,
  leftElement,
  title,
  subtitle,
  description,
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
      {leftElement || (Icon && (
        <div className="flex-shrink-0">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
      ))}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
      {rightElement && <div className="flex-shrink-0">{rightElement}</div>}
    </div>
  );
};
