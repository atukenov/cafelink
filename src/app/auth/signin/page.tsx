'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Phone, Mail } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { AuthForm } from '@/components/auth/AuthForm';

export default function SignInPage() {
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
          <h1 className="text-2xl font-bold text-gray-800">Sign In</h1>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-gray-600">Welcome back! Sign in to your account</p>
        </div>


        <AuthForm
          mode="signin"
          onSubmit={async (data) => {
            setLoading(true);
            setError(null);
            
            try {
              const result = await signIn('credentials', {
                email: data.email,
                phone: data.phone,
                isRegistering: 'false',
                redirect: false
              });

              if (result?.error) {
                setError(result.error);
              } else {
                router.push(callbackUrl);
              }
            } catch (err: unknown) {
              setError('Login failed. Please try again.');
            } finally {
              setLoading(false);
            }
          }}
          loading={loading}
          error={error}
        />

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-amber-600 hover:text-amber-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
