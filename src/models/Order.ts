import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  productId: string;
  quantity: number;
  additionalItems?: {
    additionalItemId: string;
    quantity: number;
  }[];
}

export interface IOrder extends Document {
  _id: string;
  userId: string;
  items: IOrderItem[];
  status: 'received' | 'viewed' | 'accepted' | 'rejected' | 'ready';
  totalPrice: number;
  customerName?: string;
  customerPhone?: string;
  estimatedTime?: number;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  additionalItems: [{
    additionalItemId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 }
  }]
});

const OrderSchema = new Schema<IOrder>({
  userId: {
    type: String,
    required: false,
  },
  items: [OrderItemSchema],
  status: {
    type: String,
    enum: ['received', 'viewed', 'accepted', 'rejected', 'ready'],
    default: 'received',
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  customerName: {
    type: String,
    required: false,
  },
  customerPhone: {
    type: String,
    required: false,
  },
  estimatedTime: {
    type: Number,
    required: false,
  },
  rejectionReason: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
