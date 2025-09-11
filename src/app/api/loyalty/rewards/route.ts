import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Reward from '@/models/Reward';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    
    if (!shopId) {
      return NextResponse.json({ error: 'Shop ID is required' }, { status: 400 });
    }

    const rewards = await Reward.find({ shopId, active: true }).sort({ pointsCost: 1 });
    return NextResponse.json(rewards);
  } catch (error) {
    console.error('Get rewards error:', error);
    return NextResponse.json({ error: 'Failed to fetch rewards' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { shopId, title, description, pointsCost, type, value, metadata } = await request.json();
    
    if (!shopId || !title || !pointsCost || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const reward = new Reward({
      shopId,
      title,
      description,
      pointsCost,
      type,
      value,
      metadata
    });

    await reward.save();
    return NextResponse.json(reward, { status: 201 });
  } catch (error) {
    console.error('Create reward error:', error);
    return NextResponse.json({ error: 'Failed to create reward' }, { status: 500 });
  }
}
