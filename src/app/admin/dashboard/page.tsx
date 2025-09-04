'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Users, Coffee, UserCheck, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ _id: string; name: string; role: string } | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/admin/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (!['admin', 'author'].includes(parsedUser.role)) {
      router.push('/admin/login');
      return;
    }

    setUser(parsedUser);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Welcome, {user.name}</h2>
            <p className="text-blue-600 font-medium">Coffee Shop Admin</p>
            <p className="text-sm text-gray-600 mt-2">Manage your coffee shop operations</p>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href="/admin/employees"
            className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Employee Management</h3>
                <p className="text-sm text-gray-600">Add employees and assign roles</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/menu"
            className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Coffee className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Menu Management</h3>
                <p className="text-sm text-gray-600">Manage products and additional items</p>
              </div>
            </div>
          </Link>

          <Link
            href="/employee/orders"
            className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Order Management</h3>
                <p className="text-sm text-gray-600">View and manage customer orders</p>
              </div>
            </div>
          </Link>

          <Link
            href="/employee/dashboard"
            className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Employee Interface</h3>
                <p className="text-sm text-gray-600">Access employee features</p>
              </div>
            </div>
          </Link>
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
