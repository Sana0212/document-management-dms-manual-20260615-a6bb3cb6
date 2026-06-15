'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface DocumentPermissionEditFormProps {
  permissionId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function DocumentPermissionEditForm({
  permissionId,
  onSuccess,
  onCancel,
}: DocumentPermissionEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  // Form states
  const [canView, setCanView] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [canApprove, setCanApprove] = useState(false);
  const [canDownload, setCanDownload] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPermission() {
      try {
        const res = await fetch(`/api/document_permissions/${permissionId}`);
        if (!res.ok) throw new Error('Could not fetch permission rules');
        const data = await res.json();
        if (data) {
          setCanView(data.can_view !== false);
          setCanEdit(data.can_edit || false);
          setCanApprove(data.can_approve || false);
          setCanDownload(data.can_download !== false);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load permission detail');
      } finally {
        setInitLoading(false);
      }
    }
    void loadPermission();
  }, [permissionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        can_view: canView,
        can_edit: canEdit,
        can_approve: canApprove,
        can_download: canDownload,
      };

      const res = await fetch(`/api/document_permissions/${permissionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to update authorization record');
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
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
            Adjust Active Privileges
          </label>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                id="edit_perm_can_view"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                checked={canView}
                onChange={(e) => setCanView(e.target.checked)}
              />
              <label htmlFor="edit_perm_can_view" className="ml-2 text-sm text-slate-700 font-medium">
                Can View details
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="edit_perm_can_edit"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                checked={canEdit}
                onChange={(e) => setCanEdit(e.target.checked)}
              />
              <label htmlFor="edit_perm_can_edit" className="ml-2 text-sm text-slate-700 font-medium">
                Can Edit details
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="edit_perm_can_approve"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                checked={canApprove}
                onChange={(e) => setCanApprove(e.target.checked)}
              />
              <label htmlFor="edit_perm_can_approve" className="ml-2 text-sm text-slate-700 font-medium">
                Can Approve document
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="edit_perm_can_download"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                checked={canDownload}
                onChange={(e) => setCanDownload(e.target.checked)}
              />
              <label htmlFor="edit_perm_can_download" className="ml-2 text-sm text-slate-700 font-medium">
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
          <span>Update Privileges</span>
        </button>
      </div>
    </form>
  );
}
