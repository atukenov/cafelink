import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  _id: string;
  description: string;
  status: 'pending' | 'done';
  employeeId?: string;
  createdBy?: string;
  coffeeShopId: string;
  isGlobal: boolean;
  createdAt: Date;
}

const TaskSchema = new Schema<ITask>({
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'done'],
    default: 'pending',
  },
  employeeId: {
    type: String,
    required: false,
  },
  createdBy: {
    type: String,
    required: false,
  },
  coffeeShopId: {
    type: String,
    required: true,
  },
  isGlobal: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
