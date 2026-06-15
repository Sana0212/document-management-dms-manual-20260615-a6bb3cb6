'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from '@/hooks/useSession';
import { 
  FileText, 
  CheckSquare, 
  FolderTree, 
  Clock, 
  AlertTriangle, 
  ArrowUpRight, 
  Clock3,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          const body = await res.json();
          setData(body);
        }
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  // Mock static layout highlights if loading fails or API is empty
  const documentsCount = data?.documentsCount ?? 24;
  const pendingApprovalsCount = data?.pendingApprovalsCount ?? 3;
  const categoriesCount = data?.categoriesCount ?? 6;
  const expiringCount = data?.expiringCount ?? 2;

  const recentDocuments = data?.recentDocuments || [
    { id: '1', title: 'Onboarding Handbook v1.pdf', status: 'Approved', categoryName: 'HR', ownerName: 'Jane Doe', date: '2 hours ago' },
    { id: '2', title: 'Q3 Financial Audit Ledger.xlsx', status: 'Pending Review', categoryName: 'Finance', ownerName: 'Robert Lang', date: 'Yesterday' },
    { id: '3', title: 'Global Vendor Agreement Terms.docx', status: 'Draft', categoryName: 'Legal', ownerName: 'Alice Springs', date: '2 days ago' },
  ];

  const pendingApprovals = data?.pendingApprovals || [
    { id: '101', documentTitle: 'ISO 27001 Compliance Scope.pdf', requestedBy: 'Alice Springs', due: 'In 3 days' },
    { id: '102', documentTitle: 'Marketing Brand Plan 2025.pptx', requestedBy: 'Jane Doe', due: 'In 5 days' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Intro section */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">DMS Workspace Overview</h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time control status for department catalogs, live metadata locks, and system approvals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/documents/create"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 transition-all font-medium"
          >
            <span>Upload Document</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Documents</span>
            <div className="rounded-lg bg-teal-50 p-2 text-teal-600">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{documentsCount}</span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+12% this month</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Approvals</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <CheckSquare className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{pendingApprovalsCount}</span>
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Action required</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Doc Categories</span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <FolderTree className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{categoriesCount}</span>
            <span className="text-xs text-slate-400">Structured catalogs</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expiry Warning</span>
            <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{expiringCount}</span>
            <span className="text-xs font-medium text-rose-700 bg-rose-100/55 px-1.5 py-0.5 rounded">Expiring (30d)</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Widgets Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left widget block - Recent documents uploaded */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Workspace Uploads</h3>
              <p className="text-xs text-slate-400">Latest active documents cataloged in the storage vault</p>
            </div>
            <Link
              href="/documents"
              className="text-xs font-semibold text-teal-600 hover:text-teal-500 inline-flex items-center gap-1"
            >
              <span>View Library</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentDocuments.map((doc: any, index: number) => (
              <div key={doc.id || index} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-slate-50 p-2">
                    <FileText className="h-5 w-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 line-clamp-1">{doc.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{doc.categoryName}</span>
                      <span className="text-xs text-slate-300">&bull;</span>
                      <span className="text-xs text-slate-400">By {doc.ownerName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    doc.status === 'Approved' 
                      ? 'bg-emerald-50 text-emerald-800'
                      : doc.status === 'Pending Review'
                      ? 'bg-amber-50 text-amber-800'
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    {doc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right widget block - Action items & Approvals */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Your Action Approvals</h3>
              <p className="text-xs text-slate-400">Awaiting your design decisions</p>
            </div>
            <Link
              href="/approvals"
              className="text-xs font-semibold text-teal-600 hover:text-teal-500 inline-flex items-center gap-1"
            >
              <span>Manage Tasks</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {pendingApprovals.map((task: any, index: number) => (
              <div key={task.id || index} className="rounded-lg bg-slate-50 p-3.5 border border-slate-100 hover:border-slate-200 transition-colors">
                <p className="text-xs font-bold text-slate-700 font-semibold mb-1 truncate">{task.documentTitle}</p>
                <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                  <span className="text-slate-400">From &bull; {task.requestedBy}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                    <Clock3 className="h-3 w-3" />
                    <span>{task.due}</span>
                  </span>
                </div>
              </div>
            ))}

            {pendingApprovals.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
                <CheckSquare className="h-8 w-8 text-slate-300" />
                <p className="text-xs font-medium">All caught up! No pending approvals.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export const dynamic = 'force-dynamic';
