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

    if (!activeShift) {
      return NextResponse.json(
        { error: 'No active shift found for this employee' },
        { status: 404 }
      );
    }

    activeShift.endTime = new Date();
    await activeShift.save();

    return NextResponse.json(activeShift);
  } catch (error) {
    console.error('End shift error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
