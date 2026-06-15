import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/verify-request';
import { listUsers } from '@/lib/firestore/app-data';
import { createUser } from '@/lib/firestore/app-writes';
import { UserSchema } from '@/lib/validation/entities';
import { hashPassword } from '@/lib/auth/user-store';

export async function GET() {
  const authVal = await requireAuth();
  if (authVal instanceof NextResponse) return authVal;

  const { role } = authVal.session;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const users = await listUsers();
    // Return sanitized users without passwords
    const sanitized = users.map(({ password_hash, ...rest }) => rest);
    return NextResponse.json(sanitized);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authVal = await requireAuth();
  if (authVal instanceof NextResponse) return authVal;

  const { role } = authVal.session;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = UserSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    // Hash the password
    const hashed = hashPassword(result.data.password_hash);

    const userId = await createUser({
      ...result.data,
      password_hash: hashed,
      department: result.data.department || '',
      is_active: result.data.is_active ?? true,
    });

    return NextResponse.json({ id: userId, success: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
