'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Reward } from '@/lib/types';
import { RewardCard } from './RewardCard';

interface RewardsListProps {
  shopId: string;
  userId?: string;
  userPoints?: number;
}

export const RewardsList: React.FC<RewardsListProps> = ({ shopId, userId, userPoints = 0 }) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const rewardsData = await apiClient.getRewards(shopId);
        setRewards(rewardsData);
      } catch (error) {
        console.error('Failed to fetch rewards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, [shopId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-24"></div>
        ))}
      </div>
    );
  }

  if (rewards.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No rewards available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rewards.map((reward) => (
        <RewardCard
          key={reward._id}
          reward={reward}
          userId={userId}
          shopId={shopId}
          userPoints={userPoints}
        />
      ))}
    </div>
  );
};
