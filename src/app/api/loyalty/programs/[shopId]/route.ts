import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LoyaltyProgram from '@/models/LoyaltyProgram';

export async function GET(
  request: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    await dbConnect();
    let program = await LoyaltyProgram.findOne({ shopId: params.shopId, active: true });
    
    if (!program) {
      program = new LoyaltyProgram({
        shopId: params.shopId,
        earningRate: 0.01,
        tiers: [
          { key: 'bronze', name: 'Bronze', minPoints: 0, multiplier: 1.0 },
          { key: 'silver', name: 'Silver', minPoints: 500, multiplier: 1.2 },
          { key: 'gold', name: 'Gold', minPoints: 1000, multiplier: 1.5 }
        ]
      });
      await program.save();
    }
    
    return NextResponse.json(program);
  } catch (error) {
    console.error('Get loyalty program error:', error);
    return NextResponse.json({ error: 'Failed to fetch loyalty program' }, { status: 500 });
  }
}
