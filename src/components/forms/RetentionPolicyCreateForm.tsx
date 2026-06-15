'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { Loader2, PlusCircle } from 'lucide-react';

interface RetentionPolicyCreateFormProps {
  onSuccess?: (id: string) => void;
  onCancel?: () => void;
}

export default function RetentionPolicyCreateForm({ onSuccess, onCancel }: RetentionPolicyCreateFormProps) {
  const router = useRouter();
  const { refreshSession } = useSession();

  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [durationValue, setDurationValue] = useState<number>(1);
  const [durationUnit, setDurationUnit] = useState('years');
  const [legalHoldAllowed, setLegalHoldAllowed] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Policy name is required.');
      return;
    }
    if (!code.trim()) {
      setError('Policy code is required.');
      return;
    }
    if (durationValue < 1) {
      setError('Duration must be greater than or equal to 1.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        duration_value: Number(durationValue),
        duration_unit: durationUnit,
        legal_hold_allowed: legalHoldAllowed,
        is_default: isDefault,
        is_active: isActive,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const res = await fetch('/api/retention_policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to create retention policy');
      }

      const data = await res.json();
      if (onSuccess) {
        onSuccess(data.id);
      } else {
        refreshSession();
        router.push('/categories/retention-policies');
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Policy Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. 7-Year Tax Audits"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Policy Code *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. TAX7Y"
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
          rows={2}
          placeholder="e.g. Retention standard for general corporate finance history and files."
          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Duration *
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              min="1"
              required
              className="w-1/3 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={durationValue}
              onChange={(e) => setDurationValue(Number(e.target.value))}
            />
            <select
              className="w-2/3 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={durationUnit}
              onChange={(e) => setDurationUnit(e.target.value)}
            >
              <option value="days">Days</option>
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col justify-end space-y-2 pt-2 md:pt-0">
          <label className="inline-flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 bg-white border-slate-300 text-indigo-600 rounded focus:ring-indigo-500"
              checked={legalHoldAllowed}
              onChange={(e) => setLegalHoldAllowed(e.target.checked)}
            />
            <span className="text-sm font-semibold text-slate-700">Allow legal holds on documents</span>
          </label>

          <label className="inline-flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 bg-white border-slate-300 text-indigo-600 rounded focus:ring-indigo-500"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
            <span className="text-sm font-semibold text-slate-700">Set as default fallback policy</span>
          </label>
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
          <span className="text-sm font-semibold text-slate-700">Policy active and in effect</span>
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
            <PlusCircle className="mr-2 h-4 w-4" />
          )}
          Create Policy
        </button>
      </div>
    </form>
  );
}
