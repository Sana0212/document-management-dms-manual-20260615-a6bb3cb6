import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/verify-request';
import { listDocumentVersions } from '@/lib/firestore/app-data';
import { createDocumentVersion } from '@/lib/firestore/app-writes';
import { DocumentVersionSchema } from '@/lib/validation/entities';

export async function GET(req: Request) {
  const authVal = await requireAuth();
  if (authVal instanceof NextResponse) return authVal;

  const url = new URL(req.url);
  const documentId = url.searchParams.get('document_id');

  try {
    const list = await listDocumentVersions();
    if (documentId) {
      const filtered = list.filter((ver) => ver.document_id === documentId);
      return NextResponse.json(filtered);
    }
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authVal = await requireAuth();
  if (authVal instanceof NextResponse) return authVal;

  const { role, userId } = authVal.session;

  if (role === 'viewer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = DocumentVersionSchema.safeParse({
      ...body,
      uploaded_by_user_id: userId,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const versionId = await createDocumentVersion({
      ...result.data,
      uploaded_by_user_id: userId,
    });

    return NextResponse.json({ id: versionId, success: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
