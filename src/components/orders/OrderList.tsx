'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, CheckCircle, Coffee, XCircle, ShoppingBag } from 'lucide-react';
import { Order } from '@/lib/types';

interface OrderListProps {
  orders: Order[];
  emptyMessage?: string;
  showActions?: boolean;
  className?: string;
}

export const OrderList: React.FC<OrderListProps> = ({ 
  orders, 
  emptyMessage = "No orders yet",
  showActions = true,
  className = '' 
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received':
      case 'viewed':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'accepted':
        return <Coffee className="w-4 h-4 text-blue-500" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
      case 'viewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (orders.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-sm p-8 text-center ${className}`}>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{emptyMessage}</h3>
        {showActions && (
          <>
            <p className="text-gray-600 mb-4">Start by ordering some delicious coffee!</p>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Browse Menu
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {orders.map((order) => (
        <Link
          key={order._id}
          href={`/orders/${order._id}`}
          className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(order.status)}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">
                Order #{order._id.slice(-6)}
              </p>
              <p className="text-sm text-gray-600">
                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </p>
              {order.estimatedTime && order.status === 'accepted' && (
                <p className="text-sm text-green-600">
                  Ready in ~{order.estimatedTime} minutes
                </p>
              )}
            </div>
            <p className="font-bold text-amber-600">{order.totalPrice} ₸</p>
          </div>
        </Link>
      ))}
    </div>
  );
};
