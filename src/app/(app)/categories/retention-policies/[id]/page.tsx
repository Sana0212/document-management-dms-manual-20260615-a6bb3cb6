'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { RetentionPolicy, Category } from '@/data/types';
import { ChevronLeft, Edit2, Loader2, Calendar, Scale, FolderSync, Info } from 'lucide-react';

export default function RetentionPolicyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [policy, setPolicy] = useState<RetentionPolicy | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPolicySpecifications() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const policyRes = await fetch(`/api/retention_policies/${id}`);
        if (!policyRes.ok) {
          throw new Error('This retention schedule does not exist or has been deleted.');
        }
        setPolicy(await policyRes.json());

        // Fetch categories to see who uses this policy
        const catsRes = await fetch('/api/categories');
        if (catsRes.ok) {
          const rawCats = await catsRes.json();
          const items = Array.isArray(rawCats) ? rawCats : (rawCats.data || []);
          setCategories(items.filter((c: Category) => c.default_retention_policy_id === id));
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error occurred looking up policy details.');
      } finally {
        setLoading(false);
      }
    }
    void loadPolicySpecifications();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="text-sm font-semibold text-slate-500">Retrieving schedule rules...</span>
      </div>
    );
  }

  if (error || !policy) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl space-y-2 text-sm">
          <h4 className="font-bold">Retrieval Failed</h4>
          <p>{error || 'Policy query returned empty dataset.'}</p>
          <div className="pt-2">
            <Link href="/categories/retention-policies" className="text-xs font-semibold text-indigo-600 hover:underline">
              &larr; Back to policies index
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 container mx-auto px-4 py-8">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <Link
          href="/categories/retention-policies"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ChevronLeft className="h-4 w-4 mr-0.5" />
          Back to list
        </Link>
        <Link
          href={`/categories/retention-policies/${policy.id}/edit`}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition shadow-sm"
        >
          <Edit2 className="h-3 w-3 mr-1.5" />
          Modify Retention Policy
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Info header */}
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 rounded px-2 py-0.5 border border-indigo-200 uppercase tracking-widest">
                {policy.code}
              </span>
              <h1 className="text-xl font-bold text-slate-900">{policy.name}</h1>
            </div>
            <p className="text-xs text-slate-500 max-w-xl">
              {policy.description || 'No direct description was registered.'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {policy.is_default && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-75 border border-indigo-200">
                Default schedule
              </span>
            )}
            {policy.is_active ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Active schedule
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                Inactive / Suspended
              </span>
            )}
          </div>
        </div>

        {/* Matrix grids layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-sm">
          {/* Rules definitions */}
          <div className="p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
              <Scale className="h-4 w-4 mr-1.5 text-indigo-500" />
              Retention limits & flags
            </h3>
            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-600">Calculated Retention span:</span>
                <span className="font-mono text-indigo-700 bg-white px-2 py-0.5 border border-slate-200 rounded">
                  {policy.duration_value} {policy.duration_unit}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-500">Legal Holds Allowed</span>
                <span className={`font-semibold ${policy.legal_hold_allowed ? 'text-indigo-600' : 'text-slate-450'}`}>
                  {policy.legal_hold_allowed ? 'YES (Hold locks permitted)' : 'NO (Forced purging)'}
                </span>
              </div>
            </div>
          </div>

          {/* Creation log dates */}
          <div className="p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
              <Calendar className="h-4 w-4 mr-1.5 text-indigo-500" />
              Meta metrics
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500">Created Epoch</span>
                <span className="font-mono text-slate-705">
                  {policy.created_at ? new Date(policy.created_at).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500">Last Rules Sync</span>
                <span className="font-mono text-slate-705">
                  {policy.updated_at ? new Date(policy.updated_at).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-xs py-1">
                <span className="text-slate-500">Associated Categories</span>
                <span className="font-semibold text-slate-708">
                  {categories.length} custom categories
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dependent categories schedule */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center">
          <FolderSync className="h-5 w-5 mr-2 text-indigo-55" />
          Active categories linked to this policy
        </h2>

        {categories.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4 bg-slate-50 border border-slate-100 rounded-lg text-center">
            This schedule is not currently assigned as active default fallback on any category classifications.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-3 bg-slate-50/75 border border-slate-200 rounded-lg flex items-center justify-between hover:bg-slate-50 transition"
              >
                <div>
                  <h4 className="text-xs font-semibold text-slate-800">{cat.name}</h4>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">Code: {cat.code}</p>
                </div>
                <Link
                  href={`/categories/${cat.id}`}
                  className="px-2 py-1 text-[10px] font-semibold bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 transition"
                >
                  View Category Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
