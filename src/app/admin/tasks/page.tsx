"use client";

import { useToast } from "@/components/Toast";
import { apiClient } from "@/lib/api";
import { socketManager } from "@/lib/socket";
import { Task, User } from "@/lib/types";
import { ArrowLeft, CheckSquare, Plus, Square } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function AdminTasksPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<{
    _id: string;
    name: string;
    role: string;
  } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    assignTo: "global",
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/admin/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (!["admin", "author"].includes(parsedUser.role)) {
      router.push("/admin/login");
      return;
    }

    setUser(parsedUser);
    loadData();

    const socket = socketManager.connect();
    socketManager.onTaskUpdate((taskData) => {
      if (taskData.type === "completed") {
        loadData(); // Reload tasks when employees complete them
        showToast({
          type: "success",
          title: "Task Completed",
          message: `${taskData.employeeName} completed a task`,
        });
      }
    });

    return () => {
      socketManager.offTaskUpdate();
    };
  }, [router]);

  const loadData = async () => {
    try {
      const [tasksData, employeesData] = await Promise.all([
        apiClient.getTasks(),
        apiClient.getUsers(),
      ]);
      setTasks(tasksData);
      setEmployees(
        employeesData.filter((emp: User) =>
          ["employee", "administrator"].includes(emp.role)
        )
      );
    } catch (err) {
      setError("Failed to load data");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description) {
      setError("Description is required");
      return;
    }

    try {
      const coffeeShopId = localStorage.getItem("selectedShopId");
      if (!coffeeShopId) {
        setError("No coffee shop selected");
        return;
      }

      const newTask = await apiClient.createTask({
        description: formData.description,
        employeeId:
          formData.assignTo === "global" ? undefined : formData.assignTo,
        coffeeShopId,
      });

      socketManager.emitTaskUpdate({
        ...newTask,
        type: "created",
      });

      setShowForm(false);
      setFormData({ description: "", assignTo: "global" });
      await loadData();

      showToast({
        type: "success",
        title: "Task Created",
        message: "Task has been assigned successfully",
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    }
  };

  const getEmployeeName = (employeeId?: string) => {
    if (!employeeId) return "Unassigned";
    const employee = employees.find((emp) => emp._id === employeeId);
    return employee?.name || "Unknown";
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
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

  const pendingTasks = getTasksByStatus("pending");
  const completedTasks = getTasksByStatus("done");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <h1 className="text-xl font-bold text-gray-800">Task Management</h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <h2 className="font-semibold text-gray-800 mb-3">Task Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {pendingTasks.length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {completedTasks.length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Square className="w-5 h-5 text-blue-600" />
            Pending Tasks ({pendingTasks.length})
          </h3>

          {pendingTasks.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No pending tasks</p>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div key={task._id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          Assigned to: {getEmployeeName(task.employeeId)}
                        </span>
                        {task.isGlobal && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            Global
                          </span>
                        )}
                      </div>
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

        {completedTasks.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-green-600" />
              Completed Tasks ({completedTasks.length})
            </h3>

            <div className="space-y-3">
              {completedTasks.slice(0, 5).map((task) => (
                <div
                  key={task._id}
                  className="border rounded-lg p-3 bg-green-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-800 line-through">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          Completed by: {getEmployeeName(task.employeeId)}
                        </span>
                        {task.isGlobal && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            Global
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Completed:{" "}
                        {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Create New Task</h3>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                    placeholder="Describe the task..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Task To
                  </label>
                  <select
                    value={formData.assignTo}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        assignTo: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="global">Global (All Employees)</option>
                    {employees.map((employee) => (
                      <option key={employee._id} value={employee._id}>
                        {employee.name} ({employee.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({ description: "", assignTo: "global" });
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
