import { Order } from "@/lib/types";
import { CheckCircle, Clock, Coffee, XCircle } from "lucide-react";
import React from "react";

type OrderStatus = Order["status"];

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: "sm" | "md";
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  size = "md",
}) => {
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "received":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "viewed":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "accepted":
        return <Coffee className="w-5 h-5 text-green-500" />;
      case "ready":
        return <CheckCircle className="w-5 h-5 text-purple-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "received":
        return "Order Received";
      case "viewed":
        return "Being Reviewed";
      case "accepted":
        return "Preparing";
      case "ready":
        return "Ready for Pickup";
      case "rejected":
        return "Rejected";
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "received":
        return "text-blue-600 bg-blue-50";
      case "viewed":
        return "text-yellow-600 bg-yellow-50";
      case "accepted":
        return "text-green-600 bg-green-50";
      case "ready":
        return "text-purple-600 bg-purple-50";
      case "rejected":
        return "text-red-600 bg-red-50";
    }
  };

  return (
    <div className="flex items-center gap-2">
      {getStatusIcon(status)}
      <span
        className={`px-2 py-1 rounded-full ${
          size === "sm" ? "text-xs" : "text-sm"
        } font-medium ${getStatusColor(status)}`}
      >
        {getStatusText(status)}
      </span>
    </div>
  );
};
