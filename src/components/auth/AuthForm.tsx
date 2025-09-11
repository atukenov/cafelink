'use client';

import React, { useState } from 'react';
import { User, Phone, Mail, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onSubmit: (data: {
    name?: string;
    email?: string;
    phone?: string;
    loginMethod?: 'email' | 'phone';
  }) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode, onSubmit, loading = false, error }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'signup') {
      await onSubmit({ name, email, phone });
    } else {
      await onSubmit({ 
        email: loginMethod === 'email' ? email : '',
        phone: loginMethod === 'phone' ? phone : '',
        loginMethod 
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {mode === 'signin' && (
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setLoginMethod('email')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              loginMethod === 'email'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod('phone')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              loginMethod === 'phone'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Phone
          </button>
        </div>
      )}

      {mode === 'signup' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter your full name"
              required
            />
          </div>
        </div>
      )}

      {(mode === 'signup' || loginMethod === 'email') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address {mode === 'signup' ? '(optional)' : ''}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter your email"
              required={mode === 'signin' && loginMethod === 'email'}
            />
          </div>
        </div>
      )}

      {(mode === 'signup' || loginMethod === 'phone') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="+7 (xxx) xxx-xx-xx"
              required
            />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        loading={loading}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-xl"
      >
        {mode === 'signin' ? 'Sign In' : 'Create Account'}
      </Button>
    </form>
  );
};
