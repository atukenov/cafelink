import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Shift from '@/models/Shift';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { employeeId } = await request.json();

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const activeShift = await Shift.findOne({
      employeeId,
      endTime: { $exists: false }
    });

    if (activeShift) {
      return NextResponse.json(
        { error: 'Employee already has an active shift' },
        { status: 400 }
      );
    }

    const shift = new Shift({
      employeeId,
      startTime: new Date(),
    });

    await shift.save();
    return NextResponse.json(shift, { status: 201 });
  } catch (error) {
    console.error('Start shift error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
