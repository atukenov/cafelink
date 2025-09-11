'use client';

import React, { useState } from 'react';
import { Gift, Star, Percent, Coffee } from 'lucide-react';
import { Reward } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { RedeemModal } from './RedeemModal';

interface RewardCardProps {
  reward: Reward;
  userId?: string;
  shopId: string;
  userPoints: number;
}

export const RewardCard: React.FC<RewardCardProps> = ({ reward, userId, shopId, userPoints }) => {
  const [showRedeemModal, setShowRedeemModal] = useState(false);

  const canRedeem = userId && userPoints >= reward.pointsCost;

  const getRewardIcon = () => {
    switch (reward.type) {
      case 'discount':
        return <Percent className="w-5 h-5" />;
      case 'free_item':
        return <Coffee className="w-5 h-5" />;
      default:
        return <Gift className="w-5 h-5" />;
    }
  };

  const getRewardValue = () => {
    if (reward.type === 'discount' && reward.value) {
      return `${reward.value}% OFF`;
    }
    if (reward.type === 'free_item') {
      return 'FREE';
    }
    return 'REWARD';
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-4 border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              {getRewardIcon()}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{reward.title}</h3>
              {reward.description && (
                <p className="text-sm text-gray-600">{reward.description}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-amber-600">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium">{reward.pointsCost}</span>
                </div>
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                  {getRewardValue()}
                </span>
              </div>
            </div>
          </div>
          
          {userId && (
            <Button
              onClick={() => setShowRedeemModal(true)}
              disabled={!canRedeem}
              variant={canRedeem ? 'primary' : 'secondary'}
              size="sm"
            >
              {canRedeem ? 'Redeem' : 'Need More Points'}
            </Button>
          )}
        </div>
      </div>

      {showRedeemModal && userId && (
        <RedeemModal
          reward={reward}
          userId={userId}
          shopId={shopId}
          userPoints={userPoints}
          onClose={() => setShowRedeemModal(false)}
        />
      )}
    </>
  );
};
