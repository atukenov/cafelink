'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LogOut, Clock, CheckSquare, MessageSquare, User, Coffee, Calendar, Play, Square } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { socketManager } from '@/lib/socket';
import { useToast } from '@/components/Toast';

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<{ _id: string; name: string; role: string } | null>(null);
  const [myShifts, setMyShifts] = useState<any[]>([]);
  const [currentShift, setCurrentShift] = useState<any>(null);
  const [unreadCounts, setUnreadCounts] = useState({ orders: 0, messages: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());

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
    loadDashboardData(parsedUser._id);
    setupRealTimeUpdates();
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async (employeeId: string) => {
    try {
      const [shiftsData, currentShiftData, unreadData] = await Promise.all([
        apiClient.getScheduledShifts(employeeId),
        apiClient.getCurrentShift(employeeId),
        apiClient.getUnreadCounts(employeeId)
      ]);
      setMyShifts(shiftsData);
      setCurrentShift(currentShiftData);
      setUnreadCounts(unreadData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  const setupRealTimeUpdates = () => {
    const socket = socketManager.connect();
    socketManager.joinEmployee();
    
    socketManager.onNewOrder((orderData) => {
      showToast({
        type: 'info',
        title: 'New Order!',
        message: `Order #${orderData._id.slice(-6)} received`,
      });
      setUnreadCounts(prev => ({ ...prev, orders: prev.orders + 1 }));
    });

    socketManager.onNewMessage((messageData) => {
      showToast({
        type: 'info',
        title: 'New Message',
        message: messageData.title,
      });
      setUnreadCounts(prev => ({ ...prev, messages: prev.messages + 1 }));
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/');
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

  const formatShiftTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getShiftDuration = () => {
    if (!currentShift?.startTime) return '00:00:00';
    const start = new Date(currentShift.startTime);
    const now = currentTime;
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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

        {/* My Shifts Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
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
                <button
                  onClick={handleEndShift}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                >
                  <Square className="w-4 h-4" />
                  End Shift
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Not currently working</span>
                <button
                  onClick={handleStartShift}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start Shift
                </button>
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
                      {formatShiftTime(shift.startTime)} - {formatShiftTime(shift.endTime)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Link
            href="/employee/orders"
            className="block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-2 border-blue-200"
            onClick={() => setUnreadCounts(prev => ({ ...prev, orders: 0 }))}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Coffee className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-800 mb-1">Orders</h3>
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">PRIORITY</span>
                  {unreadCounts.orders > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {unreadCounts.orders}
                    </span>
                  )}
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
            onClick={() => {
              setUnreadCounts(prev => ({ ...prev, messages: 0 }));
              fetch('/api/chat/mark-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user?._id })
              });
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-800 mb-1">Messages</h3>
                  {unreadCounts.messages > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {unreadCounts.messages}
                    </span>
                  )}
                </div>
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
