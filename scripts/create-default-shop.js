const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cafelink';

const CoffeeShopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  adminId: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  settings: {
    timezone: {
      type: String,
      default: 'Asia/Almaty',
    },
    currency: {
      type: String,
      default: '₸',
    },
    theme: {
      type: String,
      default: 'default',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

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
  coffeeShopId: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CoffeeShop = mongoose.models.CoffeeShop || mongoose.model('CoffeeShop', CoffeeShopSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createDefaultShop() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const existingShop = await CoffeeShop.findOne({ name: 'CafeLink Atyrau' });
    if (existingShop) {
      console.log('Default coffee shop already exists');
      return;
    }

    const adminUser = await User.findOne({ phone: '+77777777777' });
    if (!adminUser) {
      console.log('Admin user not found. Please create admin user first.');
      return;
    }

    const defaultShop = new CoffeeShop({
      name: 'CafeLink Atyrau',
      location: 'Atyrau, Kazakhstan',
      address: 'Satpayev Street 1, Atyrau 060011, Kazakhstan',
      adminId: adminUser._id,
      isActive: true,
    });

    await defaultShop.save();
    console.log('Default coffee shop created successfully');
    console.log('Name: CafeLink Atyrau');
    console.log('Location: Atyrau, Kazakhstan');
    console.log('Admin:', adminUser.name);
    
  } catch (error) {
    console.error('Error creating default coffee shop:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createDefaultShop();
