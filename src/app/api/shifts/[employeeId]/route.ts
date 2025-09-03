import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Shift from '@/models/Shift';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    await dbConnect();
    
    const { employeeId } = await params;
    const shifts = await Shift.find({ employeeId }).sort({ startTime: -1 });

    return NextResponse.json(shifts);
  } catch (error) {
    console.error('Get employee shifts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
