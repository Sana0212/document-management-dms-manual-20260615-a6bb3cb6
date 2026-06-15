import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/verify-request';
import { getUser } from '@/lib/firestore/app-data';
import { updateUser, deleteUser } from '@/lib/firestore/app-writes';
import { UserSchema } from '@/lib/validation/entities';
import { hashPassword } from '@/lib/auth/user-store';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const authVal = await requireAuth();
  if (authVal instanceof NextResponse) return authVal;

  const { role } = authVal.session;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await props.params;

  try {
    const user = await getUser(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const { password_hash, ...sanitized } = user;
    return NextResponse.json(sanitized);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const authVal = await requireAuth();
  if (authVal instanceof NextResponse) return authVal;

  const { role } = authVal.session;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await props.params;

  try {
    const body = await req.json();
    // Allow partial validation for updates, but use custom validator or let write handle it.
    // To keep simple & robust, we parse partial schema details or extract required fields.
    const patch: any = {};
    if (body.email) patch.email = body.email;
    if (body.password_hash) patch.password_hash = hashPassword(body.password_hash);
    if (body.first_name) patch.first_name = body.first_name;
    if (body.last_name) patch.last_name = body.last_name;
    if (body.role_key) patch.role_key = body.role_key;
    if (body.department !== undefined) patch.department = body.department;
    if (body.is_active !== undefined) patch.is_active = body.is_active;

    await updateUser(id, patch);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const authVal = await requireAuth();
  if (authVal instanceof NextResponse) return authVal;

  const { role } = authVal.session;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await props.params;

  try {
    await deleteUser(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
