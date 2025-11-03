"use client";

import { apiClient } from "@/lib/api";
import { CoffeeShop } from "@/lib/types";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

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
    throw new Error("useShop must be used within a ShopProvider");
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

      // Get all active shops first
      console.log("Fetching shops...");
      const shops = await apiClient.getCoffeeShops();
      console.log("Fetched shops:", shops);

      const activeShops = shops.filter((shop: CoffeeShop) => shop.isActive);
      console.log("Active shops:", activeShops);

      // For regular customers, show all active shops
      setUserShops(activeShops);

      // Try to restore previously selected shop
      const savedShopId = localStorage.getItem("selectedShopId");
      if (savedShopId) {
        const savedShop = activeShops.find(
          (shop: CoffeeShop) => shop._id === savedShopId
        );
        if (savedShop) {
          setSelectedShop(savedShop);
        } else if (activeShops.length > 0) {
          setSelectedShop(activeShops[0]);
          localStorage.setItem("selectedShopId", activeShops[0]._id);
        }
      } else if (activeShops.length > 0) {
        setSelectedShop(activeShops[0]);
        localStorage.setItem("selectedShopId", activeShops[0]._id);
      }

      // Special handling for logged-in users
      const user = localStorage.getItem("user");
      if (user) {
        const parsedUser = JSON.parse(user);
        // Employee sees only their assigned shop
        if (parsedUser.coffeeShopId) {
          const employeeShop = activeShops.find(
            (shop: CoffeeShop) => shop._id === parsedUser.coffeeShopId
          );
          if (employeeShop) {
            setUserShops([employeeShop]);
            setSelectedShop(employeeShop);
            localStorage.setItem("selectedShopId", employeeShop._id);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shops");
      console.error("Error loading shops:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetSelectedShop = (shop: CoffeeShop | null) => {
    setSelectedShop(shop);
    if (shop) {
      localStorage.setItem("selectedShopId", shop._id);
    } else {
      localStorage.removeItem("selectedShopId");
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
