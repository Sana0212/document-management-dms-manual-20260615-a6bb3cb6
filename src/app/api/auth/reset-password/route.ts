import { NextResponse } from 'next/server';
import { findUserByEmail, hashPassword } from '@/lib/auth/user-store';
import { updateUser } from '@/lib/firestore/app-writes';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const newHash = hashPassword(password);
    await updateUser(user.id!, { password_hash: newHash });

    return NextResponse.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
