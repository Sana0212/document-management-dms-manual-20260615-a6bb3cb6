import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/verify-request';
import { listSettings } from '@/lib/firestore/app-data';
import { createSetting } from '@/lib/firestore/app-writes';
import { SettingSchema } from '@/lib/validation/entities';

export async function GET() {
  const authVal = await requireAuth();
  if (authVal instanceof NextResponse) return authVal;

  const { role } = authVal.session;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const list = await listSettings();
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authVal = await requireAuth();
  if (authVal instanceof NextResponse) return authVal;

  const { role, userId } = authVal.session;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = SettingSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const settingId = await createSetting({
      ...result.data,
      updated_by_user_id: userId,
    });
    return NextResponse.json({ id: settingId, success: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
