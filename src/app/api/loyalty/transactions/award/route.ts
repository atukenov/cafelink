import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LoyaltyTransaction from '@/models/LoyaltyTransaction';
import UserLoyalty from '@/models/UserLoyalty';
import LoyaltyProgram from '@/models/LoyaltyProgram';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { userId, shopId, orderId, amountPaid } = await request.json();
    
    if (!userId || !shopId || !orderId || !amountPaid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingTransaction = await LoyaltyTransaction.findOne({ orderId, type: 'earn' });
    if (existingTransaction) {
      return NextResponse.json(existingTransaction);
    }

    const program = await LoyaltyProgram.findOne({ shopId, active: true });
    if (!program) {
      return NextResponse.json({ error: 'No active loyalty program' }, { status: 404 });
    }

    let userLoyalty = await UserLoyalty.findOne({ userId, shopId });
    if (!userLoyalty) {
      userLoyalty = new UserLoyalty({ userId, shopId, pointsBalance: 0 });
    }

    let tierMultiplier = 1.0;
    if (userLoyalty.tierKey) {
      const tier = program.tiers.find((t: any) => t.key === userLoyalty.tierKey);
      if (tier) {
        tierMultiplier = tier.multiplier || 1.0;
      }
    }

    const pointsEarned = Math.floor(amountPaid * program.earningRate * tierMultiplier);

    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        const transaction = new LoyaltyTransaction({
          userId,
          shopId,
          type: 'earn',
          points: pointsEarned,
          orderId,
          source: 'checkout',
          meta: { amountPaid, earningRate: program.earningRate, tierMultiplier }
        });
        await transaction.save({ session });

        await UserLoyalty.findOneAndUpdate(
          { userId, shopId },
          { 
            $inc: { pointsBalance: pointsEarned },
            $set: { lastUpdated: new Date() }
          },
          { upsert: true, new: true, session }
        );
      });

      return NextResponse.json({ 
        pointsEarned,
        orderId,
        userId,
        shopId
      });
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error('Award points error:', error);
    return NextResponse.json({ error: 'Failed to award points' }, { status: 500 });
  }
}
