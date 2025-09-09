import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CoffeeShop from '@/models/CoffeeShop';
import { authenticateUser } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser(request);
    if (error || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await dbConnect();
    
    let shops;
    if (user.role === 'author') {
      shops = await CoffeeShop.find({}).sort({ createdAt: -1 });
    } else if (user.role === 'admin') {
      shops = await CoffeeShop.find({ adminId: user._id }).sort({ createdAt: -1 });
    } else {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json(shops);
  } catch (error) {
    console.error('Get coffee shops error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser(request);
    if (error || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!['admin', 'author'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    await dbConnect();
    
    const { name, location, address, adminId } = await request.json();

    if (!name || !location || !address || !adminId) {
      return NextResponse.json(
        { error: 'Name, location, address, and adminId are required' },
        { status: 400 }
      );
    }

    const shop = new CoffeeShop({
      name,
      location,
      address,
      adminId,
      isActive: true,
    });

    await shop.save();
    return NextResponse.json(shop, { status: 201 });
  } catch (error) {
    console.error('Create coffee shop error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
