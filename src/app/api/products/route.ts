import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET() {
  try {
    await dbConnect();
    
    const products = await Product.find({}).sort({ createdAt: -1 });
    
    const AdditionalItem = (await import('@/models/AdditionalItem')).default;
    const additionalItems = await AdditionalItem.find({});
    
    const productsWithAdditionalItems = products.map(product => ({
      ...product.toObject(),
      additionalItems: additionalItems.map(item => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        createdAt: item.createdAt
      }))
    }));
    
    return NextResponse.json(productsWithAdditionalItems);
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { name, price, imageUrl, additionalItems } = await request.json();

    if (!name || !price || !imageUrl) {
      return NextResponse.json(
        { error: 'Name, price, and imageUrl are required' },
        { status: 400 }
      );
    }

    const product = new Product({
      name,
      price,
      imageUrl,
      additionalItems: additionalItems || [],
    });

    await product.save();
    const populatedProduct = await Product.findById(product._id).populate('additionalItems');
    return NextResponse.json(populatedProduct, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
