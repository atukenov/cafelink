import mongoose, { Document, Schema } from 'mongoose';

export interface IUserLoyalty extends Document {
  _id: string;
  userId: string;
  shopId: string;
  pointsBalance: number;
  pointsPending?: number;
  tierKey?: string;
  lastUpdated: Date;
}

const UserLoyaltySchema = new Schema<IUserLoyalty>({
  userId: { type: String, required: true },
  shopId: { type: String, required: true },
  pointsBalance: { type: Number, required: true, default: 0 },
  pointsPending: { type: Number, default: 0 },
  tierKey: { type: String, default: 'bronze' },
  lastUpdated: { type: Date, default: Date.now }
});

UserLoyaltySchema.index({ userId: 1, shopId: 1 }, { unique: true });

export default mongoose.models.UserLoyalty || mongoose.model<IUserLoyalty>('UserLoyalty', UserLoyaltySchema);
