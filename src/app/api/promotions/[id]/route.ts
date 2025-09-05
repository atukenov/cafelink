import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Promotion from '@/models/Promotion';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    
    const { type, title, description, imageUrl, isActive, validFrom, validTo } = await request.json();
    const { id } = params;

    const promotion = await Promotion.findByIdAndUpdate(
      id,
      { 
        type, 
        title, 
        description, 
        imageUrl, 
        isActive, 
        validFrom: validFrom ? new Date(validFrom) : undefined,
        validTo: validTo ? new Date(validTo) : undefined
      },
      { new: true }
    );

    if (!promotion) {
      return NextResponse.json(
        { error: 'Promotion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(promotion);
  } catch (error) {
    console.error('Update promotion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const promotion = await Promotion.findByIdAndDelete(id);

    if (!promotion) {
      return NextResponse.json(
        { error: 'Promotion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    console.error('Delete promotion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
