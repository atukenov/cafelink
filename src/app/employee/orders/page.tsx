'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Eye, CheckCircle, XCircle, Coffee } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Order } from '@/lib/types';
import { socketManager } from '@/lib/socket';

export default function EmployeeOrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ _id: string; name: string; role: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estimatedTimes, setEstimatedTimes] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/employee/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (!['employee', 'admin'].includes(parsedUser.role)) {
      router.push('/employee/login');
      return;
    }

    setUser(parsedUser);
    loadOrders();
    
    const socket = socketManager.connect();
    socketManager.joinEmployee();
    
    socketManager.onNewOrder((orderData) => {
      setOrders(prev => [orderData, ...prev]);
    });

    socketManager.onOrderUpdated((data) => {
      setOrders(prev => prev.map(order => 
        order._id === data.orderId 
          ? { ...order, status: data.status, estimatedTime: data.estimatedTime, updatedAt: new Date().toISOString() }
          : order
      ));
    });

    return () => {
      socketManager.offNewOrder();
      socketManager.offOrderUpdated();
    };
  }, [router]);

  const loadOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data.sort((a: Order, b: Order) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (err) {
      setError('Failed to load orders');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, estimatedTime?: number) => {
    try {
      const updateData: any = { status };
      if (estimatedTime && status === 'accepted') {
        updateData.estimatedTime = estimatedTime;
      }

      await apiClient.updateOrderStatus(orderId, updateData);
      socketManager.emitOrderStatusUpdate(orderId, status, estimatedTime);
      
      setOrders(prev => prev.map(order => 
        order._id === orderId 
          ? { ...order, status, estimatedTime, updatedAt: new Date().toISOString() }
          : order
      ));
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status');
    }
  };

  const handleAcceptOrder = (orderId: string) => {
    const estimatedTime = estimatedTimes[orderId] || 15;
    updateOrderStatus(orderId, 'accepted', estimatedTime);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-blue-100 text-blue-800';
      case 'viewed': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'ready': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received': return Clock;
      case 'viewed': return Eye;
      case 'accepted': return Coffee;
      case 'rejected': return XCircle;
      case 'ready': return CheckCircle;
      default: return Clock;
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
          <Link href="/employee/dashboard" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Order Management</h1>
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
          <div className="text-center py-8">
            <p className="text-gray-600">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const StatusIcon = getStatusIcon(order.status);
              return (
                <div key={order._id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <StatusIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          Order #{order._id.slice(-6)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">Items: {order.items.length}</p>
                    <p className="font-semibold text-lg text-amber-600">{order.totalPrice} ₸</p>
                    {order.customerName && (
                      <p className="text-sm text-gray-600">Customer: {order.customerName}</p>
                    )}
                    {order.estimatedTime && (
                      <p className="text-sm text-green-600">Estimated: {order.estimatedTime} min</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {order.status === 'received' && (
                      <button
                        onClick={() => updateOrderStatus(order._id, 'viewed')}
                        className="flex-1 bg-yellow-600 text-white py-2 px-3 rounded-lg hover:bg-yellow-700 text-sm"
                      >
                        Mark Viewed
                      </button>
                    )}
                    
                    {order.status === 'viewed' && (
                      <>
                        <div className="flex-1 flex gap-2">
                          <input
                            type="number"
                            placeholder="Min"
                            value={estimatedTimes[order._id] || ''}
                            onChange={(e) => setEstimatedTimes(prev => ({
                              ...prev,
                              [order._id]: parseInt(e.target.value) || 15
                            }))}
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
                          onClick={() => updateOrderStatus(order._id, 'rejected')}
                          className="bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 text-sm"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    
                    {order.status === 'accepted' && (
                      <button
                        onClick={() => updateOrderStatus(order._id, 'ready')}
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
      </div>
    </div>
  );
}
