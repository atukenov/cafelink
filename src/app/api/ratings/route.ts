import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import EmployeeStats from '@/models/EmployeeStats';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { orderId, rating, comment } = await request.json();

    if (!orderId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Valid order ID and rating (1-5) are required' },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);
    if (!order || order.status !== 'ready') {
      return NextResponse.json(
        { error: 'Order not found or not completed' },
        { status: 404 }
      );
    }

    const currentShiftsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/current-shifts`);
    const currentShifts = await currentShiftsResponse.json();
    
    if (currentShifts.length > 0) {
      const employeeId = currentShifts[0].employeeId;
      
      let employeeStats = await EmployeeStats.findOne({ employeeId });
      if (!employeeStats) {
        employeeStats = new EmployeeStats({
          employeeId,
          tasksCompleted: 0,
          tasksAssigned: 0,
          shiftsAttended: 0,
          shiftsScheduled: 0,
          ordersProcessed: 0,
          averageOrderTime: 0,
          rating: rating,
          comments: comment ? [comment] : [],
          lastUpdated: new Date(),
        });
      } else {
        const currentRating = employeeStats.rating || 0;
        const currentComments = employeeStats.comments || [];
        
        employeeStats.rating = currentRating === 0 ? rating : (currentRating + rating) / 2;
        if (comment) {
          employeeStats.comments = [...currentComments, comment].slice(-10);
        }
        employeeStats.lastUpdated = new Date();
      }
      
      await employeeStats.save();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Submit rating error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
