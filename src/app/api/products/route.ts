import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    
    const filter = shopId ? { coffeeShopId: shopId } : {};
    const products = await Product.find(filter).sort({ createdAt: -1 });
    
    const AdditionalItem = (await import('@/models/AdditionalItem')).default;
    const additionalItemsFilter = shopId ? { coffeeShopId: shopId } : {};
    const additionalItems = await AdditionalItem.find(additionalItemsFilter);
    
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
    
    const { name, price, imageUrl, coffeeShopId, additionalItems } = await request.json();

    if (!name || !price || !imageUrl) {
      return NextResponse.json(
        { error: 'Name, price, and imageUrl are required' },
        { status: 400 }
      );
    }

    if (!coffeeShopId) {
      return NextResponse.json(
        { error: 'Coffee shop ID is required' },
        { status: 400 }
      );
    }

    const product = new Product({
      name,
      price,
      imageUrl,
      coffeeShopId,
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
