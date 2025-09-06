import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Shift from '@/models/Shift';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    
    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID required' }, { status: 400 });
    }

    const currentShift = await Shift.findOne({
      employeeId,
      endTime: { $exists: false }
    }).sort({ startTime: -1 });

    return NextResponse.json(currentShift);
  } catch (error) {
    console.error('Error fetching current shift:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
