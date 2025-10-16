import mongoose, { Document, Schema } from 'mongoose';

export interface ILoyaltyTransaction extends Document {
  _id: string;
  userId: string;
  shopId: string;
  type: 'earn' | 'redeem' | 'expire' | 'adjust';
  points: number;
  orderId?: string;
  rewardId?: string;
  source?: string;
  meta?: Record<string, any>;
  createdAt: Date;
}

const LoyaltyTransactionSchema = new Schema<ILoyaltyTransaction>({
  userId: { type: String, required: true },
  shopId: { type: String, required: true },
  type: { type: String, enum: ['earn', 'redeem', 'expire', 'adjust'], required: true },
  points: { type: Number, required: true },
  orderId: { type: String },
  rewardId: { type: String },
  source: { type: String, default: 'system' },
  meta: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

LoyaltyTransactionSchema.index({ orderId: 1 });
LoyaltyTransactionSchema.index({ userId: 1, createdAt: -1 });
LoyaltyTransactionSchema.index({ shopId: 1, createdAt: -1 });

export default mongoose.models.LoyaltyTransaction || mongoose.model<ILoyaltyTransaction>('LoyaltyTransaction', LoyaltyTransactionSchema);
