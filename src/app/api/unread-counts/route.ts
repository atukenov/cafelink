import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import ChatMessage from '@/models/ChatMessage';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    
    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID required' }, { status: 400 });
    }

    const [newOrdersCount, unreadMessagesCount] = await Promise.all([
      Order.countDocuments({ status: 'received' }),
      ChatMessage.countDocuments({
        'readBy.userId': { $ne: employeeId }
      })
    ]);

    return NextResponse.json({
      orders: newOrdersCount,
      messages: unreadMessagesCount
    });
  } catch (error) {
    console.error('Error fetching unread counts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
