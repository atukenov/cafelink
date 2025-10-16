import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Task from '@/models/Task';
import Shift from '@/models/Shift';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const filter = shopId ? { coffeeShopId: shopId } : {};

    const orders = await Order.find({
      ...filter,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const tasks = await Task.find({
      ...filter,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const shifts = await Shift.find({
      ...filter,
      startTime: { $gte: startOfDay.toISOString(), $lte: endOfDay.toISOString() }
    });

    const completedOrders = orders.filter(o => o.status === 'ready').length;
    const rejectedOrders = orders.filter(o => o.status === 'rejected').length;
    const totalProfit = orders
      .filter(o => o.status === 'ready')
      .reduce((sum, o) => sum + o.totalPrice, 0);
    
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const totalTasks = tasks.length;

    const employeeHours = await Promise.all(
      shifts.map(async (shift) => {
        const employee = await User.findById(shift.employeeId);
        const hours = shift.endTime 
          ? (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1000 * 60 * 60)
          : 0;
        return {
          employeeId: shift.employeeId,
          employeeName: employee?.name || 'Unknown',
          hours: Math.round(hours * 100) / 100
        };
      })
    );

    const report = {
      date,
      shopId,
      orders: {
        total: orders.length,
        completed: completedOrders,
        rejected: rejectedOrders
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      },
      profit: totalProfit,
      employeeHours,
      totalEmployeeHours: employeeHours.reduce((sum, emp) => sum + emp.hours, 0)
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error('Daily report error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
