'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Star, Clock, User, Settings, LogOut, Gift, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useShop } from '@/contexts/ShopContext';
import { useToast } from '@/components/Toast';
import { PointsBadge } from '@/components/loyalty/PointsBadge';
import { RewardsList } from '@/components/loyalty/RewardsList';
import { PointsDisplay } from '@/components/loyalty/PointsDisplay';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { OrderList } from '@/components/orders/OrderList';
import { apiClient } from '@/lib/api';
import { Order } from '@/lib/types';
import { Button } from '@/components/ui/Button';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { selectedShop } = useShop();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'loyalty' | 'orders' | 'settings'>('loyalty');
  const [orders, setOrders] = useState<Order[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin?callbackUrl=/profile');
      return;
    }
    loadUserData();
  }, [session, status, selectedShop]);

  const loadUserData = async () => {
    if (!session?.user?.id || !selectedShop) return;
    
    try {
      const [loyaltyData, ordersData] = await Promise.all([
        apiClient.getUserLoyalty(session.user.id, selectedShop._id),
        session.user.phone ? 
          fetch(`/api/orders/client/${encodeURIComponent(session.user.phone)}`).then(res => res.json()) :
          Promise.resolve([])
      ]);
      
      setUserPoints(loyaltyData.pointsBalance || 0);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error('Failed to load user data:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load profile data'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Sign out error:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to sign out'
      });
    }
  };

  const renderLoyaltyTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <PointsDisplay points={userPoints} size="lg" />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-amber-600" />
          <h3 className="font-semibold text-gray-800">Available Rewards</h3>
        </div>
        {selectedShop && (
          <RewardsList
            shopId={selectedShop._id}
            userId={session?.user?.id}
            userPoints={userPoints}
          />
        )}
      </div>
    </div>
  );

  const renderOrdersTab = () => (
    <OrderList 
      orders={orders} 
      emptyMessage="No orders yet"
      showActions={true}
    />
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <ProfileCard
        name={session?.user?.name}
        email={session?.user?.email}
        phone={session?.user?.phone}
      />

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Account Actions</h3>
        <Button
          onClick={handleSignOut}
          variant="danger"
          icon={LogOut}
          className="w-full"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">My Profile</h1>
          {selectedShop && session?.user?.id && (
            <div className="ml-auto">
              <PointsBadge userId={session.user.id} shopId={selectedShop._id} />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        <div className="flex mb-6 bg-white rounded-xl shadow-sm p-1">
          <button
            onClick={() => setActiveTab('loyalty')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'loyalty'
                ? 'bg-amber-100 text-amber-800'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Star className="w-4 h-4 mx-auto mb-1" />
            Loyalty
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'orders'
                ? 'bg-amber-100 text-amber-800'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock className="w-4 h-4 mx-auto mb-1" />
            Orders
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-amber-100 text-amber-800'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="w-4 h-4 mx-auto mb-1" />
            Settings
          </button>
        </div>

        {activeTab === 'loyalty' && renderLoyaltyTab()}
        {activeTab === 'orders' && renderOrdersTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>
    </div>
  );
}
