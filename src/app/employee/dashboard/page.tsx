"use client";

import { useToast } from "@/components/Toast";
import { ActionCard } from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { useUnreadCounts } from "@/hooks/useUnreadCounts";
import { Coffee, LogOut, User } from "lucide-react";
import Link from "next/link";

export default function EmployeeDashboardPage() {
  const { showToast } = useToast();
  const {
    user,
    loading: authLoading,
    logout,
  } = useAuth({
    requiredRoles: ["employee", "admin", "administrator", "author"],
    redirectTo: "/staff-login",
  });
  const { unreadCounts, markOrdersAsRead } = useUnreadCounts();

  useSocket({
    onNewOrder: (orderData) => {
      showToast({
        type: "info",
        title: "New Order!",
        message: `Order #${orderData._id.slice(-6)} received`,
      });
    },
    onNewMessage: (messageData) => {
      showToast({
        type: "info",
        title: "New Message",
        message: `${messageData.userName}: ${messageData.message.substring(
          0,
          30
        )}...`,
      });
    },
  });

  if (authLoading || !user) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-800">{user.name}</h1>
              <p className="text-sm text-gray-600">Employee Dashboard</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-md mx-auto p-4">
        {/* Welcome Message */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Welcome Back!
          </h2>
          <p className="text-gray-600">View and manage your orders below</p>
        </div>

        {/* Orders Section */}
        <div className="space-y-4">
          <Link href="/employee/orders" onClick={markOrdersAsRead}>
            <ActionCard
              icon={Coffee}
              title="Orders"
              description="Manage customer orders with live updates"
              iconColor="text-blue-600"
              badge="PRIORITY"
              badgeColor="bg-blue-600"
            >
              {unreadCounts.orders > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                  {unreadCounts.orders}
                </span>
              )}
            </ActionCard>
          </Link>
        </div>
      </div>
    </div>
  );
}
