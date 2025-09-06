'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, ShoppingCart, X } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Product, CartItem, AdditionalItem } from '@/lib/types';

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAdditionalItems, setShowAdditionalItems] = useState(false);
  const [selectedAdditionalItems, setSelectedAdditionalItems] = useState<{
    additionalItemId: string;
    quantity: number;
    name: string;
    price: number;
  }[]>([]);
  const [currentEmployees, setCurrentEmployees] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    loadCart();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, employeesData] = await Promise.all([
        apiClient.getProducts(),
        apiClient.getCurrentShifts()
      ]);
      setProducts(productsData);
      setCurrentEmployees(employeesData);
    } catch (err) {
      setError('Failed to load menu');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await apiClient.getProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to load menu');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const openAdditionalItemsModal = (product: Product) => {
    setSelectedProduct(product);
    setSelectedAdditionalItems([]);
    setShowAdditionalItems(true);
  };

  const addAdditionalItem = (additionalItem: AdditionalItem) => {
    const existing = selectedAdditionalItems.find(item => item.additionalItemId === additionalItem._id);
    if (existing) {
      setSelectedAdditionalItems(prev => 
        prev.map(item => 
          item.additionalItemId === additionalItem._id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setSelectedAdditionalItems(prev => [...prev, {
        additionalItemId: additionalItem._id,
        quantity: 1,
        name: additionalItem.name,
        price: additionalItem.price
      }]);
    }
  };

  const removeAdditionalItem = (additionalItemId: string) => {
    setSelectedAdditionalItems(prev => 
      prev.filter(item => item.additionalItemId !== additionalItemId)
    );
  };

  const addToCart = (product?: Product) => {
    const productToAdd = product || selectedProduct;
    if (!productToAdd) return;

    const existingItem = cart.find(item => item._id === productToAdd._id);
    let newCart: CartItem[];

    const cartItem: CartItem = {
      ...productToAdd,
      quantity: 1,
      selectedAdditionalItems: selectedAdditionalItems.length > 0 ? [...selectedAdditionalItems] : undefined
    };

    if (existingItem && selectedAdditionalItems.length === 0) {
      newCart = cart.map(item =>
        item._id === productToAdd._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, cartItem];
    }

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    
    if (showAdditionalItems) {
      setShowAdditionalItems(false);
      setSelectedProduct(null);
      setSelectedAdditionalItems([]);
    }
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadProducts}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-800">Menu</h1>
          </div>
          
          <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-full">
            <ShoppingCart className="w-6 h-6" />
            {getCartItemCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getCartItemCount()}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-md mx-auto p-4">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No menu items available</p>
            <p className="text-sm text-gray-500">Please check back later</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex gap-4">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-20 h-20 rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-coffee.jpg';
                    }}
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
                    <p className="text-amber-600 font-bold text-lg mb-3">
                      {product.price} ₸
                    </p>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors flex-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                      {product.additionalItems && product.additionalItems.length > 0 && (
                        <button
                          onClick={() => openAdditionalItemsModal(product)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors"
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Additional Items Modal */}
      {showAdditionalItems && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Customize {selectedProduct.name}</h3>
                <button
                  onClick={() => setShowAdditionalItems(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Additional Items</h4>
                {selectedProduct.additionalItems && selectedProduct.additionalItems.length > 0 ? (
                  <div className="space-y-2">
                    {selectedProduct.additionalItems.map((item) => (
                      <div key={item._id} className="flex items-center justify-between p-2 border rounded-lg">
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <span className="text-amber-600 ml-2">+{item.price}₸</span>
                        </div>
                        <button
                          onClick={() => addAdditionalItem(item)}
                          className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No additional items available</p>
                )}
              </div>

              {selectedAdditionalItems.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">Selected Items</h4>
                  <div className="space-y-2">
                    {selectedAdditionalItems.map((item) => (
                      <div key={item.additionalItemId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div>
                          <span>{item.name}</span>
                          <span className="text-gray-600 ml-2">x{item.quantity}</span>
                          <span className="text-amber-600 ml-2">+{item.price * item.quantity}₸</span>
                        </div>
                        <button
                          onClick={() => removeAdditionalItem(item.additionalItemId)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setShowAdditionalItems(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => addToCart()}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
