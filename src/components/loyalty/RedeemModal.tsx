'use client';

import React, { useState } from 'react';
import { X, Star, Gift } from 'lucide-react';
import { Reward } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api';
import { useToast } from '@/components/Toast';

interface RedeemModalProps {
  reward: Reward;
  userId: string;
  shopId: string;
  userPoints: number;
  onClose: () => void;
}

export const RedeemModal: React.FC<RedeemModalProps> = ({
  reward,
  userId,
  shopId,
  userPoints,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [redemptionCode, setRedemptionCode] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleRedeem = async () => {
    setLoading(true);
    
    try {
      const redemption = await apiClient.redeemReward({
        userId,
        shopId,
        rewardId: reward._id
      });

      setRedemptionCode(redemption.code);
      showToast({
        type: 'success',
        title: 'Reward Redeemed!',
        message: `You've successfully redeemed ${reward.title}`
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Redemption Failed',
        message: error instanceof Error ? error.message : 'Failed to redeem reward'
      });
    } finally {
      setLoading(false);
    }
  };

  if (redemptionCode) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Reward Redeemed!</h2>
            <p className="text-gray-600 mb-4">Show this code to the staff:</p>
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <div className="text-2xl font-mono font-bold text-gray-800">{redemptionCode}</div>
            </div>
            <Button onClick={onClose} variant="primary" className="w-full">
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Redeem Reward</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{reward.title}</h3>
          {reward.description && (
            <p className="text-gray-600 mb-4">{reward.description}</p>
          )}
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="w-5 h-5 text-amber-500 fill-current" />
            <span className="text-lg font-bold text-gray-800">{reward.pointsCost} points</span>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between text-sm">
              <span>Your current points:</span>
              <span className="font-medium">{userPoints}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Points after redemption:</span>
              <span className="font-medium">{userPoints - reward.pointsCost}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRedeem}
            loading={loading}
            variant="primary"
            className="flex-1"
          >
            Confirm Redeem
          </Button>
        </div>
      </div>
    </div>
  );
};
