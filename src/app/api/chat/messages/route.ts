import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ChatMessage from '@/models/ChatMessage';

export async function GET() {
  try {
    await dbConnect();
    
    const messages = await ChatMessage.find()
      .sort({ createdAt: 1 })
      .limit(100);

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { message, userId, userName, userRole } = await request.json();

    if (!message || !userId || !userName) {
      return NextResponse.json(
        { error: 'Message, userId, and userName are required' },
        { status: 400 }
      );
    }

    const chatMessage = new ChatMessage({
      message: message.trim(),
      userId,
      userName,
      userRole: userRole || 'employee',
      createdAt: new Date()
    });

    await chatMessage.save();

    return NextResponse.json(chatMessage, { status: 201 });
  } catch (error) {
    console.error('Error creating chat message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
