import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/verify-request';
import { getDocumentVersion } from '@/lib/firestore/app-data';
import { updateDocumentVersion, deleteDocumentVersion } from '@/lib/firestore/app-writes';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const authVal = await requireAuth();
  if (authVal instanceof NextResponse) return authVal;

  const { id } = await props.params;

  try {
    const ver = await getDocumentVersion(id);
    if (!ver) {
      return NextResponse.json({ error: 'Document version not found' }, { status: 404 });
    }
    return NextResponse.json(ver);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const authVal = await requireAuth();
  if (authVal instanceof NextResponse) return authVal;

  const { role } = authVal.session;
  if (role !== 'admin' && role !== 'manager') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await props.params;

  try {
    const ver = await getDocumentVersion(id);
    if (!ver) {
      return NextResponse.json({ error: 'Document version not found' }, { status: 404 });
    }

    const body = await req.json();
    const patch: any = {};
    if (body.is_current !== undefined) patch.is_current = body.is_current;
    if (body.change_notes !== undefined) patch.change_notes = body.change_notes;

    await updateDocumentVersion(id, patch);
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
    await deleteDocumentVersion(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
