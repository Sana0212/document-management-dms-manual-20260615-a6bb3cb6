import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/verify-request';
import { getCategory } from '@/lib/firestore/app-data';
import { updateCategory, deleteCategory } from '@/lib/firestore/app-writes';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const authVal = await requireAuth();
  if (authVal instanceof NextResponse) return authVal;

  const { id } = await props.params;

  try {
    const category = await getCategory(id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json(category);
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
    if (body.default_retention_policy_id !== undefined) patch.default_retention_policy_id = body.default_retention_policy_id;
    if (body.is_active !== undefined) patch.is_active = body.is_active;

    await updateCategory(id, patch);
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
    await deleteCategory(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
