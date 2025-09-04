import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Promotion from '@/models/Promotion';

export async function GET() {
  try {
    await dbConnect();
    
    const now = new Date();
    const promotions = await Promotion.find({
      isActive: true,
      validFrom: { $lte: now },
      $or: [
        { validTo: { $exists: false } },
        { validTo: { $gte: now } }
      ]
    }).sort({ createdAt: -1 });
    
    return NextResponse.json(promotions);
  } catch (error) {
    console.error('Get active promotions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
