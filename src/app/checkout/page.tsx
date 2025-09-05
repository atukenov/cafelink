'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Banknote } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { CartItem } from '@/lib/types';
import QRCode from '@/components/QRCode';
import { socketManager } from '@/lib/socket';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'kaspi' | 'cash'>('kaspi');
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cartData = JSON.parse(savedCart);
      setCart(cartData);
      if (cartData.length === 0) {
        router.push('/menu');
      }
    } else {
      router.push('/menu');
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const itemTotal = item.price * item.quantity;
      const additionalItemsTotal = item.selectedAdditionalItems?.reduce(
        (addTotal, addItem) => addTotal + (addItem.price * addItem.quantity * item.quantity), 0
      ) || 0;
      return total + itemTotal + additionalItemsTotal;
    }, 0);
  };

  const handlePayment = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (paymentMethod === 'kaspi') {
      setShowQR(true);
      return;
    }

    await processOrder();
  };

  const processOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      const orderData = {
        items: cart.map(item => ({
          productId: item._id,
          quantity: item.quantity,
          additionalItems: item.selectedAdditionalItems?.map(addItem => ({
            additionalItemId: addItem.additionalItemId,
            quantity: addItem.quantity
          })) || []
        })),
        totalPrice: getTotalPrice(),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
      };

      const order = await apiClient.createOrder(orderData);
      
      const socket = socketManager.connect();
      socketManager.emitNewOrder(order);
      
      localStorage.removeItem('cart');
      
      router.push(`/orders/${order._id}`);
    } catch (err) {
      setError('Failed to create order. Please try again.');
      console.error('Error creating order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQRPayment = async () => {
    setLoading(true);
    setTimeout(async () => {
      await processOrder();
    }, 2000);
  };

  if (showQR) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
            <button
              onClick={() => setShowQR(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Kaspi Payment</h1>
          </div>
        </div>

        <div className="max-w-md mx-auto p-4">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Scan QR Code to Pay</h2>
            <p className="text-gray-600 mb-6">
              Open Kaspi app and scan this QR code to pay {getTotalPrice()} ₸
            </p>
            
            <QRCode 
              value={`kaspi://pay?amount=${getTotalPrice()}&merchant=CafeLink&order=${Date.now()}`}
              size={200}
              className="mb-6"
            />
            
            <div className="space-y-3">
              <button
                onClick={handleQRPayment}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                {loading ? 'Processing...' : 'I Have Paid'}
              </button>
              
              <button
                onClick={() => setShowQR(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/cart" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Checkout</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Customer Information */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-4">Customer Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Enter your name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="+7 (xxx) xxx-xx-xx"
              />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-4">Payment Method</h3>
          
          <div className="space-y-3">
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="payment"
                value="kaspi"
                checked={paymentMethod === 'kaspi'}
                onChange={(e) => setPaymentMethod(e.target.value as 'kaspi')}
                className="mr-3"
              />
              <CreditCard className="w-5 h-5 mr-3 text-blue-600" />
              <span className="font-medium">Kaspi QR</span>
            </label>
            
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="payment"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
                className="mr-3"
              />
              <Banknote className="w-5 h-5 mr-3 text-green-600" />
              <span className="font-medium">Pay with Cash</span>
            </label>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
          <div className="space-y-2">
            {cart.map((item) => (
              <div key={item._id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{item.price * item.quantity} ₸</span>
                </div>
                {item.selectedAdditionalItems && item.selectedAdditionalItems.length > 0 && (
                  <div className="ml-4 space-y-1">
                    {item.selectedAdditionalItems.map((addItem) => (
                      <div key={addItem.additionalItemId} className="flex justify-between text-xs text-gray-600">
                        <span>+ {addItem.name} x{addItem.quantity}</span>
                        <span>+{addItem.price * addItem.quantity * item.quantity} ₸</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="border-t pt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-amber-600">{getTotalPrice()} ₸</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Place Order Button */}
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
        >
          {loading ? 'Processing...' : `Place Order - ${getTotalPrice()} ₸`}
        </button>
      </div>
    </div>
  );
}
