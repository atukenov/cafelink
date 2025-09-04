import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmployeeStats from '@/models/EmployeeStats';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();
    
    const stats = await EmployeeStats.find({}).sort({ lastUpdated: -1 });
    const employees = await User.find({ role: { $in: ['employee', 'administrator'] } });
    
    const statsWithNames = stats.map(stat => {
      const employee = employees.find(emp => emp._id.toString() === stat.employeeId);
      return {
        ...stat.toObject(),
        employeeName: employee?.name || 'Unknown',
        employeePhone: employee?.phone || 'Unknown'
      };
    });
    
    return NextResponse.json(statsWithNames);
  } catch (error) {
    console.error('Get statistics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { employeeId, action, value } = await request.json();

    if (!employeeId || !action) {
      return NextResponse.json(
        { error: 'Employee ID and action are required' },
        { status: 400 }
      );
    }

    let stats = await EmployeeStats.findOne({ employeeId });
    
    if (!stats) {
      stats = new EmployeeStats({ employeeId });
    }

    switch (action) {
      case 'task_completed':
        stats.tasksCompleted += 1;
        break;
      case 'task_assigned':
        stats.tasksAssigned += 1;
        break;
      case 'shift_attended':
        stats.shiftsAttended += 1;
        break;
      case 'shift_scheduled':
        stats.shiftsScheduled += 1;
        break;
      case 'order_processed':
        stats.ordersProcessed += 1;
        if (value) {
          const totalTime = stats.averageOrderTime * (stats.ordersProcessed - 1) + value;
          stats.averageOrderTime = totalTime / stats.ordersProcessed;
        }
        break;
      case 'update_rating':
        if (value >= 1 && value <= 5) {
          stats.rating = value;
        }
        break;
    }

    stats.lastUpdated = new Date();
    await stats.save();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Update statistics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
