'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false 
}) => {
  const baseClasses = 'bg-white rounded-xl shadow-sm';
  const hoverClasses = hover ? 'hover:shadow-md transition-shadow' : '';
  
  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
  badge?: string;
  badgeColor?: string;
  iconColor?: string;
  children?: React.ReactNode;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  icon: Icon,
  title,
  description,
  href,
  onClick,
  badge,
  badgeColor = 'bg-blue-600',
  iconColor = 'text-blue-600',
  children
}) => {
  const content = (
    <Card hover className="p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 bg-${iconColor.split('-')[1]}-100 rounded-full flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
            {badge && (
              <span className={`${badgeColor} text-white text-xs px-2 py-1 rounded-full`}>
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{description}</p>
          {children}
        </div>
      </div>
    </Card>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className="block w-full text-left">
        {content}
      </button>
    );
  }

  return content;
};
