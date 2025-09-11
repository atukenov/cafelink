import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UserLoyalty from '@/models/UserLoyalty';
import Reward from '@/models/Reward';
import Redemption from '@/models/Redemption';
import LoyaltyTransaction from '@/models/LoyaltyTransaction';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { userId, shopId, rewardId } = await request.json();
    
    if (!userId || !shopId || !rewardId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const reward = await Reward.findById(rewardId);
    if (!reward || !reward.active || reward.shopId !== shopId) {
      return NextResponse.json({ error: 'Invalid reward' }, { status: 404 });
    }

    const userLoyalty = await UserLoyalty.findOne({ userId, shopId });
    if (!userLoyalty || userLoyalty.pointsBalance < reward.pointsCost) {
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
    }

    const session = await mongoose.startSession();
    
    try {
      let redemption;
      
      await session.withTransaction(async () => {
        await UserLoyalty.findOneAndUpdate(
          { userId, shopId, pointsBalance: { $gte: reward.pointsCost } },
          { 
            $inc: { pointsBalance: -reward.pointsCost },
            $set: { lastUpdated: new Date() }
          },
          { session }
        );

        const transaction = new LoyaltyTransaction({
          userId,
          shopId,
          type: 'redeem',
          points: -reward.pointsCost,
          rewardId: reward._id,
          source: 'redemption',
          meta: { rewardTitle: reward.title, rewardType: reward.type }
        });
        await transaction.save({ session });

        redemption = new Redemption({
          userId,
          shopId,
          rewardId: reward._id,
          pointsSpent: reward.pointsCost,
          status: 'reserved',
          code: `RDM${Date.now().toString().slice(-6)}`
        });
        await redemption.save({ session });
      });

      return NextResponse.json(redemption);
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error('Redeem reward error:', error);
    return NextResponse.json({ error: 'Failed to redeem reward' }, { status: 500 });
  }
}
