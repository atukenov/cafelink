'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Send, Paperclip, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Message } from '@/lib/types';
import { useToast } from '@/components/Toast';

export default function EmployeeChatPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<{ _id: string; name: string; role: string; color?: string } | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const userColors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
    'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
  ];

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

    const colorIndex = parsedUser._id.charCodeAt(parsedUser._id.length - 1) % userColors.length;
    parsedUser.color = userColors[colorIndex];
    
    setUser(parsedUser);
    loadMessages();

    if (typeof window !== 'undefined') {
      import('@/lib/socket').then(({ socketManager }) => {
        socketManager.connect();
        socketManager.joinEmployee();
        
        socketManager.onNewMessage((data: any) => {
          setMessages(prev => [...prev, data.message]);
          scrollToBottom();
        });

        socketManager.onUserTyping((data: any) => {
          if (data.userId !== parsedUser._id) {
            setTypingUsers(prev => [...prev.filter(id => id !== data.userId), data.userId]);
            setTimeout(() => {
              setTypingUsers(prev => prev.filter(id => id !== data.userId));
            }, 3000);
          }
        });

        return () => {
          socketManager.offNewMessage();
        };
      });
    }
  }, [router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const response = await fetch('/api/chat/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        setMessages([]);
      }
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage.trim(),
          userId: user._id,
          userName: user.name,
          userRole: user.role
        })
      });

      if (response.ok) {
        setNewMessage('');
        setIsTyping(false);
        
        await fetch('/api/socket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'new-message',
            data: { userId: user._id }
          })
        });
      } else {
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to send message'
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to send message'
      });
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (!isTyping && value.trim()) {
      setIsTyping(true);
      socketManager.emitUserTyping(user?._id || '', user?.name || '');
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getUserColor = (userId: string) => {
    const colorIndex = userId.charCodeAt(userId.length - 1) % userColors.length;
    return userColors[colorIndex];
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/employee/dashboard" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <Users className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">Team Chat</h1>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 max-w-md mx-auto w-full flex flex-col">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 m-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading chat...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Start the conversation</h2>
              <p className="text-gray-600 text-sm">Send a message to your team</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message._id} className={`flex ${message.userId === user?._id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.userId === user?._id 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white border shadow-sm'
                }`}>
                  {message.userId !== user?._id && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-4 h-4 rounded-full ${getUserColor(message.userId)}`}></div>
                      <span className="text-xs font-medium text-gray-600">{message.userName}</span>
                      <span className="text-xs text-gray-400 capitalize">{message.userRole}</span>
                    </div>
                  )}
                  <p className={`text-sm ${message.userId === user?._id ? 'text-white' : 'text-gray-800'}`}>
                    {message.message}
                  </p>
                  <p className={`text-xs mt-1 ${message.userId === user?._id ? 'text-blue-100' : 'text-gray-500'}`}>
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
          
          {/* Typing Indicators */}
          {typingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-gray-200 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-gray-600">Someone is typing...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white border-t p-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => showToast({ type: 'info', title: 'Attachments', message: 'Coming soon!' })}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="w-full border border-gray-300 rounded-full px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-blue-500 hover:text-blue-600 disabled:text-gray-400 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
