import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  _id: string;
  title: string;
  body: string;
  coffeeShopId: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
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

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
