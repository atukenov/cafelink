"use client";

import { useShop } from "@/contexts/ShopContext";
import { apiClient } from "@/lib/api";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface User {
  _id: string;
  name: string;
  role: string;
}

interface ScheduledShift {
  _id: string;
  employeeId: string;
  weekdays: number[];
  startTime: string;
  endTime: string;
  isActive: boolean;
  coffeeShopId: string;
}

export function CurrentShifts() {
  const { selectedShop } = useShop();
  const [currentBaristas, setCurrentBaristas] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCurrentShifts = async () => {
      if (!selectedShop?._id) return;
      try {
        // Get all shifts and users
        const [shifts, users] = (await Promise.all([
          apiClient.getScheduledShifts(),
          apiClient.getUsers(),
        ])) as [ScheduledShift[], User[]];

        // Get current time
        const now = new Date();
        const currentHour = now.getHours();
        const currentDay = now.getDay(); // 0-6, Sunday-Saturday

        console.log("Debug data:", {
          shifts,
          users,
          selectedShop: selectedShop._id,
          currentTime: now.toLocaleTimeString(),
          currentDay,
        });

        // Filter shifts that are currently active
        const activeShifts = shifts.filter((shift: ScheduledShift) => {
          // First check if shift belongs to selected shop
          if (shift.coffeeShopId !== selectedShop._id) {
            console.log("Shift skipped - wrong shop:", {
              shiftShop: shift.coffeeShopId,
              selectedShop: selectedShop._id,
            });
            return false;
          }

          if (!shift.isActive) {
            console.log("Shift skipped - inactive:", shift);
            return false;
          }

          if (!shift.weekdays.includes(currentDay)) {
            console.log("Shift skipped - wrong day:", {
              shiftDays: shift.weekdays,
              currentDay,
            });
            return false;
          }

          const startHour = parseInt(shift.startTime.split(":")[0]);
          const endHour = parseInt(shift.endTime.split(":")[0]);
          const isActive = currentHour >= startHour && currentHour < endHour;

          console.log("Shift time check:", {
            shift,
            startHour,
            endHour,
            currentHour,
            isActive,
            employeeName: users.find((u) => u._id === shift.employeeId)?.name,
          });

          return isActive;
        });

        // Get unique employee IDs from active shifts
        const employeeIds = [
          ...new Set(
            activeShifts.map((shift: ScheduledShift) => shift.employeeId)
          ),
        ];

        // Get employee details
        const currentEmployees = users
          .filter((user: User) => employeeIds.includes(user._id))
          .filter((user: User) =>
            ["employee", "administrator"].includes(user.role)
          ); // Show both employees and administrators

        setCurrentBaristas(currentEmployees);
      } catch (err) {
        console.error("Error loading current shifts:", err);
      } finally {
        setLoading(false);
      }
    };

    getCurrentShifts();
    // Refresh every minute
    const interval = setInterval(getCurrentShifts, 60000);
    return () => clearInterval(interval);
  }, [selectedShop]);

  if (loading || currentBaristas.length === 0) return null;

  return (
    <div className="bg-green-50 rounded-lg p-3 mb-6 flex items-center gap-2">
      <Clock className="w-4 h-4 text-green-600 flex-shrink-0" />
      <div className="text-sm">
        <span className="text-green-800">Currently working: </span>
        <span className="text-green-700 font-medium">
          {currentBaristas.map((barista) => barista.name).join(", ")}
        </span>
      </div>
    </div>
  );
}
