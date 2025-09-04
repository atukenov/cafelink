'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Crown, Users, Settings, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AuthorDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ _id: string; name: string; role: string } | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/author/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'author') {
      router.push('/author/login');
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
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
            <h1 className="text-xl font-bold text-gray-800">Author Dashboard</h1>
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
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Welcome, {user.name}</h2>
            <p className="text-purple-600 font-medium">System Author</p>
            <p className="text-sm text-gray-600 mt-2">Full system administration access</p>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href="/author/users"
            className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">User Management</h3>
                <p className="text-sm text-gray-600">Create and manage admin users</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/dashboard"
            className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Admin Interface</h3>
                <p className="text-sm text-gray-600">Access admin management features</p>
              </div>
            </div>
          </Link>

          <Link
            href="/employee/dashboard"
            className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Employee Interface</h3>
                <p className="text-sm text-gray-600">Access employee features</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-8 bg-purple-50 rounded-xl p-4">
          <h4 className="font-medium text-purple-800 mb-2">Author Privileges</h4>
          <ul className="text-sm text-purple-600 space-y-1">
            <li>• Create and manage admin users</li>
            <li>• Full access to all system features</li>
            <li>• Override all role restrictions</li>
            <li>• System configuration access</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
