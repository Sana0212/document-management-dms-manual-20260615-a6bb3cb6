import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/verify-request';
import { findUserByEmail } from '@/lib/auth/user-store';

export async function GET() {
  const authVal = await requireAuth();
  if (authVal instanceof NextResponse) return authVal;

  const user = await findUserByEmail(authVal.session.email);
  if (!user) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
  }

  return NextResponse.json({
    userId: user.id,
    email: user.email,
    role: user.role_key,
    first_name: user.first_name,
    last_name: user.last_name,
    department: user.department,
    is_active: user.is_active,
  });
}
