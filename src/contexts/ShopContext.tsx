'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CoffeeShop } from '@/lib/types';
import { apiClient } from '@/lib/api';

interface ShopContextType {
  selectedShop: CoffeeShop | null;
  userShops: CoffeeShop[];
  setSelectedShop: (shop: CoffeeShop | null) => void;
  loading: boolean;
  error: string | null;
  refreshShops: () => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

interface ShopProviderProps {
  children: ReactNode;
}

export const ShopProvider: React.FC<ShopProviderProps> = ({ children }) => {
  const [selectedShop, setSelectedShop] = useState<CoffeeShop | null>(null);
  const [userShops, setUserShops] = useState<CoffeeShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserShops = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = localStorage.getItem('user');
      if (!user) {
        setLoading(false);
        return;
      }

      const parsedUser = JSON.parse(user);
      
      if (['admin', 'author'].includes(parsedUser.role)) {
        const shops = await apiClient.getCoffeeShops();
        setUserShops(shops);
        
        const savedShopId = localStorage.getItem('selectedShopId');
        if (savedShopId) {
          const savedShop = shops.find((shop: CoffeeShop) => shop._id === savedShopId);
          if (savedShop) {
            setSelectedShop(savedShop);
          } else if (shops.length > 0) {
            setSelectedShop(shops[0]);
            localStorage.setItem('selectedShopId', shops[0]._id);
          }
        } else if (shops.length > 0) {
          setSelectedShop(shops[0]);
          localStorage.setItem('selectedShopId', shops[0]._id);
        }
      } else if (parsedUser.coffeeShopId) {
        const shop = await apiClient.getCoffeeShop(parsedUser.coffeeShopId);
        setUserShops([shop]);
        setSelectedShop(shop);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shops');
      console.error('Error loading shops:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetSelectedShop = (shop: CoffeeShop | null) => {
    setSelectedShop(shop);
    if (shop) {
      localStorage.setItem('selectedShopId', shop._id);
    } else {
      localStorage.removeItem('selectedShopId');
    }
  };

  const refreshShops = async () => {
    await loadUserShops();
  };

  useEffect(() => {
    loadUserShops();
  }, []);

  return (
    <ShopContext.Provider
      value={{
        selectedShop,
        userShops,
        setSelectedShop: handleSetSelectedShop,
        loading,
        error,
        refreshShops,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};
