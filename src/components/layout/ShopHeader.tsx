"use client";

import { useShop } from "@/contexts/ShopContext";
import { Store } from "lucide-react";

export function ShopHeader() {
  const { selectedShop, setSelectedShop, userShops } = useShop();

  if (!userShops?.length) return null;

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-md mx-auto px-4">
        <div className="py-3 flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Store className="w-5 h-5 text-gray-400" />
            <select
              value={selectedShop?._id || ""}
              onChange={(e) => {
                const shop = userShops.find(
                  (shop) => shop._id === e.target.value
                );
                setSelectedShop(shop || null);
              }}
              className="w-full bg-transparent text-sm text-gray-700 font-medium focus:outline-none"
            >
              <option value="" disabled>
                Select a Coffee Shop
              </option>
              {userShops.map((shop) => (
                <option key={shop._id} value={shop._id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
