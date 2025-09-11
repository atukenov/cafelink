'use client';

import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface PointsBadgeProps {
  userId: string;
  shopId: string;
  className?: string;
}

export const PointsBadge: React.FC<PointsBadgeProps> = ({ userId, shopId, className = '' }) => {
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const loyalty = await apiClient.getUserLoyalty(userId, shopId);
        setPoints(loyalty.pointsBalance || 0);
      } catch (error) {
        console.error('Failed to fetch loyalty points:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, [userId, shopId]);

  if (loading) {
    return <div className={`animate-pulse bg-gray-200 rounded-full px-3 py-1 w-16 h-6 ${className}`}></div>;
  }

  return (
    <div className={`flex items-center gap-1 bg-amber-100 text-amber-800 rounded-full px-3 py-1 ${className}`}>
      <Star className="w-4 h-4 fill-current" />
      <span className="text-sm font-medium">{points}</span>
    </div>
  );
};
