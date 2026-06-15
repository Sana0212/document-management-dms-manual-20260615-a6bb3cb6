import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/verify-request';
import { listRetentionPolicies } from '@/lib/firestore/app-data';
import { createRetentionPolicy } from '@/lib/firestore/app-writes';
import { RetentionPolicySchema } from '@/lib/validation/entities';

export async function GET() {
  const authVal = await requireAuth();
  if (authVal instanceof NextResponse) return authVal;

  try {
    const list = await listRetentionPolicies();
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authVal = await requireAuth();
  if (authVal instanceof NextResponse) return authVal;

  const { role } = authVal.session;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = RetentionPolicySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const policyId = await createRetentionPolicy(result.data);
    return NextResponse.json({ id: policyId, success: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
