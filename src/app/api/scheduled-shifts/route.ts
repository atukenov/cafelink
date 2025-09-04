import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ScheduledShift from '@/models/ScheduledShift';

export async function GET() {
  try {
    await dbConnect();
    
    const shifts = await ScheduledShift.find({}).sort({ createdAt: -1 });
    return NextResponse.json(shifts);
  } catch (error) {
    console.error('Get scheduled shifts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { employeeId, weekdays, startTime, endTime } = await request.json();

    if (!employeeId || !weekdays || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const shift = new ScheduledShift({
      employeeId,
      weekdays,
      startTime,
      endTime,
      isActive: true,
    });

    await shift.save();
    return NextResponse.json(shift, { status: 201 });
  } catch (error) {
    console.error('Create scheduled shift error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
