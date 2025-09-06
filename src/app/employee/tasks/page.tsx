'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckSquare, Square, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Task } from '@/lib/types';
import { socketManager } from '@/lib/socket';
import { useToast } from '@/components/Toast';

export default function EmployeeTasksPage() {
  const router = useRouter();
  const { showToast } = useToast();
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
    if (!['employee', 'admin', 'administrator', 'author'].includes(parsedUser.role)) {
      router.push('/employee/login');
      return;
    }

    setUser(parsedUser);
    loadTasks();

    const socket = socketManager.connect();
    socketManager.onTaskUpdate((taskData) => {
      if (taskData.type === 'created') {
        loadTasks(); // Reload tasks when new ones are created
        showToast({
          type: 'info',
          title: 'New Task',
          message: taskData.isGlobal ? 'New global task assigned' : 'New task assigned to you',
        });
      }
    });

    return () => {
      socketManager.offTaskUpdate();
    };
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
      
      if (newStatus === 'done') {
        socketManager.emitTaskUpdate({
          type: 'completed',
          taskId,
          employeeId: user._id,
          employeeName: user.name
        });
      }
      
      showToast({
        type: 'success',
        title: 'Task Updated',
        message: `Task marked as ${newStatus}`,
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
  const globalTasks = tasks.filter(task => task.isGlobal);
  const employeeTasks = tasks.filter(task => !task.isGlobal && task.employeeId === user?._id);

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
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{pendingTasks.length}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">{globalTasks.length}</div>
              <div className="text-xs text-gray-600">Global Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">{employeeTasks.length}</div>
              <div className="text-xs text-gray-600">My Tasks</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Global Tasks Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Global Tasks</h3>
              <p className="text-sm text-gray-600">Tasks for all employees</p>
            </div>
          </div>

          {globalTasks.length > 0 ? (
            <div className="space-y-3">
              {globalTasks.map((task) => (
                <div key={task._id} className="border rounded-lg p-3 bg-blue-50">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTask(task._id, task.status)}
                      className={`mt-1 p-1 hover:bg-gray-100 rounded ${
                        task.status === 'done' ? 'text-blue-600' : 'text-gray-400'
                      }`}
                    >
                      {task.status === 'done' ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <p className={`text-gray-800 ${task.status === 'done' ? 'line-through' : ''}`}>
                        {task.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No global tasks assigned</p>
            </div>
          )}
        </div>

        {/* Employee-Specific Tasks Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">My Tasks</h3>
              <p className="text-sm text-gray-600">Tasks assigned specifically to you</p>
            </div>
          </div>

          {employeeTasks.length > 0 ? (
            <div className="space-y-3">
              {employeeTasks.map((task) => (
                <div key={task._id} className="border rounded-lg p-3 bg-purple-50">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTask(task._id, task.status)}
                      className={`mt-1 p-1 hover:bg-gray-100 rounded ${
                        task.status === 'done' ? 'text-purple-600' : 'text-gray-400'
                      }`}
                    >
                      {task.status === 'done' ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <p className={`text-gray-800 ${task.status === 'done' ? 'line-through' : ''}`}>
                        {task.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No personal tasks assigned</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
