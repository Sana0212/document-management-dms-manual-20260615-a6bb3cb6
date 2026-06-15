import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/verify-request';
import { listDocuments } from '@/lib/firestore/app-data';
import { createDocument } from '@/lib/firestore/app-writes';
import { DocumentSchema } from '@/lib/validation/entities';

export async function GET() {
  const authVal = await requireAuth();
  if (authVal instanceof NextResponse) return authVal;

  const { role, userId } = authVal.session;

  try {
    const docs = await listDocuments();

    // Permissions check:
    // admin, manager can view all. employee / viewer can only view non-confidential OR if they own it.
    const filtered = docs.filter((doc) => {
      if (role === 'admin' || role === 'manager') return true;
      if (doc.owner_user_id === userId || doc.created_by_user_id === userId) return true;
      return !doc.is_confidential;
    });

    return NextResponse.json(filtered);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authVal = await requireAuth();
  if (authVal instanceof NextResponse) return authVal;

  const { role, userId } = authVal.session;

  // Viewers cannot create documents
  if (role === 'viewer') {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = DocumentSchema.safeParse({
      ...body,
      owner_user_id: body.owner_user_id || userId,
      created_by_user_id: userId,
      updated_by_user_id: userId,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const docId = await createDocument({
      ...result.data,
      created_by_user_id: userId,
      updated_by_user_id: userId,
    });

    return NextResponse.json({ id: docId, success: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
