import mongoose, { Document, Schema } from 'mongoose';

export interface IPromotion extends Document {
  _id: string;
  type: 'sale' | 'news';
  title: string;
  description: string;
  imageUrl?: string;
  coffeeShopId: string;
  isActive: boolean;
  validFrom: Date;
  validTo?: Date;
  createdBy: string;
  createdAt: Date;
}

const PromotionSchema = new Schema<IPromotion>({
  type: { type: String, enum: ['sale', 'news'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  coffeeShopId: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  validFrom: { type: Date, required: true },
  validTo: { type: Date },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Promotion || mongoose.model<IPromotion>('Promotion', PromotionSchema);
