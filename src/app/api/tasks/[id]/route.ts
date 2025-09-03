import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { status, employeeId } = await request.json();
    const { id } = await params;

    if (!status || !['pending', 'done'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (pending, done)' },
        { status: 400 }
      );
    }

    const updateData: { status: string; employeeId?: string } = { status };
    if (employeeId) {
      updateData.employeeId = employeeId;
    }

    const task = await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
