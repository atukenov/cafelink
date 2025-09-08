'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LogOut, Clock, CheckSquare, MessageSquare, User, Coffee, Calendar, Play, Square } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { useUnreadCounts } from '@/hooks/useUnreadCounts';
import { useShop } from '@/contexts/ShopContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Card, ActionCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatTime, formatDuration } from '@/lib/utils';

export default function EmployeeDashboardPage() {
  const { showToast } = useToast();
  const { user, loading: authLoading, logout } = useAuth({ 
    requiredRoles: ['employee', 'admin', 'administrator', 'author'],
    redirectTo: '/staff-login'
  });
  const { selectedShop } = useShop();
  const { unreadCounts, markMessagesAsRead, markOrdersAsRead } = useUnreadCounts();
  const [myShifts, setMyShifts] = useState<any[]>([]);
  const [currentShift, setCurrentShift] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useSocket({
    onNewOrder: (orderData) => {
      showToast({
        type: 'info',
        title: 'New Order!',
        message: `Order #${orderData._id.slice(-6)} received`,
      });
    },
    onNewMessage: (messageData) => {
      showToast({
        type: 'info',
        title: 'New Message',
        message: messageData.title,
      });
    },
  });

  useEffect(() => {
    if (user && selectedShop) {
      loadDashboardData(user._id);
    }
  }, [user, selectedShop]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async (employeeId: string) => {
    try {
      const [shiftsData, currentShiftData] = await Promise.all([
        apiClient.getScheduledShifts(employeeId),
        apiClient.getCurrentShift(employeeId)
      ]);
      setMyShifts(shiftsData);
      setCurrentShift(currentShiftData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };



  const handleStartShift = async () => {
    if (!user) return;
    try {
      const shiftData = await apiClient.startShift(user._id);
      setCurrentShift(shiftData);
      showToast({
        type: 'success',
        title: 'Shift Started',
        message: 'Your work shift has begun',
      });
    } catch (err) {
      console.error('Error starting shift:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to start shift',
      });
    }
  };

  const handleEndShift = async () => {
    if (!user || !currentShift) return;
    try {
      await apiClient.endShift(currentShift._id);
      setCurrentShift(null);
      showToast({
        type: 'success',
        title: 'Shift Ended',
        message: 'Your work shift has ended',
      });
    } catch (err) {
      console.error('Error ending shift:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to end shift',
      });
    }
  };

  const getShiftDuration = () => {
    if (!currentShift?.startTime) return '00:00:00';
    return formatDuration(currentShift.startTime, currentTime);
  };

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
          <h2 className="text-xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
          <p className="text-gray-600">Ready to start your shift?</p>
        </div>

        {/* My Shifts Card */}
        <Card className="p-6 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-1">My Shifts</h3>
              <p className="text-sm text-gray-600">Your scheduled shifts and current status</p>
            </div>
          </div>

          {/* Current Shift Status */}
          {currentShift ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-800 font-medium">Currently Working</span>
                <span className="text-green-600 font-mono text-lg">{getShiftDuration()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600">
                  Started: {new Date(currentShift.startTime).toLocaleTimeString()}
                </span>
                <Button
                  onClick={handleEndShift}
                  variant="danger"
                  size="sm"
                  icon={Square}
                >
                  End Shift
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Not currently working</span>
                <Button
                  onClick={handleStartShift}
                  variant="success"
                  size="sm"
                  icon={Play}
                >
                  Start Shift
                </Button>
              </div>
            </div>
          )}

          {/* Scheduled Shifts */}
          {myShifts.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">This Week's Schedule</h4>
              <div className="space-y-2">
                {myShifts.slice(0, 3).map((shift) => (
                  <div key={shift._id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">
                      {shift.weekdays.map((day: number) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]).join(', ')}
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
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

          <ActionCard
            icon={Clock}
            title="Shift Management"
            description="Start or end your work shift"
            href="/employee/shift"
            iconColor="text-green-600"
          />

          <ActionCard
            icon={CheckSquare}
            title="Tasks"
            description="View and complete daily tasks"
            href="/employee/tasks"
            iconColor="text-purple-600"
          />

          <Link href="/employee/messages" onClick={markMessagesAsRead}>
            <ActionCard
              icon={MessageSquare}
              title="Messages"
              description="Read announcements from management"
              iconColor="text-amber-600"
            >
              {unreadCounts.messages > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                  {unreadCounts.messages}
                </span>
              )}
            </ActionCard>
          </Link>
        </div>

        {/* Quick Stats */}
        <Card className="mt-8 p-6">
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
        </Card>
      </div>
    </div>
  );
}
