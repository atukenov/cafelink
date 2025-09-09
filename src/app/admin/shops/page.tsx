'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, MapPin, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { CoffeeShop, User } from '@/lib/types';
import { useToast } from '@/components/Toast';

export default function AdminShopsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<{ _id: string; name: string; role: string } | null>(null);
  const [shops, setShops] = useState<CoffeeShop[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingShop, setEditingShop] = useState<CoffeeShop | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    adminId: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/admin/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (!['admin', 'author'].includes(parsedUser.role)) {
      router.push('/admin/login');
      return;
    }

    setUser(parsedUser);
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const [shopsData, usersData] = await Promise.all([
        apiClient.getCoffeeShops(),
        apiClient.getUsers()
      ]);
      setShops(shopsData);
      setAdmins(usersData.filter((u: User) => ['admin', 'author'].includes(u.role)));
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location || !formData.address || !formData.adminId) {
      setError('All fields are required');
      return;
    }

    try {
      if (editingShop) {
        await apiClient.updateCoffeeShop(editingShop._id, {
          name: formData.name,
          location: formData.location,
          address: formData.address,
          isActive: true
        });
        showToast({
          type: 'success',
          title: 'Shop Updated',
          message: 'Coffee shop has been updated successfully',
        });
      } else {
        await apiClient.createCoffeeShop(formData);
        showToast({
          type: 'success',
          title: 'Shop Created',
          message: 'Coffee shop has been created successfully',
        });
      }
      
      setShowForm(false);
      setEditingShop(null);
      setFormData({ name: '', location: '', address: '', adminId: '' });
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save shop');
    }
  };

  const handleEdit = (shop: CoffeeShop) => {
    setEditingShop(shop);
    setFormData({
      name: shop.name,
      location: shop.location,
      address: shop.address,
      adminId: shop.adminId
    });
    setShowForm(true);
  };

  const handleDelete = async (shopId: string) => {
    if (!confirm('Are you sure you want to delete this coffee shop?')) return;

    try {
      await apiClient.deleteCoffeeShop(shopId);
      showToast({
        type: 'success',
        title: 'Shop Deleted',
        message: 'Coffee shop has been deleted successfully',
      });
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete shop');
    }
  };

  const getAdminName = (adminId: string) => {
    const admin = admins.find(a => a._id === adminId);
    return admin?.name || 'Unknown';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shops...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-800">Coffee Shops</h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {shops.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No coffee shops found</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Create First Shop
              </button>
            </div>
          ) : (
            shops.map((shop) => (
              <div key={shop._id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{shop.name}</h3>
                    <p className="text-sm text-gray-600">{shop.location}</p>
                    <p className="text-xs text-gray-500 mt-1">{shop.address}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Admin: {getAdminName(shop.adminId)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        shop.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {shop.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(shop)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {user.role === 'author' && (
                      <button
                        onClick={() => handleDelete(shop._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">
                  {editingShop ? 'Edit Coffee Shop' : 'Create New Coffee Shop'}
                </h3>
              </div>
              
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shop Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Coffee Shop Name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="City, District"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                    placeholder="Full address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin
                  </label>
                  <select
                    value={formData.adminId}
                    onChange={(e) => setFormData(prev => ({ ...prev, adminId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Select Admin</option>
                    {admins.map(admin => (
                      <option key={admin._id} value={admin._id}>
                        {admin.name} ({admin.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingShop(null);
                      setFormData({ name: '', location: '', address: '', adminId: '' });
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                  >
                    {editingShop ? 'Update' : 'Create'} Shop
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
