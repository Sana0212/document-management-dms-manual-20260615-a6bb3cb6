import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/verify-request';
import { listCategories } from '@/lib/firestore/app-data';
import { createCategory } from '@/lib/firestore/app-writes';
import { CategorySchema } from '@/lib/validation/entities';

export async function GET() {
  const authVal = await requireAuth();
  if (authVal instanceof NextResponse) return authVal;

  try {
    const list = await listCategories();
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
    const result = CategorySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const categoryId = await createCategory(result.data);
    return NextResponse.json({ id: categoryId, success: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
