"use client";

import {
  EmptyState,
  LoadingState,
  OrderCard,
  PageHeader,
} from "@/components/common";
import { useToast } from "@/components/Toast";
import { socketManager } from "@/lib/socket";
import { Order } from "@/lib/types";
import { Coffee, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  }, [router, showToast]);

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

  // Status handling moved to OrderStatusBadge component

  if (!client || loading) {
    return <LoadingState message="Loading orders..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="My Orders" backHref="/" />

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
          <EmptyState
            icon={Coffee}
            title="No orders yet"
            description="Start by ordering some delicious coffee!"
            action={{
              label: "Browse Menu",
              onClick: () => router.push("/menu"),
            }}
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onClick={() => router.push(`/orders/${order._id}`)}
                onRatingSubmitted={() => {
                  loadOrders(client);
                  router.push(`/orders/${order._id}`);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
