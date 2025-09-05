import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { status, estimatedTime, rejectionReason } = await request.json();
    const { id } = await params;

    if (!status || !['received', 'viewed', 'accepted', 'rejected', 'ready'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (received, viewed, accepted, rejected, ready)' },
        { status: 400 }
      );
    }

    const updateData: any = { status, updatedAt: new Date() };
    if (estimatedTime && status === 'accepted') {
      updateData.estimatedTime = estimatedTime;
    }
    if (rejectionReason && status === 'rejected') {
      updateData.rejectionReason = rejectionReason;
    }

    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
