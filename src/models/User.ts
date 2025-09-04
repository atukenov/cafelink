import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  role: 'client' | 'employee' | 'admin';
  name: string;
  phone: string;
  pin?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  role: {
    type: String,
    enum: ['client', 'employee', 'admin'],
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
      return this.role === 'employee' || this.role === 'admin';
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
