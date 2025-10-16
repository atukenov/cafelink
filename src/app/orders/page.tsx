"use client";

import StarRating from "@/components/StarRating";
import { useToast } from "@/components/Toast";
import { socketManager } from "@/lib/socket";
import { Order } from "@/lib/types";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Coffee,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function RatingModal({
  orderId,
  onRatingSubmitted,
}: {
  orderId: string;
  onRatingSubmitted: () => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitRating = async () => {
    if (rating === 0) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      if (response.ok) {
        setShowModal(false);
        onRatingSubmitted();
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg"
      >
        Rate Order
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Rate Your Experience</h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">How was your order?</p>
              <div className="flex justify-center">
                <StarRating
                  rating={rating}
                  onRatingChange={setRating}
                  size="lg"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about your experience..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={submitRating}
                disabled={rating === 0 || submitting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [client, setClient] = useState<{
    _id: string;
    name: string;
    phone: string;
  } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const clientData = localStorage.getItem("client");
    if (!clientData) {
      localStorage.setItem("returnUrl", "/orders");
      router.push("/client/login");
      return;
    }

    const parsedClient = JSON.parse(clientData);
    setClient(parsedClient);
    loadOrders(parsedClient);

    // const socket = socketManager.connect();
    socketManager.onOrderUpdated((data) => {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === data._id
            ? {
                ...order,
                status: data.status,
                estimatedTime: data.estimatedTime,
                updatedAt: new Date().toISOString(),
              }
            : order
        )
      );

      const statusMessages = {
        viewed: "Your order has been viewed by staff",
        accepted: "Your order is being prepared",
        ready: "Your order is ready for pickup!",
        rejected: "Your order has been rejected",
      };

      if (statusMessages[data.status as keyof typeof statusMessages]) {
        showToast({
          type:
            data.status === "rejected"
              ? "error"
              : data.status === "ready"
              ? "success"
              : "info",
          title: "Order Update",
          message: statusMessages[data.status as keyof typeof statusMessages],
        });
      }
    });

    return () => {
      socketManager.offOrderUpdated();
    };
  }, [router]);

  const loadOrders = async (clientData: { phone: string }) => {
    try {
      const response = await fetch(
        `/api/orders/client/${encodeURIComponent(clientData.phone)}`
      );
      if (response.ok) {
        const data = await response.json();
        setOrders(
          data.sort(
            (a: Order, b: Order) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
      } else {
        setOrders([]);
      }
    } catch (err) {
      setError("Failed to load orders");
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
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
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
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
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status: string) => {
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
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (!client || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">My Orders</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Client Info */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{client.name}</h3>
              <p className="text-sm text-gray-600">{client.phone}</p>
            </div>
          </div>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coffee className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No orders yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start by ordering some delicious coffee!
            </p>
            <Link
              href="/menu"
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                onClick={(e) => {
                  // If the click was on the rate order button or its parent modal, don't navigate
                  if (
                    (e.target as HTMLElement).closest(".rating-modal-container")
                  ) {
                    e.preventDefault();
                    return;
                  }
                  router.push(`/orders/${order._id}`);
                }}
                className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Rejection Reason Display */}
                {order.status === "rejected" && order.rejectionReason && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        Order Rejected
                      </p>
                      <p className="text-sm text-red-700">
                        {order.rejectionReason}
                      </p>
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
                      onRatingSubmitted={() => {
                        loadOrders(client);
                        router.push(`/orders/${order._id}`);
                      }}
                    />
                  </div>
                )}

                {/* Show Rating if Already Submitted */}
                {order.rating && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">
                      Your Rating:
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={order.rating} readonly size="sm" />
                      <span className="text-sm text-blue-700">
                        ({order.rating}/5)
                      </span>
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
                  <p className="font-bold text-amber-600">
                    {order.totalPrice} ₸
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
