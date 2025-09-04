'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Message } from '@/lib/types';

export default function EmployeeMessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ _id: string; name: string; role: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/employee/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (!['employee', 'admin', 'administrator', 'author'].includes(parsedUser.role)) {
      router.push('/employee/login');
      return;
    }

    setUser(parsedUser);
    loadMessages();
  }, [router]);

  const loadMessages = async () => {
    try {
      const data = await apiClient.getMessages();
      setMessages(data);
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/employee/dashboard" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Messages</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No messages yet</h2>
            <p className="text-gray-600">Check back later for announcements from management</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message._id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-800 truncate pr-2">
                        {message.title}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                        <Calendar className="w-3 h-3" />
                        {formatDate(message.createdAt)}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                      {message.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-purple-50 rounded-xl p-4">
          <h4 className="font-medium text-purple-800 mb-2">About Messages</h4>
          <p className="text-sm text-purple-600">
            Messages are announcements from the coffee shop management. 
            Check here regularly for important updates, schedule changes, and other information.
          </p>
        </div>
      </div>
    </div>
  );
}
