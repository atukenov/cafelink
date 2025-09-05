'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Megaphone, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Promotion } from '@/lib/types';

export default function AdminPromotionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ _id: string; name: string; role: string } | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState({
    type: 'sale' as 'sale' | 'news',
    title: '',
    description: '',
    imageUrl: '',
    validFrom: '',
    validTo: '',
    isActive: true
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/admin/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (!['administrator', 'admin', 'author'].includes(parsedUser.role)) {
      router.push('/admin/login');
      return;
    }

    setUser(parsedUser);
    loadPromotions();
  }, [router]);

  const loadPromotions = async () => {
    try {
      const data = await apiClient.getPromotions();
      setPromotions(data);
    } catch (err) {
      setError('Failed to load promotions');
      console.error('Error loading promotions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.validFrom) {
      setError('Title, description, and valid from date are required');
      return;
    }

    try {
      if (editingPromotion) {
        await apiClient.updatePromotion(editingPromotion._id, formData);
      } else {
        await apiClient.createPromotion({
          ...formData,
          createdBy: user!._id
        });
      }
      
      setShowForm(false);
      setEditingPromotion(null);
      setFormData({
        type: 'sale',
        title: '',
        description: '',
        imageUrl: '',
        validFrom: '',
        validTo: '',
        isActive: true
      });
      await loadPromotions();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save promotion');
    }
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      type: promotion.type,
      title: promotion.title,
      description: promotion.description,
      imageUrl: promotion.imageUrl || '',
      validFrom: promotion.validFrom.split('T')[0],
      validTo: promotion.validTo ? promotion.validTo.split('T')[0] : '',
      isActive: promotion.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (promotionId: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;
    
    try {
      await apiClient.deletePromotion(promotionId);
      await loadPromotions();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete promotion');
    }
  };

  const toggleActive = async (promotion: Promotion) => {
    try {
      await apiClient.updatePromotion(promotion._id, {
        ...promotion,
        isActive: !promotion.isActive
      });
      await loadPromotions();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update promotion');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (validTo?: string) => {
    if (!validTo) return false;
    return new Date(validTo) < new Date();
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
          <p className="text-gray-600">Loading promotions...</p>
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
            <h1 className="text-xl font-bold text-gray-800">Sales & News</h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-full"
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

        {promotions.length === 0 ? (
          <div className="text-center py-12">
            <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No promotions created</h2>
            <p className="text-gray-600 mb-4">Create sales and news for your customers</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg"
            >
              Create Promotion
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {promotions.map((promotion) => (
              <div key={promotion._id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-1 rounded ${
                        promotion.type === 'sale' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {promotion.type.toUpperCase()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        promotion.isActive && !isExpired(promotion.validTo)
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {promotion.isActive && !isExpired(promotion.validTo) ? 'Active' : 'Inactive'}
                      </span>
                      {isExpired(promotion.validTo) && (
                        <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800">
                          Expired
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">{promotion.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{promotion.description}</p>
                    <div className="text-xs text-gray-500">
                      <p>Valid from: {formatDate(promotion.validFrom)}</p>
                      {promotion.validTo && (
                        <p>Valid to: {formatDate(promotion.validTo)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => toggleActive(promotion)}
                      className={`p-2 rounded ${
                        promotion.isActive 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {promotion.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(promotion)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(promotion._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">
                  {editingPromotion ? 'Edit Promotion' : 'Create New Promotion'}
                </h3>
              </div>
              
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'sale' | 'news' }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="sale">Sale</option>
                    <option value="news">News</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Promotion title..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                    placeholder="Describe the promotion..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL (optional)
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valid From
                    </label>
                    <input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valid To (optional)
                    </label>
                    <input
                      type="date"
                      value={formData.validTo}
                      onChange={(e) => setFormData(prev => ({ ...prev, validTo: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Active promotion
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingPromotion(null);
                      setFormData({
                        type: 'sale',
                        title: '',
                        description: '',
                        imageUrl: '',
                        validFrom: '',
                        validTo: '',
                        isActive: true
                      });
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg"
                  >
                    {editingPromotion ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="mt-8 bg-orange-50 rounded-xl p-4">
          <h4 className="font-medium text-orange-800 mb-2">Promotion Info</h4>
          <ul className="text-sm text-orange-600 space-y-1">
            <li>• Sales and news are visible to all customers</li>
            <li>• Set validity periods to automatically expire promotions</li>
            <li>• Toggle active status to show/hide promotions</li>
            <li>• Images help make promotions more attractive</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
