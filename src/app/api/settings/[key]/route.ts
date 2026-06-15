import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/verify-request';
import { getSettingByKey } from '@/lib/firestore/app-data';
import { updateSetting } from '@/lib/firestore/app-writes';

export async function GET(req: Request, props: { params: Promise<{ key: string }> }) {
  const authVal = await requireAuth();
  if (authVal instanceof NextResponse) return authVal;

  const { key } = await props.params;

  try {
    const setting = await getSettingByKey(key);
    if (!setting) {
      return NextResponse.json({ error: 'Setting key not found' }, { status: 404 });
    }
    return NextResponse.json(setting);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ key: string }> }) {
  const authVal = await requireAuth();
  if (authVal instanceof NextResponse) return authVal;

  const { role, userId } = authVal.session;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { key } = await props.params;

  try {
    const setting = await getSettingByKey(key);
    if (!setting) {
      return NextResponse.json({ error: 'Setting key not found' }, { status: 404 });
    }

    const body = await req.json();
    if (!body.value) {
      return NextResponse.json({ error: 'Value is required' }, { status: 400 });
    }

    await updateSetting(setting.id!, {
      value: body.value,
      updated_by_user_id: userId,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
