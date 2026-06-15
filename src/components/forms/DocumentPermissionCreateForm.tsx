'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/data/types';
import { Loader2 } from 'lucide-react';

interface DocumentPermissionCreateFormProps {
  documentId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function DocumentPermissionCreateForm({
  documentId,
  onSuccess,
  onCancel,
}: DocumentPermissionCreateFormProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [initLoading, setInitLoading] = useState(true);

  // Form states
  const [userId, setUserId] = useState('');
  const [roleKey, setRoleKey] = useState('');
  const [canView, setCanView] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [canApprove, setCanApprove] = useState(false);
  const [canDownload, setCanDownload] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(Array.isArray(data) ? data : (data.data || []));
        }
      } catch (err) {
        console.error('Failed to load users for assignment', err);
      } finally {
        setInitLoading(false);
      }
    }
    void loadUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId && !roleKey) {
      setError('Please assign this permission to either a specific User OR a general Role Group.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        document_id: documentId,
        user_id: userId || undefined,
        role_key: roleKey || undefined,
        can_view: canView,
        can_edit: canEdit,
        can_approve: canApprove,
        can_download: canDownload,
        created_at: new Date().toISOString(),
      };

      const res = await fetch('/api/document_permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to create permission tier');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Method 1: Bind to Specific User
          </label>
          <select
            className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
              if (e.target.value) setRoleKey(''); // Clear role if user picked
            }}
          >
            <option value="">-- No User restriction (Use Role instead) --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.first_name} {u.last_name} ({u.email})
              </option>
            ))}
          </select>
        </div>

        <div className="text-center font-bold text-slate-400 text-xs">- OR -</div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Method 2: Bind to Entire Role Group
          </label>
          <select
            className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
            value={roleKey}
            onChange={(e) => {
              setRoleKey(e.target.value);
              if (e.target.value) setUserId(''); // Clear user if role picked
            }}
          >
            <option value="">-- No Role restriction (Use User instead) --</option>
            <option value="admin">Administrator (Global Access)</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4 space-y-3">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
            Privilege Levels
          </label>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                id="perm_can_view"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                checked={canView}
                onChange={(e) => setCanView(e.target.checked)}
              />
              <label htmlFor="perm_can_view" className="ml-2 text-sm text-slate-700 font-medium">
                Can View details
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="perm_can_edit"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                checked={canEdit}
                onChange={(e) => setCanEdit(e.target.checked)}
              />
              <label htmlFor="perm_can_edit" className="ml-2 text-sm text-slate-700 font-medium">
                Can Edit details
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="perm_can_approve"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                checked={canApprove}
                onChange={(e) => setCanApprove(e.target.checked)}
              />
              <label htmlFor="perm_can_approve" className="ml-2 text-sm text-slate-700 font-medium">
                Can Approve document
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="perm_can_download"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                checked={canDownload}
                onChange={(e) => setCanDownload(e.target.checked)}
              />
              <label htmlFor="perm_can_download" className="ml-2 text-sm text-slate-700 font-medium">
                Can Download file
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>Grant Privileges</span>
        </button>
      </div>
    </form>
  );
}
