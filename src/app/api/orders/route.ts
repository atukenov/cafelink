import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { userId, items, totalPrice, customerName, customerPhone, coffeeShopId } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      );
    }

    if (!totalPrice || totalPrice <= 0) {
      return NextResponse.json(
        { error: 'Valid total price is required' },
        { status: 400 }
      );
    }

    if (!coffeeShopId) {
      return NextResponse.json(
        { error: 'Coffee shop ID is required' },
        { status: 400 }
      );
    }

    const order = new Order({
      userId,
      coffeeShopId,
      items,
      totalPrice,
      customerName,
      customerPhone,
      status: 'received',
    });

    await order.save();
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    
    const filter = shopId ? { coffeeShopId: shopId } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
