import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/verify-request';
import { getApproval } from '@/lib/firestore/app-data';
import { updateApproval, deleteApproval } from '@/lib/firestore/app-writes';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const authVal = await requireAuth();
  if (authVal instanceof NextResponse) return authVal;

  const { role, userId } = authVal.session;
  const { id } = await props.params;

  if (role === 'viewer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const app = await getApproval(id);
    if (!app) {
      return NextResponse.json({ error: 'Approval request not found' }, { status: 404 });
    }

    if (role !== 'admin' && app.requested_by_user_id !== userId && app.assigned_to_user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(app);
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
    const app = await getApproval(id);
    if (!app) {
      return NextResponse.json({ error: 'Approval request not found' }, { status: 404 });
    }

    // Role check: Admin can update anything. Manager can update anything.
    // Employee can update status/decision only if assigned to them.
    if (role !== 'admin' && role !== 'manager') {
      if (app.assigned_to_user_id !== userId) {
        return NextResponse.json({ error: 'You are not authorized to decide on this approval' }, { status: 403 });
      }
    }

    const body = await req.json();
    const patch: any = {};
    if (body.status) patch.status = body.status;
    if (body.decision) patch.decision = body.decision;
    if (body.decision_notes !== undefined) patch.decision_notes = body.decision_notes;
    if (body.decision === 'Approved' || body.decision === 'Rejected') {
      patch.decision_at = new Date().toISOString();
    }

    await updateApproval(id, patch);
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
    await deleteApproval(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
