import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyPassword, generateToken, generateOTP } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { phone, pin } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (['employee', 'admin', 'administrator', 'author'].includes(user.role)) {
      if (!pin) {
        return NextResponse.json(
          { error: 'PIN is required for employees, admins, administrators, and authors' },
          { status: 400 }
        );
      }

      if (!user.pin || !(await verifyPassword(pin, user.pin))) {
        return NextResponse.json(
          { error: 'Invalid PIN' },
          { status: 401 }
        );
      }
    }

    const token = generateToken(user._id.toString());
    const mockOTP = generateOTP();

    const userResponse = {
      _id: user._id,
      role: user.role,
      name: user.name,
      phone: user.phone,
      token,
      mockOTP,
    };

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
