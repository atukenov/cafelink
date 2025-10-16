import mongoose, { Document, Schema } from 'mongoose';

export interface IRedemption extends Document {
  _id: string;
  userId: string;
  shopId: string;
  rewardId: string;
  pointsSpent: number;
  status: 'reserved' | 'fulfilled' | 'cancelled';
  code?: string;
  createdAt: Date;
  fulfilledAt?: Date;
  cancelledAt?: Date;
}

const RedemptionSchema = new Schema<IRedemption>({
  userId: { type: String, required: true },
  shopId: { type: String, required: true },
  rewardId: { type: String, required: true },
  pointsSpent: { type: Number, required: true },
  status: { type: String, enum: ['reserved', 'fulfilled', 'cancelled'], default: 'reserved' },
  code: { type: String },
  createdAt: { type: Date, default: Date.now },
  fulfilledAt: { type: Date },
  cancelledAt: { type: Date }
});

RedemptionSchema.index({ userId: 1, status: 1 });
RedemptionSchema.index({ shopId: 1, status: 1 });

export default mongoose.models.Redemption || mongoose.model<IRedemption>('Redemption', RedemptionSchema);
