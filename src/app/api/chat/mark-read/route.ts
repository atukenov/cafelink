import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ChatMessage from '@/models/ChatMessage';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await ChatMessage.updateMany(
      { 'readBy.userId': { $ne: userId } },
      { 
        $push: { 
          readBy: { 
            userId, 
            readAt: new Date() 
          } 
        } 
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
