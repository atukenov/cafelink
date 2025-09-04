import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { event, data } = await request.json();
    
    if ((global as any).io) {
      switch (event) {
        case 'order-status-update':
          (global as any).io.to(`order-${data.orderId}`).emit('order-updated', data);
          (global as any).io.to('employees').emit('order-updated', data);
          break;
        case 'new-order':
          (global as any).io.to('employees').emit('new-order', data);
          break;
        case 'new-message':
          (global as any).io.to('employees').emit('new-message', data);
          break;
        case 'task-update':
          (global as any).io.to('employees').emit('task-update', data);
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
