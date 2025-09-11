'use client';

import React from 'react';
import { User } from 'lucide-react';

interface ProfileCardProps {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  className?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ 
  name, 
  email, 
  phone, 
  className = '' 
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{name || 'Guest User'}</h3>
          <p className="text-sm text-gray-600">{email || phone || 'No contact info'}</p>
        </div>
      </div>
    </div>
  );
};
