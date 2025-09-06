import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    enum: ['client', 'employee', 'administrator', 'admin', 'author'],
    default: 'employee'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  readBy: [{
    userId: String,
    readAt: Date
  }]
});

export default mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema);
