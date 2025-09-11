import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth-middleware';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser(request);
    
    if (error || !user || user.role !== 'author') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { script } = await request.json();
    
    const allowedScripts = [
      'create-author',
      'create-admin', 
      'create-default-shop',
      'seed-menu',
      'seed-additional-items'
    ];

    if (!allowedScripts.includes(script)) {
      return NextResponse.json({ error: 'Invalid script' }, { status: 400 });
    }

    const scriptPath = path.join(process.cwd(), 'scripts', `${script}.js`);
    const { stdout, stderr } = await execAsync(`node "${scriptPath}"`, {
      env: { ...process.env }
    });
    
    return NextResponse.json({ 
      success: true, 
      output: stdout,
      error: stderr || null
    });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({ 
      error: 'Failed to execute seeding script',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
