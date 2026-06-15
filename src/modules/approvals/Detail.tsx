'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Approval, Document, User, DocumentVersion } from '@/data/types';
import ApprovalDecisionForm from '@/components/forms/ApprovalDecisionForm';
import { useSession } from '@/hooks/useSession';
import {
  Loader2,
  ChevronLeft,
  Calendar,
  Layers,
  FileText,
  UserCheck,
  Flag,
  ArrowUpRight,
  ClipboardList,
} from 'lucide-react';

interface ApprovalDetailModuleProps {
  id: string;
}

export default function ApprovalDetailModule({ id }: ApprovalDetailModuleProps) {
  const router = useRouter();
  const { user } = useSession();

  const [approval, setApproval] = useState<Approval | null>(null);
  const [documentObj, setDocumentObj] = useState<Document | null>(null);
  const [docVersion, setDocVersion] = useState<DocumentVersion | null>(null);
  const [requestedByUser, setRequestedByUser] = useState<User | null>(null);
  const [assignedToUser, setAssignedToUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDecisionForm, setShowDecisionForm] = useState(false);

  const fetchAllDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch main approval Record
      const approvalRes = await fetch(`/api/approvals/${id}`);
      if (!approvalRes.ok) {
        throw new Error('Approval validation code reference not found.');
      }
      const appData: Approval = await approvalRes.json();
      setApproval(appData);

      // 2. Load dependencies
      const [docRes, usersRes] = await Promise.all([
        fetch(`/api/documents/${appData.document_id}`).then((r) => (r.ok ? r.json() : null)),
        fetch('/api/users').then((r) => (r.ok ? r.json() : [])),
      ]);

      setDocumentObj(docRes);

      const allUsers: User[] = Array.isArray(usersRes) ? usersRes : usersRes.data || [];
      const requester = allUsers.find((u) => u.id === appData.requested_by_user_id) || null;
      const assigned = allUsers.find((u) => u.id === appData.assigned_to_user_id) || null;

      setRequestedByUser(requester);
      setAssignedToUser(assigned);

      // 3. Obtain current version record attached if there is an active document reference
      if (docRes && docRes.current_version_id) {
        const verRes = await fetch(`/api/document_versions/${docRes.current_version_id}`);
        if (verRes.ok) {
          const verData = await verRes.json();
          setDocVersion(verData);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while loading workflow details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      void fetchAllDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
        <span className="text-sm font-semibold text-slate-500">
          Loading workflow ledger entry...
        </span>
      </div>
    );
  }

  if (error || !approval) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-red-50 border border-red-200 rounded-xl text-center">
        <h3 className="text-lg font-bold text-red-800 mb-2">Detailed Retrieval Failed</h3>
        <p className="text-sm text-red-700 mb-4">{error || 'Workflow item with this ID can not be located.'}</p>
        <Link
          href="/approvals"
          className="inline-flex items-center text-sm font-semibold text-teal-600 hover:text-teal-700 gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Return back to approvals list
        </Link>
      </div>
    );
  }

  const isAssignedToMe = user?.userId === approval.assigned_to_user_id;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back breadcrumb navigation */}
      <div className="flex items-center justify-between border-b border-slate-150 pb-4">
        <Link
          href="/approvals"
          className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-teal-600 transition gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Approvals
        </Link>

        <span className="text-xs text-slate-400 font-mono">ID: {approval.id}</span>
      </div>

      {/* Grid Layout Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document attachment summary */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-150 uppercase tracking-wide">
                  <FileText className="h-3.5 w-3.5" />
                  Subject Document
                </span>
                <h2 className="text-xl font-extrabold text-slate-950 mt-2">
                  {documentObj ? documentObj.title : 'Deleted Document'}
                </h2>
              </div>

              {documentObj && (
                <Link
                  href={`/documents/${documentObj.id}`}
                  className="p-1.5 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-150 hover:text-teal-600 rounded-lg transition"
                  title="View full document profile"
                >
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
              )}
            </div>

            {documentObj?.description && (
              <p className="text-sm text-slate-600 border-l-2 border-slate-200 pl-4 py-1 italic bg-slate-50/50 rounded-r-lg">
                &ldquo;{documentObj.description}&rdquo;
              </p>
            )}

            {/* Version attachment metadata */}
            {docVersion ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">
                  Target Revision For Verification
                </span>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-800 break-all">{docVersion.file_name}</span>
                  <span className="font-mono text-xs text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-sm">
                    v{docVersion.version_number}
                  </span>
                </div>
                {docVersion.change_notes && (
                  <p className="text-xs text-slate-500 mt-1">
                    <span className="font-semibold">Author Modification Statement:</span>{' '}
                    {docVersion.change_notes}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 bg-amber-50 text-amber-800 text-xs font-medium rounded-lg border border-amber-200">
                No currently mapped payload version could be verified. Contact document author to link uploads.
              </div>
            )}
          </div>

          {/* Workflow Outcome & Decision state */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="h-4.5 w-4.5 text-slate-500" />
              Outcome Audit Log
            </h3>

            {approval.status === 'completed' ? (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-xl border ${
                    approval.decision === 'approved'
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-250'
                      : 'bg-rose-50 text-rose-900 border-rose-250'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-extrabold uppercase">
                      Decision Outcome: {approval.decision?.toUpperCase()}
                    </span>
                  </div>
                  {approval.decision_notes && (
                    <div className="text-sm mt-3 border-t border-emerald-150/50 pt-2 block font-normal whitespace-pre-line">
                      {approval.decision_notes}
                    </div>
                  )}
                </div>

                {approval.decision_at && (
                  <div className="text-xs text-slate-450 font-mono">
                    Concluded on: {new Date(approval.decision_at).toString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-250 text-amber-900 space-y-2">
                  <span className="font-extrabold text-sm uppercase block">Review Pending Submission</span>
                  <p className="text-xs text-amber-800 font-normal">
                    This document sequence remains un-vouchered. Decisive action from of the assigned Manager
                    is required before documents are certified for business operations.
                  </p>
                </div>

                {isAssignedToMe && !showDecisionForm && (
                  <button
                    onClick={() => setShowDecisionForm(true)}
                    className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-sm shadow hover:shadow-md transition text-center"
                  >
                    Action Decision Task
                  </button>
                )}

                {showDecisionForm && (
                  <div className="p-4 border border-slate-200 bg-slate-50 rounded-xl space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Sign-off Panel
                      </span>
                      <button
                        onClick={() => setShowDecisionForm(false)}
                        className="text-xs text-slate-450 hover:text-slate-650"
                      >
                        Collapse
                      </button>
                    </div>
                    <ApprovalDecisionForm approval={approval} onSuccess={() => void fetchAllDetails()} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar parameters column */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 text-sm">
            <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider border-b pb-2">
              Review Specifications
            </h3>

            <div className="space-y-3.5">
              {/* Originator */}
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-slate-50 text-slate-500 rounded border border-slate-150 mt-0.5">
                  <Flag className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase">Sender</span>
                  <span className="font-semibold text-slate-800">
                    {requestedByUser
                      ? `${requestedByUser.first_name} ${requestedByUser.last_name}`
                      : 'Unknown'}
                  </span>
                  {requestedByUser?.department && (
                    <span className="block text-xs text-slate-500">{requestedByUser.department}</span>
                  )}
                </div>
              </div>

              {/* Reviewer */}
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-slate-50 text-slate-500 rounded border border-slate-150 mt-0.5">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase">Assigned Auditor</span>
                  <span className="font-semibold text-slate-800">
                    {assignedToUser
                      ? `${assignedToUser.first_name} ${assignedToUser.last_name}`
                      : 'Unassigned'}
                  </span>
                </div>
              </div>

              {/* Time limits / Limit alerts */}
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-slate-50 text-slate-500 rounded border border-slate-150 mt-0.5">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase">Response target</span>
                  <span className="font-semibold text-slate-800">
                    {approval.due_at
                      ? new Date(approval.due_at).toLocaleDateString(undefined, {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'None Defined'}
                  </span>
                </div>
              </div>

              {/* Created Timeline */}
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-slate-50 text-slate-500 rounded border border-slate-150 mt-0.5">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase">Lodge Time</span>
                  <span className="font-semibold text-slate-850">
                    {new Date(approval.created_at).toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
