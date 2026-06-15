import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/verify-request';
import { listDocuments, listApprovals, listCategories } from '@/lib/firestore/app-data';

export async function GET() {
  const authVal = await requireAuth();
  if (authVal instanceof NextResponse) return authVal;

  try {
    const { userId, role } = authVal.session;

    const allDocs = await listDocuments();
    const allApprovals = await listApprovals();
    const allCategories = await listCategories();

    // 1. Recent Documents (latest 10)
    // Filter out confidential documents if user is not Admin/Manager/Owner
    const visibleDocs = allDocs.filter(doc => {
      if (role === 'admin' || role === 'manager') return true;
      if (doc.owner_user_id === userId || doc.created_by_user_id === userId) return true;
      return !doc.is_confidential;
    });

    const recentDocuments = [...visibleDocs]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    // 2. Pending Approvals (assigned to this user + status == 'pending')
    const pendingApprovals = allApprovals.filter(app => {
      // Admin/manager can see all open approvals, employee can see assigned to them
      const isAssigned = app.assigned_to_user_id === userId;
      const isOpen = app.status.toLowerCase() === 'pending';
      if (role === 'admin') return isOpen;
      return isOpen && isAssigned;
    });

    // 3. Documents by Category aggregation
    const categoryMap: { [key: string]: { name: string; count: number } } = {};
    allCategories.forEach(cat => {
      categoryMap[cat.id!] = { name: cat.name, count: 0 };
    });

    allDocs.forEach(doc => {
      if (categoryMap[doc.category_id]) {
        categoryMap[doc.category_id].count += 1;
      } else {
        categoryMap[doc.category_id] = { name: 'Unknown Category', count: 1 };
      }
    });

    const documentsByCategory = Object.values(categoryMap);

    // 4. Expiring Documents (retention expiry within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const now = new Date();

    const expiringDocuments = visibleDocs.filter(doc => {
      if (!doc.retention_expiry_date) return false;
      const expiry = new Date(doc.retention_expiry_date);
      return expiry >= now && expiry <= thirtyDaysFromNow;
    });

    return NextResponse.json({
      recent_documents: recentDocuments,
      pending_approvals: {
        count: pendingApprovals.length,
        items: pendingApprovals,
      },
      documents_by_category: documentsByCategory,
      expiring_documents: expiringDocuments,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error loading dashboard' }, { status: 500 });
  }
}
