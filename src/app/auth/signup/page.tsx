'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Phone, Mail, UserPlus } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { AuthForm } from '@/components/auth/AuthForm';

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/profile';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Sign Up</h1>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-gray-600">Create your account to start ordering</p>
        </div>

        <AuthForm
          mode="signup"
          onSubmit={async (data) => {
            setLoading(true);
            setError(null);
            
            if (!data.name?.trim() || (!data.email?.trim() && !data.phone?.trim())) {
              setError('Please fill in all required fields');
              setLoading(false);
              return;
            }

            try {
              const result = await signIn('credentials', {
                name: data.name.trim(),
                email: data.email?.trim() || undefined,
                phone: data.phone?.trim(),
                isRegistering: 'true',
                redirect: false
              });

              if (result?.error) {
                setError(result.error);
              } else {
                router.push(callbackUrl);
              }
            } catch (err: unknown) {
              setError('Registration failed. Please try again.');
            } finally {
              setLoading(false);
            }
          }}
          loading={loading}
          error={error}
        />

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-amber-600 hover:text-amber-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
