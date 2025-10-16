"use client";

import { useToast } from "@/components/Toast";
import { apiClient } from "@/lib/api";
import { socketManager } from "@/lib/socket";
import { IOrder, IOrderItem } from "@/models/Order";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Coffee,
  Eye,
  ShoppingBag,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface FrontendOrder {
  _id: string;
  userId: string;
  coffeeShopId: string;
  items: IOrderItem[];
  status: "received" | "viewed" | "accepted" | "rejected" | "ready";
  totalPrice: number;
  customerName?: string;
  customerPhone?: string;
  estimatedTime?: number;
  rejectionReason?: string;
  rating?: number;
  ratingComment?: string;
  createdAt: string;
  updatedAt?: string;
}

export default function EmployeeOrdersPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<{
    _id: string;
    name: string;
    role: string;
  } | null>(null);
  const [orders, setOrders] = useState<FrontendOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estimatedTimes, setEstimatedTimes] = useState<{
    [key: string]: number;
  }>({});
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/employee/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (
      !["employee", "admin", "administrator", "author"].includes(
        parsedUser.role
      )
    ) {
      router.push("/employee/login");
      return;
    }

    setUser(parsedUser);
    loadOrders();

    const socket = socketManager.connect();
    socketManager.joinEmployee();

    socketManager.onNewOrder((orderData: IOrder) => {
      const frontendOrder: FrontendOrder = {
        ...orderData,
        createdAt: orderData.createdAt.toISOString(),
        updatedAt: orderData.updatedAt?.toISOString(),
      };
      showToast({
        type: "info",
        title: "New Order!",
        message: `Order #${frontendOrder._id.slice(-6)} received`,
      });
      setOrders((prev) => [frontendOrder, ...prev]);
    });

    socketManager.onOrderUpdated((data: IOrder) => {
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
    });

    return () => {
      socketManager.offNewOrder();
      socketManager.offOrderUpdated();
    };
  }, [router]);

  const loadOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();

      const today = new Date().toDateString();
      const todaysOrders = data.filter(
        (order: FrontendOrder) =>
          new Date(order.createdAt).toDateString() === today
      );

      const sortedOrders = todaysOrders.sort(
        (a: FrontendOrder, b: FrontendOrder) => {
          const statusPriority = {
            received: 1,
            viewed: 2,
            accepted: 2,
            ready: 3,
            rejected: 4,
          };
          return (
            (statusPriority[a.status as keyof typeof statusPriority] || 5) -
            (statusPriority[b.status as keyof typeof statusPriority] || 5)
          );
        }
      );

      setOrders(sortedOrders);
    } catch (err) {
      setError("Failed to load orders");
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: string,
    estimatedTime?: number,
    rejectionReason?: string
  ) => {
    try {
      interface OrderUpdateData {
        status: string;
        estimatedTime?: number;
        rejectionReason?: string;
      }
      const updateData: OrderUpdateData = { status };
      if (estimatedTime && status === "accepted") {
        updateData.estimatedTime = estimatedTime;
      }
      if (rejectionReason && status === "rejected") {
        updateData.rejectionReason = rejectionReason;
      }

      await apiClient.updateOrderStatus(orderId, updateData);
      socketManager.emitOrderStatusUpdate(orderId, status, estimatedTime);

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? ({
                ...order,
                status,
                estimatedTime,
                rejectionReason,
                updatedAt: new Date().toISOString(),
              } as FrontendOrder)
            : order
        )
      );

      showToast({
        type: "success",
        title: "Order Updated",
        message: `Order status changed to ${status}`,
      });
    } catch (err) {
      console.error("Error updating order status:", err);
      setError("Failed to update order status");
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to update order status",
      });
    }
  };

  const handleAcceptOrder = (orderId: string) => {
    const estimatedTime = estimatedTimes[orderId] || 15;
    updateOrderStatus(orderId, "accepted", estimatedTime);
  };

  const handleRejectOrder = async () => {
    if (!showRejectModal || !rejectionReason.trim()) return;

    await updateOrderStatus(
      showRejectModal,
      "rejected",
      undefined,
      rejectionReason.trim()
    );
    setShowRejectModal(null);
    setRejectionReason("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received":
        return "bg-blue-100 text-blue-800";
      case "viewed":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "ready":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "received":
        return Clock;
      case "viewed":
        return Eye;
      case "accepted":
        return Coffee;
      case "rejected":
        return XCircle;
      case "ready":
        return CheckCircle;
      default:
        return Clock;
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/employee/dashboard"
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Orders</h1>
        </div>

        <div className="max-w-md mx-auto px-4 pb-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Today&apos;s Orders
            </h2>
            <p className="text-sm text-gray-600">
              {orders.length} order{orders.length !== 1 ? "s" : ""} • Sorted by
              priority
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadOrders}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No orders today
            </h2>
            <p className="text-gray-600">
              Orders will appear here when customers place them
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const StatusIcon = getStatusIcon(order.status);
              return (
                <div
                  key={order._id}
                  className="bg-white rounded-xl shadow-sm p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <StatusIcon className="w-5 h-5 text-blue-600" />
                      </div>
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
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {order.status === "rejected" && order.rejectionReason && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">
                        <strong>Rejection reason:</strong>{" "}
                        {order.rejectionReason}
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
                        onClick={() => updateOrderStatus(order._id, "viewed")}
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
                            value={estimatedTimes[order._id] || ""}
                            onChange={(e) =>
                              setEstimatedTimes((prev) => ({
                                ...prev,
                                [order._id]: parseInt(e.target.value) || 15,
                              }))
                            }
                            className="w-16 px-2 py-1 border rounded text-sm"
                            min="1"
                            max="60"
                          />
                          <button
                            onClick={() => handleAcceptOrder(order._id)}
                            className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 text-sm"
                          >
                            Accept
                          </button>
                        </div>
                        <button
                          onClick={() => setShowRejectModal(order._id)}
                          className="bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 text-sm"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {order.status === "accepted" && (
                      <button
                        onClick={() => updateOrderStatus(order._id, "ready")}
                        className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 text-sm"
                      >
                        Mark Ready
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Reject Order
                </h3>
              </div>

              <p className="text-gray-600 mb-4">
                Please provide a reason for rejecting this order. This will be
                sent to the customer.
              </p>

              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4"
                rows={3}
                placeholder="e.g., Item out of stock, Equipment maintenance, etc."
              />

              <div className="flex gap-3">
                <button
                  onClick={handleRejectOrder}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Reject Order
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(null);
                    setRejectionReason("");
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
