import { NextResponse } from 'next/server';
import { findUserByEmail, hashPassword } from '@/lib/auth/user-store';
import { createSession } from '@/lib/auth/session';
import { updateUser } from '@/lib/firestore/app-writes';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (!user.is_active) {
      return NextResponse.json({ error: 'Your account is disabled' }, { status: 403 });
    }

    const hashedPassword = hashPassword(password);
    if (user.password_hash !== hashedPassword) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Update last login
    const loginTime = new Date().toISOString();
    await updateUser(user.id!, { last_login_at: loginTime });

    // Create session
    await createSession({
      userId: user.id!,
      email: user.email,
      role: user.role_key,
      fullName: `${user.first_name} ${user.last_name}`,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, role: user.role_key } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
