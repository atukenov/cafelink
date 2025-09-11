import mongoose, { Document, Schema } from 'mongoose';

export interface ILoyaltyProgram extends Document {
  _id: string;
  shopId: string;
  name?: string;
  earningRate: number;
  pointExpiryDays?: number;
  tiers: Array<{
    key: string;
    name: string;
    minPoints: number;
    multiplier?: number;
  }>;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LoyaltyProgramSchema = new Schema<ILoyaltyProgram>({
  shopId: { type: String, required: true },
  name: { type: String, default: 'Default Loyalty' },
  earningRate: { type: Number, required: true, default: 0.01 },
  pointExpiryDays: { type: Number, default: 365 },
  tiers: [{
    key: { type: String, required: true },
    name: { type: String, required: true },
    minPoints: { type: Number, required: true },
    multiplier: { type: Number, default: 1.0 }
  }],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.LoyaltyProgram || mongoose.model<ILoyaltyProgram>('LoyaltyProgram', LoyaltyProgramSchema);
