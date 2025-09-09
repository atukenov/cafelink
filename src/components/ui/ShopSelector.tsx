'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import { useShop } from '@/contexts/ShopContext';

export default function ShopSelector() {
  const { selectedShop, userShops, setSelectedShop, loading } = useShop();

  if (loading || userShops.length <= 1) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <MapPin className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">Coffee Shop</h3>
      </div>
      
      <select
        value={selectedShop?._id || ''}
        onChange={(e) => {
          const shop = userShops.find(s => s._id === e.target.value);
          setSelectedShop(shop || null);
        }}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {userShops.map((shop) => (
          <option key={shop._id} value={shop._id}>
            {shop.name} - {shop.location}
          </option>
        ))}
      </select>
      
      {selectedShop && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Current:</strong> {selectedShop.name}
          </p>
          <p className="text-xs text-blue-600">{selectedShop.address}</p>
        </div>
      )}
    </div>
  );
}
