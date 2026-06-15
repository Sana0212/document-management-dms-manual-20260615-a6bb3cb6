import { NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/auth/user-store';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      // Return success anyway for security / timing-attack mitigation
      return NextResponse.json({ success: true, message: 'If the email exists, a password reset link has been simulated.' });
    }

    // Since we don't have an email provider, we simulate or store token in DB if needed.
    // We return successful response.
    return NextResponse.json({ success: true, message: 'Password reset code has been sent/simulated.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
