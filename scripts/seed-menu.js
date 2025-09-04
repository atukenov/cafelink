const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cafelink';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  additionalItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdditionalItem',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const defaultProducts = [
  {
    name: 'Americano',
    price: 300,
    imageUrl: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=400&h=400&fit=crop'
  },
  {
    name: 'Cappuccino',
    price: 450,
    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop'
  },
  {
    name: 'Latte',
    price: 500,
    imageUrl: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400&h=400&fit=crop'
  },
  {
    name: 'Espresso',
    price: 250,
    imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=400&fit=crop'
  },
  {
    name: 'Flat White',
    price: 480,
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop'
  },
  {
    name: 'Mocha',
    price: 550,
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop'
  },
  {
    name: 'Macchiato',
    price: 520,
    imageUrl: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&h=400&fit=crop'
  }
];

async function seedMenu() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const existingProducts = await Product.countDocuments();
    if (existingProducts > 0) {
      console.log('Products already exist, skipping seed');
      return;
    }

    console.log('Seeding default menu...');
    
    for (const productData of defaultProducts) {
      const product = new Product(productData);
      await product.save();
      console.log(`Created product: ${product.name}`);
    }

    console.log('Menu seeding completed successfully');
    
  } catch (error) {
    console.error('Error seeding menu:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedMenu();
