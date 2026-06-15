'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { RetentionPolicy } from '@/data/types';
import { Loader2, FolderPlus } from 'lucide-react';

interface CategoryCreateFormProps {
  onSuccess?: (id: string) => void;
  onCancel?: () => void;
}

export default function CategoryCreateForm({ onSuccess, onCancel }: CategoryCreateFormProps) {
  const router = useRouter();
  const { user, refreshSession } = useSession();

  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [defaultRetentionPolicyId, setDefaultRetentionPolicyId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPolicies() {
      try {
        const res = await fetch('/api/retention_policies');
        if (res.ok) {
          const data = await res.json();
          setPolicies(Array.isArray(data) ? data : (data.data || []));
        }
      } catch (err) {
        console.error('Failed to load retention policies', err);
      } finally {
        setInitLoading(false);
      }
    }
    void loadPolicies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }
    if (!code.trim()) {
      setError('Category custom code is required (e.g. HR, FIN).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        default_retention_policy_id: defaultRetentionPolicyId || null,
        is_active: isActive,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to create category');
      }

      const data = await res.json();
      if (onSuccess) {
        onSuccess(data.id);
      } else {
        refreshSession();
        router.push('/categories');
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
        <span className="text-sm text-slate-500">Loading form content...</span>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Category Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Human Resources"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Code / Abbreviation *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. HR"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
          Description
        </label>
        <textarea
          rows={3}
          placeholder="Enter a helpful description explaining what type of documents go into this category..."
          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Default Retention Policy
          </label>
          <select
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={defaultRetentionPolicyId}
            onChange={(e) => setDefaultRetentionPolicyId(e.target.value)}
          >
            <option value="">-- No policy (Keep Indefinitely) --</option>
            {policies.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.duration_value} {p.duration_unit})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center pt-6">
          <label className="inline-flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 bg-white border-slate-300 text-indigo-600 rounded focus:ring-indigo-500"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <span className="text-sm font-semibold text-slate-700">Active and available for document tags</span>
          </label>
        </div>
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
          Create Category
        </button>
      </div>
    </form>
  );
}
