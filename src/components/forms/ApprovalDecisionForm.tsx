'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { Approval } from '@/data/types';
import { Loader2, ShieldCheck, XCircle } from 'lucide-react';

interface ApprovalDecisionFormProps {
  approval: Approval;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ApprovalDecisionForm({
  approval,
  onSuccess,
  onCancel,
}: ApprovalDecisionFormProps) {
  const router = useRouter();
  const { user, refreshSession } = useSession();

  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState<'approved' | 'rejected' | ''>('');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Quick permission gate check
  const isAssigned = user?.userId === approval.assigned_to_user_id;
  const isAdmin = user?.role === 'admin';
  const canDecide = isAssigned || isAdmin;

  if (!canDecide) {
    return (
      <div className="p-4 bg-amber-50 text-amber-800 text-sm font-medium rounded-lg border border-amber-200">
        You are not authorized to make a decision on this approval request. This request is assigned to another user.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision) {
      setError('Please select either Approve or Reject.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        status: 'completed',
        decision: decision,
        decision_notes: decisionNotes,
        decision_at: new Date().toISOString(),
      };

      const res = await fetch(`/api/approvals/${approval.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to submit decision');
      }

      // Also trigger a corresponding document status change.
      // Approved -> 'published' (or 'approved'), Rejected -> 'rejected'
      await fetch(`/api/documents/${approval.document_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: decision === 'approved' ? 'published' : 'rejected',
        }),
      });

      if (onSuccess) {
        onSuccess();
      } else {
        refreshSession();
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-xs font-medium rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Your Recommendation / Decision *
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setDecision('approved')}
            className={`flex items-center justify-center p-3.5 border-2 rounded-xl font-semibold transition ${
              decision === 'approved'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
            }`}
          >
            <ShieldCheck className="h-5 w-5 text-emerald-600 mr-2" />
            Approve & Publish
          </button>
          <button
            type="button"
            onClick={() => setDecision('rejected')}
            className={`flex items-center justify-center p-3.5 border-2 rounded-xl font-semibold transition ${
              decision === 'rejected'
                ? 'border-rose-600 bg-rose-50 text-rose-900 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
            }`}
          >
            <XCircle className="h-5 w-5 text-rose-600 mr-2" />
            Reject & Return
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
          Decision Notes / Instructions
        </label>
        <textarea
          rows={3}
          required={decision === 'rejected'}
          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder-slate-400"
          placeholder={
            decision === 'rejected'
              ? 'Please specify rejection reasons or requested edits (required)...'
              : 'Add any compliments or policy review reminders...'
          }
          value={decisionNotes}
          onChange={(e) => setDecisionNotes(e.target.value)}
        />
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
          disabled={loading || !decision}
          className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm flex items-center shadow transition"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Final Decision
        </button>
      </div>
    </form>
  );
}
