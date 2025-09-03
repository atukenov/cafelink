import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { role, name, phone, pin } = await request.json();

    if (!role || !name || !phone) {
      return NextResponse.json(
        { error: 'Role, name, and phone are required' },
        { status: 400 }
      );
    }

    if (role === 'employee' && !pin) {
      return NextResponse.json(
        { error: 'PIN is required for employees' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this phone number already exists' },
        { status: 400 }
      );
    }

    const userData: { role: string; name: string; phone: string; pin?: string } = {
      role,
      name,
      phone,
    };

    if (role === 'employee' && pin) {
      userData.pin = await hashPassword(pin);
    }

    const user = new User(userData);
    await user.save();

    const userResponse = {
      _id: user._id,
      role: user.role,
      name: user.name,
      phone: user.phone,
      createdAt: user.createdAt,
    };

    return NextResponse.json(userResponse, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
