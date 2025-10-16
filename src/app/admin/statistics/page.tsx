"use client";

import { apiClient } from "@/lib/api";
import {
  ArrowLeft,
  BarChart3,
  CheckSquare,
  Clock,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface EmployeeStatsWithName {
  _id: string;
  employeeId: string;
  employeeName: string;
  employeePhone: string;
  tasksCompleted: number;
  tasksAssigned: number;
  shiftsAttended: number;
  shiftsScheduled: number;
  ordersProcessed: number;
  averageOrderTime: number;
  rating: number;
  lastUpdated: string;
}

export default function AdminStatisticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    _id: string;
    name: string;
    role: string;
  } | null>(null);
  const [statistics, setStatistics] = useState<EmployeeStatsWithName[]>([]);
  interface Employee {
    _id: string;
    name: string;
    role: string;
    phone: string;
  }

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    loadStatistics();
  }, [router]);

  const loadStatistics = async () => {
    try {
      const [statisticsData, employeesData] = await Promise.all([
        apiClient.getStatistics(),
        apiClient.getUsers(),
      ]);
      setStatistics(statisticsData);
      setEmployees(
        employeesData.filter((emp: Employee) =>
          ["employee", "administrator"].includes(emp.role)
        )
      );
    } catch (err) {
      setError("Failed to load statistics");
      console.error("Error loading statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTaskCompletionRate = (completed: number, assigned: number) => {
    if (assigned === 0) return 0;
    return Math.round((completed / assigned) * 100);
  };

  const calculateShiftAttendanceRate = (
    attended: number,
    scheduled: number
  ) => {
    if (scheduled === 0) return 0;
    return Math.round((attended / scheduled) * 100);
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getOverallStats = () => {
    const totalEmployees = statistics.length;
    const totalTasksCompleted = statistics.reduce(
      (sum, stat) => sum + stat.tasksCompleted,
      0
    );
    const totalOrdersProcessed = statistics.reduce(
      (sum, stat) => sum + stat.ordersProcessed,
      0
    );
    const averageRating =
      statistics.length > 0
        ? statistics.reduce((sum, stat) => sum + stat.rating, 0) /
          statistics.length
        : 0;

    return {
      totalEmployees,
      totalTasksCompleted,
      totalOrdersProcessed,
      averageRating: Math.round(averageRating * 10) / 10,
    };
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
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  const overallStats = getOverallStats();
  const selectedEmployee = selectedEmployeeId
    ? statistics.find((stat) => stat.employeeId === selectedEmployeeId)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">
            Employee Statistics
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Overall Statistics
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {overallStats.totalEmployees}
              </div>
              <div className="text-sm text-gray-600">Employees</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {overallStats.totalTasksCompleted}
              </div>
              <div className="text-sm text-gray-600">Tasks Done</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {overallStats.totalOrdersProcessed}
              </div>
              <div className="text-sm text-gray-600">Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {overallStats.averageRating}
              </div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
          </div>
        </div>

        {/* Employee Selection Dropdown */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Employee for Detailed View
          </label>
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Choose an employee...</option>
            {employees.map((employee) => (
              <option key={employee._id} value={employee._id}>
                {employee.name} ({employee.role})
              </option>
            ))}
          </select>
        </div>

        {/* Selected Employee Detailed Stats */}
        {selectedEmployee && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {selectedEmployee.employeeName}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedEmployee.employeePhone}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <Star className="w-5 h-5 text-amber-500" />
                <span className="text-lg font-bold">
                  {selectedEmployee.rating}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(
                    (selectedEmployee.shiftsAttended /
                      Math.max(selectedEmployee.shiftsScheduled, 1)) *
                      (selectedEmployee.shiftsAttended * 8)
                  )}{" "}
                  hrs
                </div>
                <div className="text-sm text-gray-600">Hours Worked</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {selectedEmployee.ordersProcessed}
                </div>
                <div className="text-sm text-gray-600">Orders Completed</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {selectedEmployee.tasksCompleted}
                </div>
                <div className="text-sm text-gray-600">Tasks Completed</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {selectedEmployee.rating}/5
                </div>
                <div className="text-sm text-gray-600">Rating</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium text-gray-800 mb-2">
                Performance Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Task Completion Rate:</span>
                  <span className="font-medium">
                    {calculateTaskCompletionRate(
                      selectedEmployee.tasksCompleted,
                      selectedEmployee.tasksAssigned
                    )}
                    %
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shift Attendance:</span>
                  <span className="font-medium">
                    {calculateShiftAttendanceRate(
                      selectedEmployee.shiftsAttended,
                      selectedEmployee.shiftsScheduled
                    )}
                    %
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Order Time:</span>
                  <span className="font-medium">
                    {selectedEmployee.averageOrderTime > 0
                      ? formatTime(selectedEmployee.averageOrderTime)
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-gray-500">
                Last updated:{" "}
                {new Date(selectedEmployee.lastUpdated).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {statistics.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No statistics available
            </h2>
            <p className="text-gray-600">
              Employee statistics will appear here once they start working
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {statistics.map((stat) => (
              <div key={stat._id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {stat.employeeName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {stat.employeePhone}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium">{stat.rating}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <CheckSquare className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Tasks</span>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {calculateTaskCompletionRate(
                        stat.tasksCompleted,
                        stat.tasksAssigned
                      )}
                      %
                    </div>
                    <div className="text-xs text-gray-600">
                      {stat.tasksCompleted}/{stat.tasksAssigned}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Shifts</span>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {calculateShiftAttendanceRate(
                        stat.shiftsAttended,
                        stat.shiftsScheduled
                      )}
                      %
                    </div>
                    <div className="text-xs text-gray-600">
                      {stat.shiftsAttended}/{stat.shiftsScheduled}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">
                      Orders Processed
                    </div>
                    <div className="text-lg font-bold text-purple-600">
                      {stat.ordersProcessed}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Avg Order Time</div>
                    <div className="text-lg font-bold text-orange-600">
                      {stat.averageOrderTime > 0
                        ? formatTime(stat.averageOrderTime)
                        : "N/A"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-500">
                    Last updated:{" "}
                    {new Date(stat.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-blue-50 rounded-xl p-4">
          <h4 className="font-medium text-blue-800 mb-2">Statistics Info</h4>
          <ul className="text-sm text-blue-600 space-y-1">
            <li>• Task completion rates are updated in real-time</li>
            <li>• Shift attendance is tracked automatically</li>
            <li>• Order processing times help optimize workflow</li>
            <li>• Ratings can be updated manually by management</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
