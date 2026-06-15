'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { Category, Folder } from '@/data/types';
import { Loader2, FolderPlus } from 'lucide-react';

interface FolderCreateFormProps {
  onSuccess?: (id: string) => void;
  onCancel?: () => void;
}

export default function FolderCreateForm({ onSuccess, onCancel }: FolderCreateFormProps) {
  const router = useRouter();
  const { user, refreshSession } = useSession();

  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  // Core entities
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentFolders, setParentFolders] = useState<Folder[]>([]);

  // Form states
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [parentFolderId, setParentFolderId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFormOptionData() {
      try {
        const [catRes, foldRes] = await Promise.all([
          fetch('/api/categories').then((r) => r.ok ? r.json() : []),
          fetch('/api/folders').then((r) => r.ok ? r.json() : []),
        ]);

        const cats = Array.isArray(catRes) ? catRes : (catRes.data || []);
        const folders = Array.isArray(foldRes) ? foldRes : (foldRes.data || []);

        setCategories(cats.filter((c: Category) => c.is_active));
        setParentFolders(folders.filter((f: Folder) => f.is_active));
      } catch (err) {
        console.error('Failed to load relations for FolderForm', err);
      } finally {
        setInitLoading(false);
      }
    }
    void loadFormOptionData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Folder name is required.');
      return;
    }
    if (!categoryId) {
      setError('A category selection is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Find parent folder path if selected
      let parentPath = '';
      if (parentFolderId) {
        const parent = parentFolders.find(f => f.id === parentFolderId);
        if (parent) {
          parentPath = parent.path;
        }
      }

      // Constructed folder path
      const currentPath = parentPath ? `${parentPath}/${name.trim()}` : `/${name.trim()}`;

      const payload = {
        name: name.trim(),
        category_id: categoryId,
        parent_folder_id: parentFolderId || null,
        path: currentPath,
        is_active: isActive,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to create folder');
      }

      const data = await res.json();
      if (onSuccess) {
        onSuccess(data.id);
      } else {
        refreshSession();
        router.push('/categories/folders');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-6 space-y-2">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        <span className="text-sm text-slate-500">Loading classifications...</span>
      </div>
    );
  }

  // Filter possible parent folders to matches select category to keep structure neat
  const filteredParentFolders = parentFolders.filter(f => f.category_id === categoryId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-xs font-medium rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
          Folder Name *
        </label>
        <input
          type="text"
          required
          placeholder="e.g. Q4 Invoices"
          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Category *
          </label>
          <select
            required
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setParentFolderId(''); // Reset parent if category switches
            }}
          >
            <option value="">-- Choose Category --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Parent Folder (Optional)
          </label>
          <select
            disabled={!categoryId}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            value={parentFolderId}
            onChange={(e) => setParentFolderId(e.target.value)}
          >
            <option value="">-- Root Level Folder --</option>
            {filteredParentFolders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.path || f.name}
              </option>
            ))}
          </select>
          {!categoryId && (
            <span className="text-[10px] text-slate-400 mt-0.5 block">Select category to choose parent folders</span>
          )}
        </div>
      </div>

      <div className="flex items-center pt-2">
        <label className="inline-flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            className="h-4 w-4 bg-white border-slate-300 text-indigo-600 rounded focus:ring-indigo-500"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <span className="text-sm font-semibold text-slate-700">Folder active and open for uploads</span>
        </label>
      </div>

      <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
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
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm flex items-center shadow-sm hover:shadow transition disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FolderPlus className="mr-2 h-4 w-4" />
          )}
          Create Folder
        </button>
      </div>
    </form>
  );
}
