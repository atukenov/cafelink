'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  backHref?: string;
  showLogout?: boolean;
}

export default function DashboardLayout({
  children,
  title,
  backHref = '/',
  showLogout = false,
}: DashboardLayoutProps) {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={backHref} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-800">{title}</h1>
          </div>
          {showLogout && (
            <button
              onClick={logout}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Logout
            </button>
          )}
        </div>
      </div>
      
      <div className="max-w-md mx-auto p-4">
        {children}
      </div>
    </div>
  );
}
