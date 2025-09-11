'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface PointsDisplayProps {
  points: number;
  tier?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PointsDisplay: React.FC<PointsDisplayProps> = ({ 
  points, 
  tier, 
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`text-center ${className}`}>
      <div className={`${sizeClasses[size]} bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
        <Star className={`${iconSizes[size]} text-amber-600 fill-current`} />
      </div>
      <h3 className={`${textSizes[size]} font-bold text-gray-800 mb-2`}>{points} Points</h3>
      <p className="text-gray-600">
        {tier ? `${tier} Member` : 'Your loyalty balance'}
      </p>
    </div>
  );
};
