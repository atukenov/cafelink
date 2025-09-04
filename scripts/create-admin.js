const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cafelink';

const UserSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['client', 'employee', 'admin', 'administrator', 'author'],
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
      return ['employee', 'admin', 'administrator', 'author'].includes(this.role);
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ phone: '+77777777777' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    const hashedPin = await bcrypt.hash('7777', 12);
    
    const admin = new User({
      role: 'admin',
      name: 'Admin',
      phone: '+77777777777',
      pin: hashedPin,
    });

    await admin.save();
    console.log('Admin user created successfully');
    console.log('Phone: +77777777777');
    console.log('PIN: 7777');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdmin();
