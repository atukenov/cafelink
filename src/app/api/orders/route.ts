import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { userId, items, totalPrice, customerName, customerPhone } = await request.json();

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

    const order = new Order({
      userId,
      items,
      totalPrice,
      customerName,
      customerPhone,
      status: 'pending',
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
