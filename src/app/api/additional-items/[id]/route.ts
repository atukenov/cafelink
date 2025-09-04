import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AdditionalItem from '@/models/AdditionalItem';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { name, price, productId } = await request.json();
    const { id } = await params;

    const additionalItem = await AdditionalItem.findByIdAndUpdate(
      id,
      { name, price, productId: productId || undefined },
      { new: true, runValidators: true }
    );

    if (!additionalItem) {
      return NextResponse.json(
        { error: 'Additional item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(additionalItem);
  } catch (error) {
    console.error('Update additional item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const additionalItem = await AdditionalItem.findByIdAndDelete(id);

    if (!additionalItem) {
      return NextResponse.json(
        { error: 'Additional item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Additional item deleted successfully' });
  } catch (error) {
    console.error('Delete additional item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
