'use client';

import React, { useState, useEffect } from 'react';
import { Approval, Document, User } from '@/data/types';
import ApprovalsTable from '@/components/tables/ApprovalsTable';
import ApprovalCreateForm from '@/components/forms/ApprovalCreateForm';
import { Loader2, Plus, RefreshCw, Layers, ShieldCheck, MailWarning, Clock } from 'lucide-react';
import { useSession } from '@/hooks/useSession';

export default function ApprovalsListModule() {
  const { user } = useSession();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter/Tabs
  const [activeTab, setActiveTab] = useState<'assigned' | 'requested' | 'all'>('assigned');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal create workflow state
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [appRes, docRes, userRes] = await Promise.all([
        fetch('/api/approvals').then((r) => r.json()),
        fetch('/api/documents').then((r) => r.json()),
        fetch('/api/users').then((r) => r.json()),
      ]);

      setApprovals(Array.isArray(appRes) ? appRes : appRes.data || []);
      setDocuments(Array.isArray(docRes) ? docRes : docRes.data || []);
      setUsers(Array.isArray(userRes) ? userRes : userRes.data || []);
    } catch (err: any) {
      console.error(err);
      setError('Could not load approvals from server ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  // Filter strategy
  const filteredApprovals = approvals.filter((app) => {
    // 1. Tab segmenting
    if (activeTab === 'assigned') {
      if (app.assigned_to_user_id !== user?.userId) return false;
    } else if (activeTab === 'requested') {
      if (app.requested_by_user_id !== user?.userId) return false;
    }

    // 2. Text Search
    if (searchQuery) {
      const doc = documents.find((d) => d.id === app.document_id);
      const docTitle = doc?.title?.toLowerCase() || '';
      const notes = app.decision_notes?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      return docTitle.includes(query) || notes.includes(query);
    }

    return true;
  });

  const aggregatePendingCount = approvals.filter(
    (a) => a.assigned_to_user_id === user?.userId && a.status === 'pending'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Workflow Approvals
          </h1>
          <p className="text-sm text-slate-500">
            Audit and approve internal organization documents to verify digital compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => void loadData()}
            className="p-2 border border-slate-250 text-slate-600 hover:bg-slate-50 rounded-lg transition"
            title="Refresh Ledger"
          >
            <RefreshCw className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm hover:shadow transition gap-1.5 focus:outline-none"
          >
            <Plus className="h-4 w-4" />
            Launch Validation Route
          </button>
        </div>
      </div>

      {/* Aggregate Widgets row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center space-x-3.5 shadow-sm">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Awaiting Your Decision
            </p>
            <p className="text-xl font-extrabold text-slate-900">{aggregatePendingCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center space-x-3.5 shadow-sm">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              System Wide Handled
            </p>
            <p className="text-xl font-extrabold text-slate-900">
              {approvals.filter((a) => a.status === 'completed').length}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center space-x-3.5 shadow-sm">
          <div className="p-2.5 bg-slate-50 text-slate-600 rounded-lg border border-slate-150">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Recorded Lines
            </p>
            <p className="text-xl font-extrabold text-slate-900">{approvals.length}</p>
          </div>
        </div>
      </div>

      {/* Filter / Search tabs bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg self-start">
            <button
              onClick={() => setActiveTab('assigned')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                activeTab === 'assigned'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Assigned to Me ({approvals.filter((a) => a.assigned_to_user_id === user?.userId).length})
            </button>
            <button
              onClick={() => setActiveTab('requested')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                activeTab === 'requested'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              LODGED BY ME ({approvals.filter((a) => a.requested_by_user_id === user?.userId).length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Runs ({approvals.length})
            </button>
          </div>

          <div className="w-full sm:max-w-xs">
            <input
              type="text"
              placeholder="Search by doc title..."
              className="w-full px-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-55 bg-rose-50 border border-rose-250 text-rose-700 rounded-lg text-sm flex items-center gap-2">
            <MailWarning className="h-4 w-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            <span className="text-sm font-medium text-slate-500">Querying cryptographic records...</span>
          </div>
        ) : (
          <ApprovalsTable approvals={filteredApprovals} documents={documents} users={users} />
        )}
      </div>

      {/* Creation workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl border border-slate-350 shadow-2xl p-6 w-full max-w-lg relative animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Initiate Policy Review</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-slate-50 rounded text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <ApprovalCreateForm
              onSuccess={() => {
                setShowCreateModal(false);
                void loadData();
              }}
              onCancel={() => setShowCreateModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
