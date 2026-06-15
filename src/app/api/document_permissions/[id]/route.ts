import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/verify-request';
import { getDocumentPermission } from '@/lib/firestore/app-data';
import { updateDocumentPermission, deleteDocumentPermission } from '@/lib/firestore/app-writes';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const authVal = await requireAuth();
  if (authVal instanceof NextResponse) return authVal;

  const { role } = authVal.session;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await props.params;

  try {
    const perm = await getDocumentPermission(id);
    if (!perm) {
      return NextResponse.json({ error: 'Document permission not found' }, { status: 404 });
    }
    return NextResponse.json(perm);
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
    if (body.can_view !== undefined) patch.can_view = body.can_view;
    if (body.can_edit !== undefined) patch.can_edit = body.can_edit;
    if (body.can_approve !== undefined) patch.can_approve = body.can_approve;
    if (body.can_download !== undefined) patch.can_download = body.can_download;

    await updateDocumentPermission(id, patch);
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
    await deleteDocumentPermission(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
