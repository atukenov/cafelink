import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UserLoyalty from '@/models/UserLoyalty';
import LoyaltyProgram from '@/models/LoyaltyProgram';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    
    if (!shopId) {
      return NextResponse.json({ error: 'Shop ID is required' }, { status: 400 });
    }

    let userLoyalty = await UserLoyalty.findOne({ userId: params.userId, shopId });
    
    if (!userLoyalty) {
      userLoyalty = new UserLoyalty({
        userId: params.userId,
        shopId,
        pointsBalance: 0,
        tierKey: 'bronze'
      });
      await userLoyalty.save();
    }

    const program = await LoyaltyProgram.findOne({ shopId, active: true });
    let currentTier = 'bronze';
    
    if (program) {
      const sortedTiers = program.tiers.sort((a, b) => b.minPoints - a.minPoints);
      for (const tier of sortedTiers) {
        if (userLoyalty.pointsBalance >= tier.minPoints) {
          currentTier = tier.key;
          break;
        }
      }
      
      if (userLoyalty.tierKey !== currentTier) {
        userLoyalty.tierKey = currentTier;
        await userLoyalty.save();
      }
    }

    return NextResponse.json({
      pointsBalance: userLoyalty.pointsBalance,
      tierKey: userLoyalty.tierKey,
      lastUpdated: userLoyalty.lastUpdated
    });
  } catch (error) {
    console.error('Get user loyalty error:', error);
    return NextResponse.json({ error: 'Failed to fetch user loyalty' }, { status: 500 });
  }
}
