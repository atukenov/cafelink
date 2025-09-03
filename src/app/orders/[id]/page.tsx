'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, CheckCircle, Coffee, MapPin } from 'lucide-react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Order } from '@/lib/types';

export default function OrderStatusPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      loadOrder();
      const interval = setInterval(loadOrder, 30000);
      return () => clearInterval(interval);
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const data = await apiClient.getOrder(orderId);
      setOrder(data);
    } catch (err) {
      setError('Failed to load order details');
      console.error('Error loading order:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { key: 'pending', label: 'Order Received', icon: Clock },
      { key: 'accepted', label: 'Preparing', icon: Coffee },
      { key: 'ready', label: 'Ready for Pickup', icon: CheckCircle },
    ];

    const currentIndex = steps.findIndex(step => step.key === order?.status);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  const getEstimatedTime = () => {
    if (!order) return '';
    
    const orderTime = new Date(order.createdAt);
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - orderTime.getTime()) / 1000 / 60);
    
    switch (order.status) {
      case 'pending':
        return '5-10 minutes';
      case 'accepted':
        return `${Math.max(5 - elapsed, 1)}-${Math.max(10 - elapsed, 2)} minutes`;
      case 'ready':
        return 'Ready now!';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
          <Link
            href="/orders"
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const statusSteps = getStatusSteps();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/orders" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Order Status</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Order Info */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Order #{order._id.slice(-6)}
            </h2>
            <p className="text-sm text-gray-600">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Status Progress */}
          <div className="space-y-4 mb-6">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? 'bg-green-100 text-green-600' 
                      : step.current
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <p className={`font-medium ${
                      step.completed || step.current ? 'text-gray-800' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </p>
                    {step.current && (
                      <p className="text-sm text-amber-600">
                        Estimated time: {getEstimatedTime()}
                      </p>
                    )}
                  </div>
                  
                  {step.completed && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Pickup Location */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-800">Pickup Location</span>
            </div>
            <p className="text-gray-600 ml-8">
              CafeLink Coffee Shop<br />
              Atyrau, Kazakhstan
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">Order Items</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.productId} className="flex justify-between">
                <span className="text-gray-600">Item x{item.quantity}</span>
                <span className="font-medium">Product ID: {item.productId.slice(-6)}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t mt-3 pt-3">
            <div className="flex justify-between">
              <span className="font-semibold text-lg">Total</span>
              <span className="font-bold text-lg text-amber-600">{order.totalPrice} ₸</span>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        {(order.customerName || order.customerPhone) && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Customer Information</h3>
            {order.customerName && (
              <p className="text-gray-600 mb-1">Name: {order.customerName}</p>
            )}
            {order.customerPhone && (
              <p className="text-gray-600">Phone: {order.customerPhone}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
