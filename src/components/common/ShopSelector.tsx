import { useShop } from "@/contexts/ShopContext";
import React from "react";

interface ShopSelectorProps {
  className?: string;
}

export const ShopSelector: React.FC<ShopSelectorProps> = ({
  className = "",
}) => {
  const { selectedShop, userShops, setSelectedShop } = useShop();

  // Always show the selector, just disable it if there are no shops
  if (userShops.length === 0) {
    return (
      <div className={`${className}`}>
        <select
          disabled
          className="w-full p-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
        >
          <option>Loading coffee shops...</option>
        </select>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <select
        value={selectedShop?._id || ""}
        onChange={(e) => {
          const shop = userShops.find((s) => s._id === e.target.value);
          setSelectedShop(shop || null);
        }}
        className="w-full p-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
      >
        <option value="" disabled>
          Select a coffee shop
        </option>
        {userShops.map((shop) => (
          <option key={shop._id} value={shop._id}>
            {shop.name}
          </option>
        ))}
      </select>
    </div>
  );
};
