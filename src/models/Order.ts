import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  productId: string;
  quantity: number;
}

export interface IOrder extends Document {
  _id: string;
  userId: string;
  items: IOrderItem[];
  status: 'pending' | 'accepted' | 'ready';
  totalPrice: number;
  customerName?: string;
  customerPhone?: string;
  createdAt: Date;
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
});

const OrderSchema = new Schema<IOrder>({
  userId: {
    type: String,
    required: false,
  },
  items: [OrderItemSchema],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'ready'],
    default: 'pending',
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
