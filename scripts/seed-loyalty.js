const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cafelink';

const RewardSchema = new mongoose.Schema({
  shopId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  pointsCost: { type: Number, required: true },
  type: { type: String, enum: ['discount', 'free_item', 'coupon'], required: true },
  value: { type: Number },
  metadata: { type: Object },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Reward = mongoose.models.Reward || mongoose.model('Reward', RewardSchema);

const defaultRewards = [
  {
    title: 'Free Espresso',
    description: 'Get a free espresso shot',
    pointsCost: 100,
    type: 'free_item',
    value: 0
  },
  {
    title: '10% Discount',
    description: '10% off your next order',
    pointsCost: 200,
    type: 'discount',
    value: 10
  },
  {
    title: 'Free Cappuccino',
    description: 'Get a free cappuccino',
    pointsCost: 300,
    type: 'free_item',
    value: 0
  },
  {
    title: '20% Discount',
    description: '20% off your next order',
    pointsCost: 500,
    type: 'discount',
    value: 20
  }
];

async function seedLoyalty() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const existingRewards = await Reward.countDocuments();
    if (existingRewards === 0) {
      const CoffeeShopSchema = new mongoose.Schema({
        name: String,
        location: String,
        address: String,
        adminId: String,
        isActive: Boolean,
        settings: Object,
        createdAt: Date
      });
      
      const CoffeeShop = mongoose.models.CoffeeShop || mongoose.model('CoffeeShop', CoffeeShopSchema);
      const shops = await CoffeeShop.find({ isActive: true });

      for (const shop of shops) {
        const rewardsWithShopId = defaultRewards.map(reward => ({
          ...reward,
          shopId: shop._id.toString()
        }));
        
        await Reward.insertMany(rewardsWithShopId);
        console.log(`Default rewards seeded for shop: ${shop.name}`);
      }

      if (shops.length === 0) {
        console.log('No active coffee shops found. Creating default rewards without shopId.');
        await Reward.insertMany(defaultRewards.map(reward => ({ ...reward, shopId: 'default-shop-id' })));
      }
    } else {
      console.log('Rewards already exist, skipping seeding');
    }

    console.log('Loyalty program seeding completed');
  } catch (error) {
    console.error('Error seeding loyalty program:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedLoyalty();
