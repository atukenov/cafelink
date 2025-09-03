import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  _id: string;
  description: string;
  status: 'pending' | 'done';
  employeeId?: string;
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
