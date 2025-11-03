"use client";

import {
  EmployeeOrderCard,
  EmptyState,
  LoadingState,
  PageHeader,
  RejectOrderModal,
} from "@/components/common";
import { useToast } from "@/components/Toast";
import { apiClient } from "@/lib/api";
import { socketManager } from "@/lib/socket";
import { IOrder } from "@/models/Order";
import { Order } from "@/types/order";
import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EmployeeOrdersPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<{
    _id: string;
    name: string;
    role: string;
  } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

    socketManager.connect();
    socketManager.joinEmployee();

    socketManager.onNewOrder((orderData) => {
      showToast({
        type: "info",
        title: "New Order!",
        message: `Order #${orderData._id.slice(-6)} received`,
      });
      setOrders((prev) => [
        {
          ...orderData,
          createdAt: orderData.createdAt.toISOString(),
          updatedAt: (orderData.updatedAt || new Date()).toISOString(),
        } as Order,
        ...prev,
      ]);
    });

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
    });

    return () => {
      socketManager.offNewOrder();
      socketManager.offOrderUpdated();
    };
  }, [router, showToast]);

  const loadOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();

      const today = new Date().toDateString();
      const todaysOrders = data
        .map((order: IOrder) => ({
          ...order,
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt.toISOString(),
        }))
        .filter(
          (order: Order) => new Date(order.createdAt).toDateString() === today
        );

      const sortedOrders = todaysOrders.sort((a: Order, b: Order) => {
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
      });

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
              } as Order)
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

  if (!user || loading) {
    return (
      <LoadingState message={!user ? "Loading..." : "Loading orders..."} />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Orders" backHref="/employee/dashboard" />

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

      <div className="max-w-md mx-auto p-4">
        {error ? (
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
          <EmptyState
            icon={ShoppingBag}
            title="No orders today"
            description="Orders will appear here when customers place them"
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <EmployeeOrderCard
                key={order._id}
                order={order}
                onStatusUpdate={updateOrderStatus}
                onReject={(orderId) => setShowRejectModal(orderId)}
              />
            ))}
          </div>
        )}

        {showRejectModal && (
          <RejectOrderModal
            onReject={async () => {
              await handleRejectOrder();
              setShowRejectModal(null);
            }}
            onCancel={() => {
              setShowRejectModal(null);
              setRejectionReason("");
            }}
          />
        )}
      </div>
    </div>
  );
}
