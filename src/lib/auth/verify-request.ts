import { NextResponse } from 'next/server';
import { getSession } from './session';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  fullName: string;
}

export interface AuthValue {
  session: AuthenticatedUser;
}

/** Use in API routes — returns 401 NextResponse or { session }. */
export async function requireAuth(): Promise<AuthValue | NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
  }
  return {
    session: {
      userId: session.userId,
      email: session.email,
      role: session.role,
      fullName: session.fullName,
    },
  };
}
