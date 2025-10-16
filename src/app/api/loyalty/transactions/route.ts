import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LoyaltyTransaction from '@/models/LoyaltyTransaction';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const shopId = searchParams.get('shopId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    if (!userId || !shopId) {
      return NextResponse.json({ error: 'User ID and Shop ID are required' }, { status: 400 });
    }

    const skip = (page - 1) * limit;
    
    const transactions = await LoyaltyTransaction.find({ userId, shopId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LoyaltyTransaction.countDocuments({ userId, shopId });

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get loyalty transactions error:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}
