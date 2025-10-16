import mongoose, { Document, Schema } from "mongoose";

export interface IReward extends Document {
  _id: string;
  shopId: string;
  title: string;
  description?: string;
  pointsCost: number;
  type: "discount" | "free_item" | "coupon";
  value?: number;
  metadata?: Record<string, string | number | boolean>;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RewardSchema = new Schema<IReward>({
  shopId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  pointsCost: { type: Number, required: true },
  type: {
    type: String,
    enum: ["discount", "free_item", "coupon"],
    required: true,
  },
  value: { type: Number },
  metadata: { type: Object },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

RewardSchema.index({ shopId: 1, active: 1 });

export default mongoose.models.Reward ||
  mongoose.model<IReward>("Reward", RewardSchema);
