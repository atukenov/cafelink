import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ScheduledShift from '@/models/ScheduledShift';
import Shift from '@/models/Shift';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();
    
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);
    
    const scheduledShifts = await ScheduledShift.find({
      isActive: true,
      weekdays: currentDay,
      startTime: { $lte: currentTime },
      endTime: { $gte: currentTime }
    });
    
    const activeShifts = await Shift.find({
      endTime: null,
      startTime: {
        $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
      }
    });
    
    const employeeIds = [
      ...scheduledShifts.map(shift => shift.employeeId),
      ...activeShifts.map(shift => shift.employeeId)
    ];
    
    const uniqueEmployeeIds = [...new Set(employeeIds)];
    
    const employees = await User.find({
      _id: { $in: uniqueEmployeeIds },
      role: { $in: ['employee', 'administrator'] }
    });
    
    const currentEmployees = employees.map(emp => ({
      _id: emp._id,
      name: emp.name,
      role: emp.role
    }));
    
    return NextResponse.json(currentEmployees);
  } catch (error) {
    console.error('Get current shifts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
