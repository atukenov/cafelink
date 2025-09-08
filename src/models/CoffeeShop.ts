import mongoose, { Document, Schema } from 'mongoose';

export interface ICoffeeShop extends Document {
  _id: string;
  name: string;
  location: string;
  address: string;
  adminId: string;
  isActive: boolean;
  settings: {
    timezone: string;
    currency: string;
    theme: string;
  };
  createdAt: Date;
}

const CoffeeShopSchema = new Schema<ICoffeeShop>({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  adminId: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  settings: {
    timezone: {
      type: String,
      default: 'Asia/Almaty',
    },
    currency: {
      type: String,
      default: '₸',
    },
    theme: {
      type: String,
      default: 'default',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.CoffeeShop || mongoose.model<ICoffeeShop>('CoffeeShop', CoffeeShopSchema);
