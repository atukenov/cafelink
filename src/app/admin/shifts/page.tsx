"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useShop } from "@/contexts/ShopContext";
import { apiClient } from "@/lib/api";
import { ScheduledShift, User } from "@/lib/types";
import { ArrowLeft, Clock, Edit, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

function WeeklyCalendar({
  employeeId,
  shifts,
  employees,
  getEmployeeName,
}: {
  employeeId: string;
  shifts: ScheduledShift[];
  employees: User[];
  getEmployeeName: (id: string) => string;
}) {
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const currentEmployeeShifts = shifts.filter(
    (shift) => shift.employeeId === employeeId && shift.isActive
  );
  const otherShifts = shifts.filter(
    (shift) => shift.employeeId !== employeeId && shift.isActive
  );

  const getShiftForTimeSlot = (day: number, hour: number) => {
    const currentShift = currentEmployeeShifts.find((shift) => {
      if (!shift.weekdays.includes(day)) return false;
      const startHour = parseInt(shift.startTime.split(":")[0]);
      const endHour = parseInt(shift.endTime.split(":")[0]);
      return hour >= startHour && hour < endHour;
    });

    const otherShift = otherShifts.find((shift) => {
      if (!shift.weekdays.includes(day)) return false;
      const startHour = parseInt(shift.startTime.split(":")[0]);
      const endHour = parseInt(shift.endTime.split(":")[0]);
      return hour >= startHour && hour < endHour;
    });

    return { currentShift, otherShift };
  };

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-8 gap-1 min-w-[600px]">
        {/* Header */}
        <div className="p-2 text-xs font-medium text-gray-600">Time</div>
        {weekdays.map((day) => (
          <div
            key={day}
            className="p-2 text-xs font-medium text-gray-600 text-center"
          >
            {day}
          </div>
        ))}

        {/* Time slots */}
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <div className="p-1 text-xs text-gray-500 border-r">
              {hour.toString().padStart(2, "0")}:00
            </div>
            {weekdays.map((_, dayIndex) => {
              const { currentShift, otherShift } = getShiftForTimeSlot(
                dayIndex,
                hour
              );

              return (
                <div
                  key={`${hour}-${dayIndex}`}
                  className={`p-1 border border-gray-100 text-xs ${
                    currentShift
                      ? "bg-blue-500 text-white font-medium"
                      : otherShift
                      ? "bg-gray-200 text-gray-600 opacity-50"
                      : "bg-white"
                  }`}
                  title={
                    currentShift
                      ? `${getEmployeeName(employeeId)} (${
                          currentShift.startTime
                        }-${currentShift.endTime})`
                      : otherShift
                      ? `${getEmployeeName(otherShift.employeeId)} (${
                          otherShift.startTime
                        }-${otherShift.endTime})`
                      : ""
                  }
                >
                  {currentShift &&
                    hour === parseInt(currentShift.startTime.split(":")[0]) && (
                      <div className="truncate">
                        {getEmployeeName(employeeId).split(" ")[0]}
                      </div>
                    )}
                  {otherShift &&
                    hour === parseInt(otherShift.startTime.split(":")[0]) &&
                    !currentShift && (
                      <div className="truncate">
                        {getEmployeeName(otherShift.employeeId).split(" ")[0]}
                      </div>
                    )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Selected Employee</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-200 rounded"></div>
          <span>Other Employees</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminShiftsPage() {
  const router = useRouter();
  const { selectedShop } = useShop();
  const [user, setUser] = useState<{
    _id: string;
    name: string;
    role: string;
  } | null>(null);
  const [shifts, setShifts] = useState<ScheduledShift[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingShift, setEditingShift] = useState<ScheduledShift | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [formData, setFormData] = useState(() => ({
    employeeId: "",
    weekdays: [] as number[],
    startTime: "",
    endTime: "",
    isActive: true,
    coffeeShopId: selectedShop?._id || "",
  }));

  const weekdayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const loadData = useCallback(async () => {
    if (!selectedShop?._id) return;
    try {
      const [shiftsData, employeesData] = await Promise.all([
        apiClient.getScheduledShifts(selectedShop._id),
        apiClient.getUsers(),
      ]);
      setShifts(shiftsData);
      setEmployees(employeesData);
      setLoading(false);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      setLoading(false);
    }
  }, [selectedShop]);

  useEffect(() => {
    if (selectedShop?._id) {
      setFormData((prev) => ({
        ...prev,
        coffeeShopId: selectedShop._id,
      }));
    }
  }, [selectedShop]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.employeeId ||
      !formData.startTime ||
      !formData.endTime ||
      formData.weekdays.length === 0 ||
      !formData.coffeeShopId
    ) {
      setError(
        "All fields are required. Please ensure a coffee shop is selected."
      );
      return;
    }

    try {
      if (editingShift) {
        await apiClient.updateScheduledShift(editingShift._id, formData);
      } else {
        await apiClient.createScheduledShift(formData);
      }

      setShowForm(false);
      setEditingShift(null);
      setFormData({
        employeeId: "",
        weekdays: [],
        startTime: "",
        endTime: "",
        isActive: true,
        coffeeShopId: selectedShop?._id || "",
      });
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save shift");
    }
  };

  <div className="grid grid-cols-2 gap-4">
    <Input
      as="select"
      label="Start Time"
      value={formData.startTime ? formData.startTime.split(":")[0] : ""}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          startTime: `${(e.target as unknown as HTMLSelectElement).value}:00`,
        }))
      }
      required
      className="w-full"
    >
      <option value="">Select hour</option>
      {Array.from({ length: 24 }, (_, i) => (
        <option key={i} value={i.toString().padStart(2, "0")}>
          {i.toString().padStart(2, "0")}:00
        </option>
      ))}
    </Input>
    <Input
      as="select"
      label="End Time"
      value={formData.endTime ? formData.endTime.split(":")[0] : ""}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          endTime: `${(e.target as unknown as HTMLSelectElement).value}:00`,
        }))
      }
      required
      className="w-full"
    >
      <option value="">Select hour</option>
      {Array.from({ length: 24 }, (_, i) => (
        <option key={i} value={i.toString().padStart(2, "0")}>
          {i.toString().padStart(2, "0")}:00
        </option>
      ))}
    </Input>
  </div>;
  const handleEdit = (shift: ScheduledShift) => {
    setEditingShift(shift);
    setFormData({
      employeeId: shift.employeeId,
      weekdays: shift.weekdays,
      startTime: shift.startTime,
      endTime: shift.endTime,
      isActive: shift.isActive,
      coffeeShopId: shift.coffeeShopId,
    });
    setShowForm(true);
  };

  const handleDelete = async (shiftId: string) => {
    if (!confirm("Are you sure you want to delete this shift?")) return;

    try {
      await apiClient.deleteScheduledShift(shiftId);
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete shift");
    }
  };

  const toggleWeekday = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      weekdays: prev.weekdays.includes(day)
        ? prev.weekdays.filter((d) => d !== day)
        : [...prev.weekdays, day].sort(),
    }));
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((emp) => emp._id === employeeId);
    return employee?.name || "Unknown";
  };

  const filteredShifts = selectedEmployeeId
    ? shifts.filter((shift) => shift.employeeId === selectedEmployeeId)
    : shifts;

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
          <p className="text-gray-600">Loading shifts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4">
          {/* Top Navigation */}
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/dashboard"
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <h1 className="text-xl font-bold text-gray-800">
                Shift Management
              </h1>
            </div>
            <Button
              onClick={() => {
                if (!selectedShop?._id) {
                  setError("Please select a coffee shop first");
                  return;
                }
                setFormData((prev) => ({
                  ...prev,
                  coffeeShopId: selectedShop._id,
                }));
                setShowForm(true);
              }}
              variant="primary"
              size="sm"
              icon={Plus}
              className="p-2"
              aria-label="Create Shift"
            >
              <span className="sr-only">Create Shift</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {error && (
          <Card className="bg-red-50 border border-red-200 p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </Card>
        )}

        {/* Employee Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Employee
          </label>
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">All Staff</option>
            <optgroup label="Administrators">
              {employees
                .filter((emp) => emp.role === "administrator")
                .map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Employees">
              {employees
                .filter((emp) => emp.role === "employee")
                .map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name}
                  </option>
                ))}
            </optgroup>
          </select>
        </div>

        {/* Weekly Calendar View */}
        {selectedEmployeeId && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Weekly Schedule - {getEmployeeName(selectedEmployeeId)}
            </h3>
            <WeeklyCalendar
              employeeId={selectedEmployeeId}
              shifts={shifts}
              employees={employees}
              getEmployeeName={getEmployeeName}
            />
          </div>
        )}

        {shifts.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No shifts scheduled
            </h2>
            <p className="text-gray-600 mb-4">
              Create your first employee shift schedule
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Create Shift
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedEmployeeId && (
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <p className="text-blue-800 font-medium">
                  Showing shifts for: {getEmployeeName(selectedEmployeeId)}
                </p>
                <p className="text-blue-600 text-sm">
                  {filteredShifts.length} shift
                  {filteredShifts.length !== 1 ? "s" : ""} found
                </p>
              </div>
            )}
            {filteredShifts.map((shift) => (
              <Card key={shift._id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {getEmployeeName(shift.employeeId)}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {shift.startTime} - {shift.endTime}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {shift.weekdays.map((day) => (
                        <span
                          key={day}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                          {weekdayNames[day].slice(0, 3)}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          shift.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {shift.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(shift)}
                      variant="secondary"
                      size="sm"
                      icon={Edit}
                      className="p-2"
                      aria-label="Edit Shift"
                    >
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      onClick={() => handleDelete(shift._id)}
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                      className="p-2"
                      aria-label="Delete Shift"
                    >
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-700">
                  {editingShift ? "Edit Shift" : "Create New Shift"}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee
                  </label>
                  <select
                    value={formData.employeeId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        employeeId: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Select Staff</option>
                    <optgroup label="Administrators">
                      {employees
                        .filter((emp) => emp.role === "administrator")
                        .map((employee) => (
                          <option key={employee._id} value={employee._id}>
                            {employee.name}
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="Employees">
                      {employees
                        .filter((emp) => emp.role === "employee")
                        .map((employee) => (
                          <option key={employee._id} value={employee._id}>
                            {employee.name}
                          </option>
                        ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Working Days
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {weekdayNames.map((day, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleWeekday(index)}
                        className={`p-2 text-sm rounded border ${
                          formData.weekdays.includes(index)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <select
                      value={
                        formData.startTime
                          ? formData.startTime.split(":")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          startTime: `${e.target.value}:00`,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    >
                      <option value="">Select hour</option>
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i.toString().padStart(2, "0")}>
                          {i.toString().padStart(2, "0")}:00
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <select
                      value={
                        formData.endTime ? formData.endTime.split(":")[0] : ""
                      }
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          endTime: `${e.target.value}:00`,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    >
                      <option value="">Select hour</option>
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i.toString().padStart(2, "0")}>
                          {i.toString().padStart(2, "0")}:00
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                    className="mr-2"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Active shift
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingShift(null);
                      setFormData((prev) => ({
                        ...prev,
                        employeeId: "",
                        weekdays: [],
                        startTime: "",
                        endTime: "",
                        isActive: true,
                      }));
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                  >
                    {editingShift ? "Update" : "Create"}
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
