'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem } from '@/lib/types';

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    const newCart = cart.map(item =>
      item._id === productId
        ? { ...item, quantity: newQuantity }
        : item
    );
    updateCart(newCart);
  };

  const removeItem = (productId: string) => {
    const newCart = cart.filter(item => item._id !== productId);
    updateCart(newCart);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const itemTotal = item.price * item.quantity;
      const additionalItemsTotal = item.selectedAdditionalItems?.reduce(
        (addTotal, addItem) => addTotal + (addItem.price * addItem.quantity * item.quantity), 0
      ) || 0;
      return total + itemTotal + additionalItemsTotal;
    }, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/menu" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Cart</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some delicious coffee to get started!</p>
            <Link
              href="/menu"
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item._id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex gap-4">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-coffee.jpg';
                      }}
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                      <p className="text-amber-600 font-bold mb-1">{item.price} ₸</p>
                      {item.selectedAdditionalItems && item.selectedAdditionalItems.length > 0 && (
                        <div className="mb-2">
                          {item.selectedAdditionalItems.map((addItem) => (
                            <p key={addItem.additionalItemId} className="text-sm text-gray-600">
                              + {addItem.name} (×{addItem.quantity}) +{addItem.price * addItem.quantity * item.quantity}₸
                            </p>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          
                          <span className="font-semibold text-lg w-8 text-center">
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items ({getTotalItems()})</span>
                  <span className="font-semibold">{getTotalPrice()} ₸</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-lg">Total</span>
                    <span className="font-bold text-lg text-amber-600">{getTotalPrice()} ₸</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center transition-colors"
            >
              Proceed to Checkout
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
