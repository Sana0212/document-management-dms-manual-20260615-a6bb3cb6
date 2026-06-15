import { NextResponse } from 'next/server';
import { findUserByEmail, hashPassword } from '@/lib/auth/user-store';
import { createSession } from '@/lib/auth/session';
import { createUser } from '@/lib/firestore/app-writes';

export async function POST(req: Request) {
  try {
    const { first_name, last_name, email, password, department } = await req.json();

    if (!first_name || !last_name || !email || !password) {
      return NextResponse.json({ error: 'Missing required registration fields' }, { status: 400 });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
    }

    const password_hash = hashPassword(password);

    // First user is Admin, others default to employee/viewer or requested
    const userId = await createUser({
      email,
      password_hash,
      first_name,
      last_name,
      role_key: 'employee', // Default role for registering
      department: department || '',
      is_active: true,
      last_login_at: null,
    });

    // Create session
    await createSession({
      userId,
      email,
      role: 'employee',
      fullName: `${first_name} ${last_name}`,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, userId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
