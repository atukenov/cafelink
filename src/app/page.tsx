"use client";

import { ShopSelector } from "@/components/common/ShopSelector";
import { apiClient } from "@/lib/api";
import { Coffee, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  interface Promotion {
    _id: string;
    type: "sale" | "discount" | "offer";
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  }

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const promotionsData = await apiClient.getActivePromotions();
      setPromotions(promotionsData);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Logo and Shop Selector */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Coffee className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">CafeLink</h1>
          <p className="text-gray-600">Coffee Shop in Atyrau</p>

          {/* Shop Selector */}
          <div className="mt-4">
            <ShopSelector className="max-w-sm mx-auto" />
          </div>
        </div>

        {/* Active Promotions */}
        {!loading && promotions.length > 0 && (
          <div className="mb-6 space-y-3">
            <h3 className="font-semibold text-gray-700">Special Offers</h3>
            {promotions.slice(0, 2).map((promotion) => (
              <div
                key={promotion._id}
                className={`p-4 rounded-xl ${
                  promotion.type === "sale"
                    ? "bg-red-50 border border-red-200"
                    : "bg-blue-50 border border-blue-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      promotion.type === "sale"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {promotion.type.toUpperCase()}
                  </span>
                </div>
                <h4
                  className={`font-semibold mb-1 ${
                    promotion.type === "sale" ? "text-red-800" : "text-blue-800"
                  }`}
                >
                  {promotion.title}
                </h4>
                <p
                  className={`text-sm ${
                    promotion.type === "sale" ? "text-red-600" : "text-blue-600"
                  }`}
                >
                  {promotion.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Client Actions */}
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            For Customers
          </h2>

          <Link
            href="/menu"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-colors"
          >
            <Coffee className="w-5 h-5" />
            View Menu
          </Link>

          <Link
            href="/orders"
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
