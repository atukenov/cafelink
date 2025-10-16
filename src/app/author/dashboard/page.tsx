"use client";

import { useToast } from "@/components/Toast";
import {
  ArrowLeft,
  CheckCircle,
  Crown,
  Database,
  Settings,
  Shield,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthorDashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<{
    _id: string;
    name: string;
    role: string;
  } | null>(null);
  const [seedingStatus, setSeedingStatus] = useState<
    Record<string, "idle" | "loading" | "success" | "error">
  >({});

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/author/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "author") {
      router.push("/author/login");
      return;
    }

    setUser(parsedUser);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const handleSeedDatabase = async (script: string) => {
    setSeedingStatus((prev) => ({ ...prev, [script]: "loading" }));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ script }),
      });

      const result = await response.json();

      if (response.ok) {
        setSeedingStatus((prev) => ({ ...prev, [script]: "success" }));
        showToast({
          type: "success",
          title: "Seeding Successful",
          message: `${script} executed successfully`,
        });
      } else {
        throw new Error(result.error || "Seeding failed");
      }
    } catch (error) {
      setSeedingStatus((prev) => ({ ...prev, [script]: "error" }));
      showToast({
        type: "error",
        title: "Seeding Failed",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const getSeedingIcon = (script: string) => {
    const status = seedingStatus[script] || "idle";
    switch (status) {
      case "loading":
        return (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600" />
        );
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Database className="w-5 h-5 text-purple-600" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <h1 className="text-xl font-bold text-gray-800">
              Author Dashboard
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              Welcome, {user.name}
            </h2>
            <p className="text-purple-600 font-medium">System Author</p>
            <p className="text-sm text-gray-600 mt-2">
              Full system administration access
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Database Seeding Section */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-600" />
              Database Seeding
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => handleSeedDatabase("create-author")}
                disabled={seedingStatus["create-author"] === "loading"}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <span>Create Author User</span>
                {getSeedingIcon("create-author")}
              </button>
              <button
                onClick={() => handleSeedDatabase("create-admin")}
                disabled={seedingStatus["create-admin"] === "loading"}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <span>Create Admin User</span>
                {getSeedingIcon("create-admin")}
              </button>
              <button
                onClick={() => handleSeedDatabase("create-default-shop")}
                disabled={seedingStatus["create-default-shop"] === "loading"}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <span>Create Default Shop</span>
                {getSeedingIcon("create-default-shop")}
              </button>
              <button
                onClick={() => handleSeedDatabase("seed-menu")}
                disabled={seedingStatus["seed-menu"] === "loading"}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <span>Seed Menu Items</span>
                {getSeedingIcon("seed-menu")}
              </button>
              <button
                onClick={() => handleSeedDatabase("seed-additional-items")}
                disabled={seedingStatus["seed-additional-items"] === "loading"}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <span>Seed Additional Items</span>
                {getSeedingIcon("seed-additional-items")}
              </button>
            </div>
          </div>

          <Link
            href="/author/users"
            className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">User Management</h3>
                <p className="text-sm text-gray-600">
                  Create and manage admin users
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/dashboard"
            className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Admin Interface</h3>
                <p className="text-sm text-gray-600">
                  Access admin management features
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/employee/dashboard"
            className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">
                  Employee Interface
                </h3>
                <p className="text-sm text-gray-600">
                  Access employee features
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-8 bg-purple-50 rounded-xl p-4">
          <h4 className="font-medium text-purple-800 mb-2">
            Author Privileges
          </h4>
          <ul className="text-sm text-purple-600 space-y-1">
            <li>• Create and manage admin users</li>
            <li>• Full access to all system features</li>
            <li>• Override all role restrictions</li>
            <li>• System configuration access</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
