'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Play, Square, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Shift } from '@/lib/types';

export default function EmployeeShiftPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ _id: string; name: string; role: string } | null>(null);
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    loadShifts(parsedUser._id);
  }, [router]);

  const loadShifts = async (employeeId: string) => {
    try {
      const data = await apiClient.getEmployeeShifts(employeeId);
      setShifts(data);
      
      const active = data.find((shift: Shift) => !shift.endTime);
      setActiveShift(active || null);
    } catch (err) {
      console.error('Error loading shifts:', err);
    }
  };

  const startShift = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      const shift = await apiClient.startShift(user._id);
      setActiveShift(shift);
      await loadShifts(user._id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start shift');
    } finally {
      setLoading(false);
    }
  };

  const endShift = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      await apiClient.endShift(user._id);
      setActiveShift(null);
      await loadShifts(user._id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to end shift');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
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
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/employee/dashboard" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Shift Management</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Current Shift Status */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              activeShift ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <Clock className={`w-8 h-8 ${activeShift ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {activeShift ? 'Shift Active' : 'No Active Shift'}
            </h2>
            
            {activeShift ? (
              <div className="space-y-2 mb-6">
                <p className="text-gray-600">
                  Started: {new Date(activeShift.startTime).toLocaleTimeString()}
                </p>
                <p className="text-lg font-semibold text-green-600">
                  Duration: {formatDuration(activeShift.startTime)}
                </p>
              </div>
            ) : (
              <p className="text-gray-600 mb-6">Ready to start your shift?</p>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {activeShift ? (
              <button
                onClick={endShift}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-xl flex items-center gap-2 mx-auto transition-colors"
              >
                <Square className="w-5 h-5" />
                {loading ? 'Ending...' : 'End Shift'}
              </button>
            ) : (
              <button
                onClick={startShift}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-xl flex items-center gap-2 mx-auto transition-colors"
              >
                <Play className="w-5 h-5" />
                {loading ? 'Starting...' : 'Start Shift'}
              </button>
            )}
          </div>
        </div>

        {/* Shift History */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Shifts
          </h3>
          
          {shifts.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No shift history yet</p>
          ) : (
            <div className="space-y-3">
              {shifts.slice(0, 5).map((shift) => (
                <div key={shift._id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-800">
                        {new Date(shift.startTime).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(shift.startTime).toLocaleTimeString()} - {' '}
                        {shift.endTime 
                          ? new Date(shift.endTime).toLocaleTimeString()
                          : 'Active'
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">
                        {shift.endTime 
                          ? formatDuration(shift.startTime, shift.endTime)
                          : formatDuration(shift.startTime)
                        }
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        shift.endTime 
                          ? 'bg-gray-100 text-gray-600' 
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {shift.endTime ? 'Completed' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
