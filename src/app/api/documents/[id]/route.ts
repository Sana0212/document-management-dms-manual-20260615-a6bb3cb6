import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/verify-request';
import { getDocument } from '@/lib/firestore/app-data';
import { updateDocument, deleteDocument } from '@/lib/firestore/app-writes';
import { DocumentSchema } from '@/lib/validation/entities';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const authVal = await requireAuth();
  if (authVal instanceof NextResponse) return authVal;

  const { role, userId } = authVal.session;
  const { id } = await props.params;

  try {
    const doc = await getDocument(id);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Permission enforcement
    if (role !== 'admin' && role !== 'manager') {
      if (doc.is_confidential && doc.owner_user_id !== userId && doc.created_by_user_id !== userId) {
        return NextResponse.json({ error: 'Permission denied to view confidential document' }, { status: 403 });
      }
    }

    return NextResponse.json(doc);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const authVal = await requireAuth();
  if (authVal instanceof NextResponse) return authVal;

  const { role, userId } = authVal.session;
  const { id } = await props.params;

  try {
    const doc = await getDocument(id);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Permission checking
    if (role === 'viewer') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (role === 'employee') {
      if (doc.owner_user_id !== userId && doc.created_by_user_id !== userId) {
        return NextResponse.json({ error: 'You can only edit your own documents' }, { status: 403 });
      }
    }

    const body = await req.json();
    const patch: any = {};
    if (body.title) patch.title = body.title;
    if (body.description !== undefined) patch.description = body.description;
    if (body.category_id) patch.category_id = body.category_id;
    if (body.folder_id !== undefined) patch.folder_id = body.folder_id;
    if (body.owner_user_id) patch.owner_user_id = body.owner_user_id;
    if (body.status) patch.status = body.status;
    if (body.tags !== undefined) patch.tags = body.tags;
    if (body.is_confidential !== undefined) patch.is_confidential = body.is_confidential;
    if (body.retention_policy_id !== undefined) patch.retention_policy_id = body.retention_policy_id;
    if (body.retention_expiry_date !== undefined) patch.retention_expiry_date = body.retention_expiry_date;
    if (body.current_version_id !== undefined) patch.current_version_id = body.current_version_id;
    if (body.latest_approval_id !== undefined) patch.latest_approval_id = body.latest_approval_id;
    if (body.can_download !== undefined) patch.can_download = body.can_download;

    patch.updated_by_user_id = userId;

    await updateDocument(id, patch);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const authVal = await requireAuth();
  if (authVal instanceof NextResponse) return authVal;

  const { role, userId } = authVal.session;
  const { id } = await props.params;

  try {
    const doc = await getDocument(id);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Admins have full access. Managers can delete own documents. Employees/Viewers can't delete.
    if (role !== 'admin') {
      if (role === 'manager') {
        if (doc.owner_user_id !== userId && doc.created_by_user_id !== userId) {
          return NextResponse.json({ error: 'Managers can only delete their own documents' }, { status: 403 });
        }
      } else {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    await deleteDocument(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
