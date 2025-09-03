import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  role: 'client' | 'employee';
  name: string;
  phone: string;
  pin?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  role: {
    type: String,
    enum: ['client', 'employee'],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  pin: {
    type: String,
    required: function() {
      return this.role === 'employee';
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
