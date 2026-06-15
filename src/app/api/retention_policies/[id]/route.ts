import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/verify-request';
import { getRetentionPolicy } from '@/lib/firestore/app-data';
import { updateRetentionPolicy, deleteRetentionPolicy } from '@/lib/firestore/app-writes';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const authVal = await requireAuth();
  if (authVal instanceof NextResponse) return authVal;

  const { id } = await props.params;

  try {
    const policy = await getRetentionPolicy(id);
    if (!policy) {
      return NextResponse.json({ error: 'Retention policy not found' }, { status: 404 });
    }
    return NextResponse.json(policy);
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
    const patch: any = {};
    if (body.name) patch.name = body.name;
    if (body.code) patch.code = body.code;
    if (body.description !== undefined) patch.description = body.description;
    if (body.duration_value !== undefined) patch.duration_value = body.duration_value;
    if (body.duration_unit) patch.duration_unit = body.duration_unit;
    if (body.legal_hold_allowed !== undefined) patch.legal_hold_allowed = body.legal_hold_allowed;
    if (body.is_default !== undefined) patch.is_default = body.is_default;
    if (body.is_active !== undefined) patch.is_active = body.is_active;

    await updateRetentionPolicy(id, patch);
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
    await deleteRetentionPolicy(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
