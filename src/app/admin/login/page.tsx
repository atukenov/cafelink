"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiClient } from "@/lib/api";
import { ArrowLeft, Lock, Phone, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOTP, setShowOTP] = useState(false);
  const [mockOTP, setMockOTP] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim() || !pin.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.login({
        phone: phone.trim(),
        pin: pin.trim(),
      });

      if (!["admin", "author"].includes(response.role)) {
        setError("Access denied. Admin account required.");
        return;
      }

      apiClient.setToken(response.token);
      localStorage.setItem("user", JSON.stringify(response));

      setMockOTP(response.mockOTP);
      setShowOTP(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = () => {
    router.push("/admin/dashboard");
  };

  if (showOTP) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Verification Code
          </h1>
          <p className="text-gray-600 mb-6">
            Your verification code is:{" "}
            <span className="font-bold text-blue-600">{mockOTP}</span>
          </p>

          <div className="space-y-4">
            <Button
              onClick={handleOTPVerification}
              variant="primary"
              className="w-full py-3 px-6"
            >
              Verify & Continue
            </Button>

            <Button
              onClick={() => setShowOTP(false)}
              variant="secondary"
              className="w-full py-3 px-6"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Admin Login</h1>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Coffee Shop Admin
          </h2>
          <p className="text-gray-600">Manage employees and menu</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            type="tel"
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+7 (xxx) xxx-xx-xx"
            disabled={loading}
            className="pl-10"
            iconLeft={<Phone className="w-5 h-5 text-gray-400" />}
          />

          <Input
            type="password"
            label="PIN Code"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter your PIN"
            maxLength={6}
            disabled={loading}
            className="pl-10"
            iconLeft={<Lock className="w-5 h-5 text-gray-400" />}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full py-3 px-6"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-2">
            Admin Access:
          </p>
          <p className="text-xs text-blue-600">
            Employee management, menu administration, and role assignments
          </p>
        </div>
      </div>
    </div>
  );
}
