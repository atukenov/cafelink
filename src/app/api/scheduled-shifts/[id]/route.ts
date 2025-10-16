import dbConnect from "@/lib/mongodb";
import ScheduledShift from "@/models/ScheduledShift";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { employeeId, weekdays, startTime, endTime, isActive } =
      await request.json();
    const { id } = await params;

    const shift = await ScheduledShift.findByIdAndUpdate(
      id,
      { employeeId, weekdays, startTime, endTime, isActive },
      { new: true }
    );

    if (!shift) {
      return NextResponse.json(
        { error: "Scheduled shift not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(shift);
  } catch (error) {
    console.error("Update scheduled shift error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const shift = await ScheduledShift.findByIdAndDelete(id);

    if (!shift) {
      return NextResponse.json(
        { error: "Scheduled shift not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Scheduled shift deleted successfully",
    });
  } catch (error) {
    console.error("Delete scheduled shift error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
