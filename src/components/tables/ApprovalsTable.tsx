'use client';

import React from 'react';
import Link from 'next/link';
import { Approval, Document, User } from '@/data/types';
import { Calendar, CheckCircle2, AlertCircle, Eye, ChevronRight, Hourglass } from 'lucide-react';

interface ApprovalsTableProps {
  approvals: Approval[];
  documents: Document[];
  users: User[];
  onSelectApproval?: (approval: Approval) => void;
}

export default function ApprovalsTable({
  approvals,
  documents,
  users,
  onSelectApproval,
}: ApprovalsTableProps) {
  const getDocumentTitle = (id: string) => {
    return documents.find((d) => d.id === id)?.title || 'Unknown Document';
  };

  const getUserName = (id: string) => {
    const found = users.find((u) => u.id === id);
    return found ? `${found.first_name} ${found.last_name}` : 'Unknown User';
  };

  const getStatusBadge = (status: string, decision?: string) => {
    if (status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Hourglass className="h-3.5 w-3.5" />
          Pending Review
        </span>
      );
    }

    if (decision === 'approved') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Approved & Published
        </span>
      );
    }

    if (decision === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertCircle className="h-3.5 w-3.5" />
          Rejected
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        Closed
      </span>
    );
  };

  if (!approvals || approvals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">No approvals found</h3>
        <p className="text-sm text-slate-500 max-w-sm mb-4">
          All document reviews are current. You will find requests lodged here when files require verification.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <th className="py-3 px-4">Document Title</th>
            <th className="py-3 px-4">Reviewer Assigned</th>
            <th className="py-3 px-4">Originator</th>
            <th className="py-3 px-4">Decision Status</th>
            <th className="py-3 px-4">Due Target</th>
            <th className="py-3 px-4">Submission Date</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {approvals.map((app) => (
            <tr key={app.id} className="hover:bg-slate-50/75 transition-colors group">
              <td className="py-3.5 px-4 font-semibold text-slate-900">
                <Link
                  href={`/approvals/${app.id}`}
                  className="hover:text-teal-600 transition duration-150 line-clamp-1"
                >
                  {getDocumentTitle(app.document_id)}
                </Link>
              </td>
              <td className="py-3.5 px-4 text-slate-600">
                {getUserName(app.assigned_to_user_id)}
              </td>
              <td className="py-3.5 px-4 text-slate-600">
                {getUserName(app.requested_by_user_id)}
              </td>
              <td className="py-3.5 px-4">{getStatusBadge(app.status, app.decision)}</td>
              <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">
                {app.due_at ? (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {new Date(app.due_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">
                {new Date(app.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </td>
              <td className="py-3.5 px-4 text-right">
                <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition">
                  {onSelectApproval ? (
                    <button
                      onClick={() => onSelectApproval(app)}
                      className="p-1 px-2 text-xs bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 rounded transition font-medium flex items-center gap-1"
                    >
                      Quick Review
                    </button>
                  ) : (
                    <Link
                      href={`/approvals/${app.id}`}
                      className="p-1.5 hover:bg-teal-50 text-slate-500 hover:text-teal-600 rounded-lg transition"
                      title="View Details"
                    >
                      <Eye className="h-4.5 w-4.5" />
                    </Link>
                  )}
                  <Link
                    href={`/approvals/${app.id}`}
                    className="p-1 text-slate-450 hover:text-slate-700 transition"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
