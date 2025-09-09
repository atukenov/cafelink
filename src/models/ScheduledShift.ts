import mongoose, { Document, Schema } from 'mongoose';

export interface IScheduledShift extends Document {
  _id: string;
  employeeId: string;
  coffeeShopId: string;
  weekdays: number[];
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: Date;
}

const ScheduledShiftSchema = new Schema<IScheduledShift>({
  employeeId: { type: String, required: true },
  coffeeShopId: { type: String, required: true },
  weekdays: [{ type: Number, min: 0, max: 6 }],
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.ScheduledShift || mongoose.model<IScheduledShift>('ScheduledShift', ScheduledShiftSchema);
