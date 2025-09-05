import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployeeStats extends Document {
  _id: string;
  employeeId: string;
  tasksCompleted: number;
  tasksAssigned: number;
  shiftsAttended: number;
  shiftsScheduled: number;
  ordersProcessed: number;
  averageOrderTime: number;
  rating: number;
  comments: string[];
  lastUpdated: Date;
}

const EmployeeStatsSchema = new Schema<IEmployeeStats>({
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  tasksCompleted: {
    type: Number,
    default: 0,
  },
  tasksAssigned: {
    type: Number,
    default: 0,
  },
  shiftsAttended: {
    type: Number,
    default: 0,
  },
  shiftsScheduled: {
    type: Number,
    default: 0,
  },
  ordersProcessed: {
    type: Number,
    default: 0,
  },
  averageOrderTime: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  comments: [{
    type: String,
  }],
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.EmployeeStats || mongoose.model<IEmployeeStats>('EmployeeStats', EmployeeStatsSchema);
