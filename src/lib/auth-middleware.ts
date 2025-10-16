import { verifyToken } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { NextRequest } from "next/server";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    _id: string;
    role: string;
    name: string;
    phone: string;
  };
}

import { IUser } from "@/models/User";

export async function authenticateUser(
  request: NextRequest
): Promise<{ user: IUser | null; error?: string }> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { user: null, error: "No token provided" };
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return { user: null, error: "Invalid token" };
    }

    await dbConnect();
    const user = await User.findById(decoded.userId).select("-pin");

    if (!user) {
      return { user: null, error: "User not found" };
    }

    return { user };
  } catch {
    return { user: null, error: "Authentication failed" };
  }
}

export function requireRole(allowedRoles: string[]) {
  return async (request: NextRequest) => {
    const { user, error } = await authenticateUser(request);

    if (error || !user) {
      return { authorized: false, error: error || "Authentication required" };
    }

    if (!allowedRoles.includes(user.role)) {
      return { authorized: false, error: "Insufficient permissions" };
    }

    return { authorized: true, user };
  };
}

export const roleHierarchy = {
  author: ["author", "admin", "administrator", "employee", "client"],
  admin: ["admin", "administrator", "employee", "client"],
  administrator: ["administrator", "employee", "client"],
  employee: ["employee", "client"],
  client: ["client"],
};

export function hasPermission(userRole: string, requiredRole: string): boolean {
  const allowedRoles =
    roleHierarchy[userRole as keyof typeof roleHierarchy] || [];
  return allowedRoles.includes(requiredRole);
}
