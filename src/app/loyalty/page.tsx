'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Gift, History } from 'lucide-react';
import { UserLoyalty } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { useShop } from '@/contexts/ShopContext';
import { PointsBadge } from '@/components/loyalty/PointsBadge';
import { RewardsList } from '@/components/loyalty/RewardsList';
import { apiClient } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Card } from '@/components/ui/Card';

export default function LoyaltyPage() {
  const { user, loading: authLoading } = useAuth({ requiredRoles: ['client'] });
  const { selectedShop } = useShop();
  const [userLoyalty, setUserLoyalty] = useState<UserLoyalty | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && selectedShop) {
      loadUserLoyalty();
    }
  }, [user, selectedShop]);

  const loadUserLoyalty = async () => {
    if (!user || !selectedShop) return;
    
    try {
      const loyalty = await apiClient.getUserLoyalty(user._id, selectedShop._id);
      setUserLoyalty(loyalty);
    } catch (error) {
      console.error('Failed to load user loyalty:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner text="Loading loyalty program..." />;
  }

  if (!user || !selectedShop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your loyalty rewards.</p>
          <Link href="/client/login" className="text-blue-600 hover:underline mt-2 block">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Loyalty Rewards</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        <Card className="p-6 mb-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-amber-600 fill-current" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Your Points</h2>
            <div className="text-3xl font-bold text-amber-600 mb-2">
              {userLoyalty?.pointsBalance || 0}
            </div>
            <div className="text-sm text-gray-600 mb-4">
              Tier: <span className="font-medium capitalize">{userLoyalty?.tierKey || 'Bronze'}</span>
            </div>
            <PointsBadge userId={user._id} shopId={selectedShop._id} />
          </div>
        </Card>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Available Rewards</h3>
            <Gift className="w-5 h-5 text-gray-600" />
          </div>
          <RewardsList 
            shopId={selectedShop._id} 
            userId={user._id}
            userPoints={userLoyalty?.pointsBalance || 0}
          />
        </div>

        <Card className="p-4">
          <Link href="/loyalty/history" className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-800">Points History</span>
            </div>
            <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
          </Link>
        </Card>

        <div className="mt-6 bg-amber-50 rounded-xl p-4">
          <h4 className="font-medium text-amber-800 mb-2">How to Earn Points</h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Earn 1 point for every 100₸ spent</li>
            <li>• Silver tier: 20% bonus points</li>
            <li>• Gold tier: 50% bonus points</li>
            <li>• Points expire after 365 days</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
