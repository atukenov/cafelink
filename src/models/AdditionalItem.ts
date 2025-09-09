import mongoose, { Document, Schema } from 'mongoose';

export interface IAdditionalItem extends Document {
  _id: string;
  name: string;
  price: number;
  productId?: string;
  coffeeShopId: string;
  createdAt: Date;
}

const AdditionalItemSchema = new Schema<IAdditionalItem>({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: false,
  },
  coffeeShopId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.AdditionalItem || mongoose.model<IAdditionalItem>('AdditionalItem', AdditionalItemSchema);
