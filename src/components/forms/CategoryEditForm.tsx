'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { Category, RetentionPolicy } from '@/data/types';
import { Loader2, Save } from 'lucide-react';

interface CategoryEditFormProps {
  categoryId: string;
  onSuccess?: (id: string) => void;
  onCancel?: () => void;
}

export default function CategoryEditForm({ categoryId, onSuccess, onCancel }: CategoryEditFormProps) {
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
  const [createdAt, setCreatedAt] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFormDetails() {
      try {
        const [catRes, policiesRes] = await Promise.all([
          fetch(`/api/categories/${categoryId}`),
          fetch('/api/retention_policies'),
        ]);

        if (policiesRes.ok) {
          const policyData = await policiesRes.json();
          setPolicies(Array.isArray(policyData) ? policyData : (policyData.data || []));
        }

        if (catRes.ok) {
          const cat = (await catRes.json()) as Category;
          setName(cat.name || '');
          setCode(cat.code || '');
          setDescription(cat.description || '');
          setDefaultRetentionPolicyId(cat.default_retention_policy_id || '');
          setIsActive(cat.is_active !== false);
          setCreatedAt(cat.created_at || new Date().toISOString());
        } else {
          setError('Could not view category settings or you have insufficient permissions.');
        }
      } catch (err) {
        console.error('Failed to load category details', err);
        setError('Failed to fetch details for category.');
      } finally {
        setInitLoading(false);
      }
    }
    if (categoryId) {
      void loadFormDetails();
    }
  }, [categoryId]);

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
        description: description.trim() || null,
        default_retention_policy_id: defaultRetentionPolicyId || null,
        is_active: isActive,
        created_at: createdAt,
        updated_at: new Date().toISOString(),
      };

      const res = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to update category');
      }

      if (onSuccess) {
        onSuccess(categoryId);
      } else {
        refreshSession();
        router.push('/categories');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during category update.');
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-6 space-y-2">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        <span className="text-sm text-slate-500">Retrieving info...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-200">
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
            placeholder="e.g. Finance"
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
            placeholder="e.g. FIN"
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
          placeholder="Enter a helpful description of this category..."
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
            <span className="text-sm font-semibold text-slate-700">Active and available for tags</span>
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
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Category
        </button>
      </div>
    </form>
  );
}
