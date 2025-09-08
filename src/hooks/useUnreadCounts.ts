'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from './useAuth';
import { useShop } from '@/contexts/ShopContext';

interface UnreadCounts {
  orders: number;
  messages: number;
}

export const useUnreadCounts = () => {
  const { user } = useAuth();
  const { selectedShop } = useShop();
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({
    orders: 0,
    messages: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadUnreadCounts = async () => {
    if (!user || !selectedShop) {
      setLoading(false);
      return;
    }

    try {
      const counts = await apiClient.getUnreadCounts(user._id, selectedShop._id);
      setUnreadCounts(counts);
    } catch (error) {
      console.error('Error loading unread counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!user || !selectedShop) return;

    try {
      await apiClient.markMessagesAsRead(user._id, selectedShop._id);
      setUnreadCounts(prev => ({ ...prev, messages: 0 }));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const markOrdersAsRead = async () => {
    if (!user || !selectedShop) return;

    setUnreadCounts(prev => ({ ...prev, orders: 0 }));
  };

  useEffect(() => {
    loadUnreadCounts();
  }, [user, selectedShop]);

  return {
    unreadCounts,
    loading,
    markMessagesAsRead,
    markOrdersAsRead,
    refreshCounts: loadUnreadCounts,
  };
};
