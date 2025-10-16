"use client";

import { ActionCard, Card } from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ShopSelector from "@/components/ui/ShopSelector";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft,
  BarChart3,
  CheckSquare,
  Clock,
  Coffee,
  MapPin,
  Megaphone,
  MessageSquare,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { user, loading, logout } = useAuth({
    requiredRoles: ["admin", "author"],
    redirectTo: "/staff-login",
  });

  if (loading || !user) {
    return <LoadingSpinner text="Loading admin dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
          </div>
          <button
            onClick={logout}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        <ShopSelector />

        <Card className="p-6 mb-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              Welcome, {user.name}
            </h2>
            <p className="text-blue-600 font-medium">Coffee Shop Admin</p>
            <p className="text-sm text-gray-600 mt-2">
              Manage your coffee shop operations
            </p>
          </div>
        </Card>

        <div className="space-y-4">
          <ActionCard
            icon={Users}
            title="Employee Management"
            description="Add employees and assign roles"
            href="/admin/employees"
            iconColor="text-green-600"
          />

          <ActionCard
            icon={Coffee}
            title="Menu Management"
            description="Manage products and additional items"
            href="/admin/menu"
            iconColor="text-amber-600"
          />

          <ActionCard
            icon={Clock}
            title="Shift Management"
            description="Schedule employee shifts"
            href="/admin/shifts"
            iconColor="text-blue-600"
          />

          <ActionCard
            icon={CheckSquare}
            title="Task Management"
            description="Create and assign tasks"
            href="/admin/tasks"
            iconColor="text-indigo-600"
          />

          <ActionCard
            icon={MessageSquare}
            title="Live Messaging"
            description="Send announcements to employees"
            href="/admin/messages"
            iconColor="text-purple-600"
          />

          <ActionCard
            icon={BarChart3}
            title="Employee Statistics"
            description="View performance metrics"
            href="/admin/statistics"
            iconColor="text-teal-600"
          />

          <ActionCard
            icon={Megaphone}
            title="Sales & News"
            description="Create promotions for clients"
            href="/admin/promotions"
            iconColor="text-orange-600"
          />

          <ActionCard
            icon={MapPin}
            title="Coffee Shops"
            description="Manage multiple coffee shop locations"
            href="/admin/shops"
            iconColor="text-indigo-600"
          />

          <ActionCard
            icon={Settings}
            title="Order Management"
            description="View and manage customer orders"
            href="/employee/orders"
            iconColor="text-gray-600"
          />
        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-4">
          <h4 className="font-medium text-blue-800 mb-2">Admin Privileges</h4>
          <ul className="text-sm text-blue-600 space-y-1">
            <li>• Add and manage employees</li>
            <li>• Manage coffee shop menu</li>
            <li>• Assign Administrator roles</li>
            <li>• View all orders and analytics</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
