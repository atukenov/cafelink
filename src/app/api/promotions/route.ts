import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Promotion from '@/models/Promotion';

export async function GET() {
  try {
    await dbConnect();
    
    const promotions = await Promotion.find({}).sort({ createdAt: -1 });
    return NextResponse.json(promotions);
  } catch (error) {
    console.error('Get promotions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { type, title, description, imageUrl, validFrom, validTo, createdBy } = await request.json();

    if (!type || !title || !description || !validFrom || !createdBy) {
      return NextResponse.json(
        { error: 'Type, title, description, validFrom, and createdBy are required' },
        { status: 400 }
      );
    }

    const promotion = new Promotion({
      type,
      title,
      description,
      imageUrl,
      validFrom: new Date(validFrom),
      validTo: validTo ? new Date(validTo) : undefined,
      createdBy,
      isActive: true,
    });

    await promotion.save();
    return NextResponse.json(promotion, { status: 201 });
  } catch (error) {
    console.error('Create promotion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
