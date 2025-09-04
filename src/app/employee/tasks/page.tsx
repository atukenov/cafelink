'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckSquare, Square } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Task } from '@/lib/types';

export default function EmployeeTasksPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ _id: string; name: string; role: string } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/employee/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (!['employee', 'admin'].includes(parsedUser.role)) {
      router.push('/employee/login');
      return;
    }

    setUser(parsedUser);
    loadTasks();
  }, [router]);

  const loadTasks = async () => {
    try {
      const data = await apiClient.getTasks();
      setTasks(data);
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId: string, currentStatus: string) => {
    if (!user) return;

    try {
      const newStatus = currentStatus === 'done' ? 'pending' : 'done';
      const employeeId = newStatus === 'done' ? user._id : undefined;
      
      await apiClient.updateTask(taskId, { 
        status: newStatus,
        employeeId 
      });
      
      await loadTasks();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  const pendingTasks = getTasksByStatus('pending');
  const completedTasks = getTasksByStatus('done');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/employee/dashboard" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Tasks</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Task Summary */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <h2 className="font-semibold text-gray-800 mb-3">Today&apos;s Progress</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{pendingTasks.length}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Pending Tasks */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Square className="w-5 h-5 text-blue-600" />
            Pending Tasks ({pendingTasks.length})
          </h3>
          
          {pendingTasks.length === 0 ? (
            <p className="text-gray-600 text-center py-8">All tasks completed! 🎉</p>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div key={task._id} className="border rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTask(task._id, task.status)}
                      className="mt-1 p-1 hover:bg-gray-100 rounded"
                    >
                      <Square className="w-5 h-5 text-gray-400" />
                    </button>
                    
                    <div className="flex-1">
                      <p className="text-gray-800">{task.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-green-600" />
              Completed Tasks ({completedTasks.length})
            </h3>
            
            <div className="space-y-3">
              {completedTasks.slice(0, 5).map((task) => (
                <div key={task._id} className="border rounded-lg p-3 bg-green-50">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTask(task._id, task.status)}
                      className="mt-1 p-1 hover:bg-gray-100 rounded"
                    >
                      <CheckSquare className="w-5 h-5 text-green-600" />
                    </button>
                    
                    <div className="flex-1">
                      <p className="text-gray-800 line-through">{task.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Completed: {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common Tasks Quick Add */}
        <div className="mt-6 bg-blue-50 rounded-xl p-4">
          <h4 className="font-medium text-blue-800 mb-2">Common Daily Tasks</h4>
          <p className="text-sm text-blue-600">
            Tasks are managed by the coffee shop owner. Complete the tasks assigned to you above.
          </p>
        </div>
      </div>
    </div>
  );
}
