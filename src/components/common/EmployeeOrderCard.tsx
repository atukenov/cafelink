import { Order } from "@/lib/types";
import React, { useState } from "react";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface EmployeeOrderCardProps {
  order: Order;
  onStatusUpdate: (
    orderId: string,
    status: string,
    estimatedTime?: number,
    rejectionReason?: string
  ) => Promise<void>;
  onReject: (orderId: string) => void;
}

export const EmployeeOrderCard: React.FC<EmployeeOrderCardProps> = ({
  order,
  onStatusUpdate,
  onReject,
}) => {
  const [estimatedTime, setEstimatedTime] = useState<number>(15);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          <div>
            <h3 className="font-semibold text-gray-800">
              Order #{order._id.slice(-6)}
            </h3>
            <div className="text-xs text-gray-500">
              Received: {formatDate(order.createdAt)}
            </div>
            {order.status === "ready" && order.updatedAt && (
              <div className="text-xs text-green-600">
                Completed: {formatDate(order.updatedAt)}
              </div>
            )}
          </div>
        </div>
      </div>

      {order.status === "rejected" && order.rejectionReason && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            <strong>Rejection reason:</strong> {order.rejectionReason}
          </p>
        </div>
      )}

      <div className="mb-3">
        <p className="text-sm text-gray-600 mb-1">
          Items: {order.items.length}
        </p>
        <p className="font-semibold text-lg text-amber-600">
          {order.totalPrice} ₸
        </p>
        {order.customerName && (
          <p className="text-sm text-gray-600">
            Customer: {order.customerName}
          </p>
        )}
        {order.estimatedTime && (
          <p className="text-sm text-green-600">
            Estimated: {order.estimatedTime} min
          </p>
        )}
      </div>

      <div className="flex gap-2">
        {order.status === "received" && (
          <button
            onClick={() => onStatusUpdate(order._id, "viewed")}
            className="flex-1 bg-yellow-600 text-white py-2 px-3 rounded-lg hover:bg-yellow-700 text-sm"
          >
            Mark Viewed
          </button>
        )}

        {order.status === "viewed" && (
          <>
            <div className="flex-1 flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={estimatedTime}
                onChange={(e) =>
                  setEstimatedTime(parseInt(e.target.value) || 15)
                }
                className="w-16 px-2 py-1 border rounded text-sm"
                min="1"
                max="60"
              />
              <button
                onClick={() =>
                  onStatusUpdate(order._id, "accepted", estimatedTime)
                }
                className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 text-sm"
              >
                Accept
              </button>
            </div>
            <button
              onClick={() => onReject(order._id)}
              className="bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 text-sm"
            >
              Reject
            </button>
          </>
        )}

        {order.status === "accepted" && (
          <button
            onClick={() => onStatusUpdate(order._id, "ready")}
            className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 text-sm"
          >
            Mark Ready
          </button>
        )}
      </div>
    </div>
  );
};
