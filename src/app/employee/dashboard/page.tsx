'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LogOut, Clock, CheckSquare, MessageSquare, User, Coffee } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ _id: string; name: string; role: string } | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/employee/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (!['employee', 'admin', 'administrator', 'author'].includes(parsedUser.role)) {
      router.push('/employee/login');
      return;
    }

    setUser(parsedUser);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
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
            onClick={handleLogout}
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
          <h2 className="text-xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
          <p className="text-gray-600">Ready to start your shift?</p>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Link
            href="/employee/orders"
            className="block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-2 border-blue-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Coffee className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-800 mb-1">Orders</h3>
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">PRIORITY</span>
                </div>
                <p className="text-sm text-gray-600">Manage customer orders with live updates</p>
              </div>
            </div>
          </Link>

          <Link
            href="/employee/shift"
            className="block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">Shift Management</h3>
                <p className="text-sm text-gray-600">Start or end your work shift</p>
              </div>
            </div>
          </Link>

          <Link
            href="/employee/tasks"
            className="block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">Tasks</h3>
                <p className="text-sm text-gray-600">View and complete daily tasks</p>
              </div>
            </div>
          </Link>

          <Link
            href="/employee/messages"
            className="block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">Messages</h3>
                <p className="text-sm text-gray-600">Read announcements from management</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Today&apos;s Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Hours Worked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Tasks Completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
