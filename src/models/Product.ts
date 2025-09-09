import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  coffeeShopId: string;
  additionalItems?: string[];
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  coffeeShopId: {
    type: String,
    required: true,
  },
  additionalItems: [{
    type: Schema.Types.ObjectId,
    ref: 'AdditionalItem',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
