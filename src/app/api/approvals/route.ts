import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/verify-request';
import { listApprovals } from '@/lib/firestore/app-data';
import { createApproval } from '@/lib/firestore/app-writes';
import { ApprovalSchema } from '@/lib/validation/entities';

export async function GET() {
  const authVal = await requireAuth();
  if (authVal instanceof NextResponse) return authVal;

  const { role, userId } = authVal.session;

  if (role === 'viewer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const list = await listApprovals();
    // Non-admins only see approvals they requested or are assigned to
    if (role !== 'admin') {
      const filtered = list.filter(
        (app) => app.requested_by_user_id === userId || app.assigned_to_user_id === userId
      );
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
    const result = ApprovalSchema.safeParse({
      ...body,
      requested_by_user_id: userId,
      status: body.status || 'Pending',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const approvalId = await createApproval({
      ...result.data,
      requested_by_user_id: userId,
    });

    return NextResponse.json({ id: approvalId, success: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
