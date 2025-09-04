import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { event, data } = await request.json();
    
    if (global.io) {
      switch (event) {
        case 'order-status-update':
          global.io.to(`order-${data.orderId}`).emit('order-updated', data);
          global.io.to('employees').emit('order-updated', data);
          break;
        case 'new-order':
          global.io.to('employees').emit('new-order', data);
          break;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Socket API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
