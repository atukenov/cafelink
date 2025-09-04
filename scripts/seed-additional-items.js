const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cafelink';

const AdditionalItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const AdditionalItem = mongoose.models.AdditionalItem || mongoose.model('AdditionalItem', AdditionalItemSchema);

const defaultAdditionalItems = [
  { name: 'Vanilla Syrup', price: 50 },
  { name: 'Caramel Syrup', price: 50 },
  { name: 'Hazelnut Syrup', price: 50 },
  { name: 'Cinnamon Syrup', price: 50 },
  { name: 'Oat Milk', price: 100 },
  { name: 'Almond Milk', price: 80 },
  { name: 'Soy Milk', price: 80 },
  { name: 'Coconut Milk', price: 90 },
  { name: 'Extra Shot', price: 100 },
  { name: 'Decaf', price: 0 },
  { name: 'Extra Hot', price: 0 },
  { name: 'Extra Sugar', price: 0 },
  { name: 'No Sugar', price: 0 },
  { name: 'Whipped Cream', price: 70 },
  { name: 'Extra Foam', price: 0 },
  { name: 'Light Foam', price: 0 }
];

async function seedAdditionalItems() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const existingItems = await AdditionalItem.countDocuments();
    if (existingItems > 0) {
      console.log('Additional items already exist, skipping seed');
      return;
    }

    console.log('Seeding default additional items...');
    
    for (const itemData of defaultAdditionalItems) {
      const item = new AdditionalItem(itemData);
      await item.save();
      console.log(`Created additional item: ${item.name} (+${item.price}₸)`);
    }

    console.log('Additional items seeding completed successfully');
    
  } catch (error) {
    console.error('Error seeding additional items:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedAdditionalItems();
