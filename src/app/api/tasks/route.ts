import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    
    const filter = shopId ? { coffeeShopId: shopId } : {};
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { description, employeeId, coffeeShopId } = await request.json();

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    if (!coffeeShopId) {
      return NextResponse.json(
        { error: 'Coffee shop ID is required' },
        { status: 400 }
      );
    }

    const task = new Task({
      description,
      employeeId,
      coffeeShopId,
      status: 'pending',
      isGlobal: !employeeId,
    });

    await task.save();
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
