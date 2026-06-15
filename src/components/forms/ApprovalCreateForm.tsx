'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { Document, User } from '@/data/types';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface ApprovalCreateFormProps {
  documentId?: string; // Optional if starting from documents view
  onSuccess?: (approvalId: string) => void;
  onCancel?: () => void;
}

export default function ApprovalCreateForm({
  documentId: initialDocumentId,
  onSuccess,
  onCancel,
}: ApprovalCreateFormProps) {
  const router = useRouter();
  const { user } = useSession();

  // Loading states
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  // Data pools
  const [documents, setDocuments] = useState<Document[]>([]);
  const [approvers, setApprovers] = useState<User[]>([]);

  // Form states
  const [documentId, setDocumentId] = useState(initialDocumentId || '');
  const [assignedToUserId, setAssignedToUserId] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initForm() {
      try {
        const [docsRes, usersRes] = await Promise.all([
          fetch('/api/documents').then((r) => (r.ok ? r.json() : [])),
          fetch('/api/users').then((r) => (r.ok ? r.json() : [])),
        ]);

        const rawDocs = Array.isArray(docsRes) ? docsRes : (docsRes.data || []);
        const rawUsers = Array.isArray(usersRes) ? usersRes : (usersRes.data || []);

        // Filter documents that actually need approval (e.g. pending, or draft)
        setDocuments(rawDocs);

        // Filter users that could act as approvers (admin or manager roles)
        const possibleApprovers = rawUsers.filter(
          (u: User) => u.is_active && (u.role_key === 'admin' || u.role_key === 'manager')
        );
        setApprovers(possibleApprovers);
      } catch (err) {
        console.error('Failed to pre-load options for approval form', err);
      } finally {
        setInitLoading(false);
      }
    }
    void initForm();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentId) {
      setError('Please select a document to submit for approval.');
      return;
    }
    if (!assignedToUserId) {
      setError('Please assign a reviewer/approver.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        document_id: documentId,
        requested_by_user_id: user?.userId || '',
        assigned_to_user_id: assignedToUserId,
        status: 'pending',
        due_at: dueAt ? new Date(dueAt).toISOString() : undefined,
      };

      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to create approval request');
      }

      const createdApproval = await res.json();

      // We should also set the document status to pending_approval info
      await fetch(`/api/documents/${documentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'pending_approval',
          latest_approval_id: createdApproval.id,
        }),
      });

      if (onSuccess) {
        onSuccess(createdApproval.id);
      } else {
        router.push(`/approvals/${createdApproval.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during creation.');
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-6 space-y-2">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
        <span className="text-sm text-slate-500">Loading form relations...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-xs font-medium rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {/* Document Selection */}
        {!initialDocumentId ? (
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Document requiring review *
            </label>
            <select
              required
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
            >
              <option value="">-- Choose a Document --</option>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.title} ({doc.status})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Document
            </label>
            <div className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
              {documents.find((d) => d.id === initialDocumentId)?.title || 'Selected Document'}
            </div>
          </div>
        )}

        {/* Assigned Approver */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Assign To (Approver / Manager) *
          </label>
          <select
            required
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            value={assignedToUserId}
            onChange={(e) => setAssignedToUserId(e.target.value)}
          >
            <option value="">-- Select Supervisor --</option>
            {approvers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.first_name} {u.last_name} ({u.role_key.toUpperCase()}{' '}
                {u.department ? `- ${u.department}` : ''})
              </option>
            ))}
          </select>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Response Due Date (Optional)
          </label>
          <input
            type="datetime-local"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
          />
        </div>
      </div>

      <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm hover:bg-slate-100 rounded-lg font-medium text-slate-600 transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium text-sm flex items-center shadow-sm hover:shadow transition disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="mr-2 h-4 w-4" />
          )}
          Request Review
        </button>
      </div>
    </form>
  );
}
