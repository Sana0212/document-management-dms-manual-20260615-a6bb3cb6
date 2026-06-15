'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from '@/hooks/useSession';
import DocumentsTable from '@/components/tables/DocumentsTable';
import { Document, Category, Folder, User } from '@/data/types';
import { Loader2, Plus, FileText, CheckCircle, Clock, Database } from 'lucide-react';

export default function DocumentsList() {
  const { user } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [docsRes, catsRes, foldersRes, usersRes] = await Promise.all([
        fetch('/api/documents').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/categories').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/folders').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/users').then((r) => (r.ok ? r.json() : [])),
      ]);

      setDocuments(Array.isArray(docsRes) ? docsRes : (docsRes.data || []));
      setCategories(Array.isArray(catsRes) ? catsRes : (catsRes.data || []));
      setFolders(Array.isArray(foldersRes) ? foldersRes : (foldersRes.data || []));
      setUsers(Array.isArray(usersRes) ? usersRes : (usersRes.data || []));
    } catch (err: any) {
      setError(err.message || 'Failed to sync with document repository.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAllData();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Could not delete the selected document.');
      }
      // Re-trigger fetch or filter local state
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Submit and create an approval request workflow
  const handleRequestApproval = async (id: string) => {
    try {
      const parentDoc = documents.find((doc) => doc.id === id);
      if (!parentDoc) return;

      // Find an Admin or Manager to send it to. In a larger setup, we pick dynamically.
      // For fallback/simplicity, we search users list for roles.
      const reviewer = users.find((u) => u.role_key === 'manager' || u.role_key === 'admin');
      if (!reviewer) {
        throw new Error('Could not find any Manager or Administrator assigned to authorize workflows in your department.');
      }

      const approvalPayload = {
        document_id: id,
        requested_by_user_id: user?.userId || '',
        assigned_to_user_id: reviewer.id,
        status: 'pending',
        due_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days due limit
      };

      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approvalPayload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Workflows server error');
      }

      const createdApproval = await res.json();

      // Trigger PUT on parent document list (status: pending, latest_approval_id)
      await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'pending',
          latest_approval_id: createdApproval.id,
        }),
      });

      // Reload
      await fetchAllData();
      alert('Approval workflow triggered successfully! Target manager notified.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
        <p className="text-slate-500 font-medium text-sm">Syncing with workspace storage...</p>
      </div>
    );
  }

  const draftsCount = documents.filter((d) => d.status === 'draft').length;
  const pendingCount = documents.filter((d) => d.status === 'pending').length;
  const activeCount = documents.filter((d) => d.status === 'approved').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
            <FileText className="h-6 w-6 text-teal-600" />
            Document Directory
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Structured workspace storage, compliance versions, and approval pipelines.
          </p>
        </div>

        {/* Create Document button if profile role allows it */}
        {user?.role !== 'viewer' && (
          <Link
            href="/documents/create"
            className="inline-flex items-center gap-2 bg-teal-600 text-white font-bold text-sm px-4/5 py-2 rounded-lg hover:bg-teal-700 transition shadow-sm px-4"
          >
            <Plus className="h-4 w-4" />
            Upload Document
          </Link>
        )}
      </div>

      {/* Aggregate Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none">Total Library</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{documents.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none">Sandbox Drafts</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{draftsCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Loader2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none">Pending Signature</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none">Active / Released</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{activeCount}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Main Table view */}
      <DocumentsTable
        documents={documents}
        categories={categories}
        folders={folders}
        users={users}
        onDelete={user?.role === 'admin' || user?.role === 'manager' ? handleDelete : undefined}
        onRequestApproval={user?.role !== 'viewer' ? handleRequestApproval : undefined}
      />
    </div>
  );
}
