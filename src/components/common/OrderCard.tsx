import { Order } from "@/lib/types";
import { XCircle } from "lucide-react";
import React from "react";
import RatingModal from "../RatingModal";
import StarRating from "../StarRating";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrderCardProps {
  order: Order;
  onRatingSubmitted?: () => void;
  onClick?: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onRatingSubmitted,
  onClick,
}) => {
  return (
    <div
      onClick={(e) => {
        // If the click was on the rate order button or its parent modal, don't navigate
        if ((e.target as HTMLElement).closest(".rating-modal-container")) {
          e.preventDefault();
          return;
        }
        onClick?.();
      }}
      className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <OrderStatusBadge status={order.status} />
        <span className="text-sm text-gray-500">
          {new Date(order.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Rejection Reason Display */}
      {order.status === "rejected" && order.rejectionReason && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Order Rejected</p>
            <p className="text-sm text-red-700">{order.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* Rating Section for Completed Orders */}
      {order.status === "ready" && !order.rating && (
        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg rating-modal-container">
          <p className="text-sm font-medium text-green-800 mb-2">
            Order Ready!
          </p>
          <p className="text-sm text-green-700 mb-3">
            Please rate your experience:
          </p>
          <RatingModal
            orderId={order._id}
            onRatingSubmitted={onRatingSubmitted || (() => {})}
          />
        </div>
      )}

      {/* Show Rating if Already Submitted */}
      {order.rating && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-800">Your Rating:</p>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={order.rating} readonly size="sm" />
            <span className="text-sm text-blue-700">({order.rating}/5)</span>
          </div>
          {order.ratingComment && (
            <p className="text-sm text-blue-700 mt-1">
              &quot;{order.ratingComment}&quot;
            </p>
          )}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-gray-800">
            Order #{order._id.slice(-6)}
          </p>
          <p className="text-sm text-gray-600">
            {order.items.length} item
            {order.items.length !== 1 ? "s" : ""}
          </p>
          {order.estimatedTime && order.status === "accepted" && (
            <p className="text-sm text-green-600">
              Ready in ~{order.estimatedTime} minutes
            </p>
          )}
        </div>
        <p className="font-bold text-amber-600">{order.totalPrice} ₸</p>
      </div>
    </div>
  );
};
