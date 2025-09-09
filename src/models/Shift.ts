import mongoose, { Document, Schema } from 'mongoose';

export interface IShift extends Document {
  _id: string;
  employeeId: string;
  coffeeShopId: string;
  startTime: Date;
  endTime?: Date;
}

const ShiftSchema = new Schema<IShift>({
  employeeId: {
    type: String,
    required: true,
  },
  coffeeShopId: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endTime: {
    type: Date,
    required: false,
  },
});

export default mongoose.models.Shift || mongoose.model<IShift>('Shift', ShiftSchema);
