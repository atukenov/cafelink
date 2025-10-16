"use client";

import { Card } from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useShop } from "@/contexts/ShopContext";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import { LoyaltyTransaction } from "@/lib/types";
import { ArrowLeft, Clock, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LoyaltyHistoryPage() {
  const { user, loading: authLoading } = useAuth({ requiredRoles: ["client"] });
  const { selectedShop } = useShop();
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && selectedShop) {
      loadTransactions();
    }
  }, [user, selectedShop]);

  const loadTransactions = async () => {
    if (!user || !selectedShop) return;

    try {
      const response = await apiClient.getLoyaltyTransactions(
        user._id,
        selectedShop._id
      );
      setTransactions(response.transactions || []);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "earn":
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case "redeem":
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "earn":
        return "text-green-600";
      case "redeem":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner text="Loading transaction history..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/loyalty" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Points History</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {transactions.length === 0 ? (
          <Card className="p-6 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800 mb-2">
              No Transaction History
            </h3>
            <p className="text-gray-600">
              Start earning points by making purchases!
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <Card key={transaction._id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <div className="font-medium text-gray-800 capitalize">
                        {transaction.type === "earn"
                          ? "Points Earned"
                          : transaction.type === "redeem"
                          ? "Points Redeemed"
                          : transaction.type}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </div>
                      {transaction.source && (
                        <div className="text-xs text-gray-500 capitalize">
                          {transaction.source}
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    className={`font-bold ${getTransactionColor(
                      transaction.type
                    )}`}
                  >
                    {transaction.points > 0 ? "+" : ""}
                    {transaction.points}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
