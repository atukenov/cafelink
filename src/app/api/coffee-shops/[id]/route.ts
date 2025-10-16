import { authenticateUser } from "@/lib/auth-middleware";
import dbConnect from "@/lib/mongodb";
import CoffeeShop from "@/models/CoffeeShop";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticateUser(request);
    if (error || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = await params;
    const shop = await CoffeeShop.findById(id);
    if (!shop) {
      return NextResponse.json(
        { error: "Coffee shop not found" },
        { status: 404 }
      );
    }

    if (user.role !== "author" && shop.adminId !== user._id) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    return NextResponse.json(shop);
  } catch (error) {
    console.error("Get coffee shop error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticateUser(request);
    if (error || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = await params;
    const shop = await CoffeeShop.findById(id);
    if (!shop) {
      return NextResponse.json(
        { error: "Coffee shop not found" },
        { status: 404 }
      );
    }

    if (user.role !== "author" && shop.adminId !== user._id) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { name, location, address, isActive } = await request.json();

    if (name !== undefined) shop.name = name;
    if (location !== undefined) shop.location = location;
    if (address !== undefined) shop.address = address;
    if (isActive !== undefined) shop.isActive = isActive;

    await shop.save();
    return NextResponse.json(shop);
  } catch (error) {
    console.error("Update coffee shop error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticateUser(request);
    if (error || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (user.role !== "author") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await dbConnect();

    const { id } = await params;
    const shop = await CoffeeShop.findByIdAndDelete(id);
    if (!shop) {
      return NextResponse.json(
        { error: "Coffee shop not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Coffee shop deleted successfully" });
  } catch (error) {
    console.error("Delete coffee shop error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
