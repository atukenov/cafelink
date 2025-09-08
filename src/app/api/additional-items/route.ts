import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AdditionalItem from '@/models/AdditionalItem';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    
    const filter = shopId ? { coffeeShopId: shopId } : {};
    const additionalItems = await AdditionalItem.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(additionalItems);
  } catch (error) {
    console.error('Get additional items error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { name, price, productId, coffeeShopId } = await request.json();

    if (!name || price === undefined) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      );
    }

    if (!coffeeShopId) {
      return NextResponse.json(
        { error: 'Coffee shop ID is required' },
        { status: 400 }
      );
    }

    const additionalItem = new AdditionalItem({
      name,
      price,
      productId: productId || undefined,
      coffeeShopId,
    });

    await additionalItem.save();
    return NextResponse.json(additionalItem, { status: 201 });
  } catch (error) {
    console.error('Create additional item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
