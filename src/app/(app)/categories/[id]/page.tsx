'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Category, Folder, RetentionPolicy } from '@/data/types';
import { ChevronLeft, Edit2, Loader2, Folder as FoldersIcon, Calendar, CheckSquare } from 'lucide-react';

export default function CategoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [retentionPolicy, setRetentionPolicy] = useState<RetentionPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAllDetails() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const catRes = await fetch(`/api/categories/${id}`);
        if (!catRes.ok) {
          throw new Error('This category record does not exist or has been removed.');
        }
        const catData = (await catRes.json()) as Category;
        setCategory(catData);

        // Fetch directories mapped under this category
        const foldersRes = await fetch('/api/folders');
        if (foldersRes.ok) {
          const rawFolders = await foldersRes.json();
          const list = Array.isArray(rawFolders) ? rawFolders : (rawFolders.data || []);
          setFolders(list.filter((f: Folder) => f.category_id === id));
        }

        // Fetch retention policy
        if (catData.default_retention_policy_id) {
          const policyRes = await fetch(`/api/retention_policies/${catData.default_retention_policy_id}`);
          if (policyRes.ok) {
            const polData = await policyRes.json();
            setRetentionPolicy(polData);
          }
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error occurred fetching database records.');
      } finally {
        setLoading(false);
      }
    }
    void loadAllDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="text-sm font-semibold text-slate-500">Retrieving categorization indexes...</span>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl space-y-2 text-sm">
          <h4 className="font-bold">Retrieval Failure</h4>
          <p>{error || 'Category record lookup returned invalid response.'}</p>
          <div className="pt-2">
            <Link href="/categories" className="text-xs font-semibold text-indigo-600 hover:underline">
              &larr; Back to configuration directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <Link
          href="/categories"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ChevronLeft className="h-4 w-4 mr-0.5" />
          Back to categories
        </Link>
        <Link
          href={`/categories/${category.id}/edit`}
          className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
        >
          <Edit2 className="h-3 w-3 mr-1.5" />
          Edit Category
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Header Hero segment */}
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold bg-indigo-100 text-indigo-800 rounded px-2 py-0.5 border border-indigo-200 uppercase">
                {category.code}
              </span>
              <h1 className="text-xl font-bold text-slate-900">{category.name}</h1>
            </div>
            <p className="text-xs text-slate-500 max-w-xl">
              {category.description || 'No formal policy description submitted.'}
            </p>
          </div>

          <div>
            {category.is_active ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Active tag
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                Inactive
              </span>
            )}
          </div>
        </div>

        {/* Technical definitions list */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-sm">
          {/* Default Policies */}
          <div className="p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
              <Calendar className="h-4 w-4 mr-1.5 text-indigo-500" />
              Retention Defaults
            </h3>
            {retentionPolicy ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-800">{retentionPolicy.name}</span>
                  <span className="text-xs text-slate-500 font-medium">({retentionPolicy.code})</span>
                </div>
                <p className="text-xs text-slate-500">
                  {retentionPolicy.description || 'Ensures strict archival triggers.'}
                </p>
                <div className="flex font-mono text-[10px] text-slate-600 mt-2 bg-white p-2 rounded border border-slate-100 justify-between">
                  <span>Duration span:</span>
                  <span className="font-semibold text-slate-800">
                    {retentionPolicy.duration_value} {retentionPolicy.duration_unit}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-indigo-50/50 border border-dashed border-indigo-150 text-indigo-900 text-xs">
                This category falls back to <strong>Indefinite Storage & Holds Allowed</strong> by default since no specific schedule is selected.
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
              <CheckSquare className="h-4 w-4 mr-1.5 text-indigo-500" />
              System Properties
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500">Record Created</span>
                <span className="font-mono text-slate-700">
                  {category.created_at ? new Date(category.created_at).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500">Last Scheme Update</span>
                <span className="font-mono text-slate-700">
                  {category.updated_at ? new Date(category.updated_at).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Folders Section */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-md font-bold text-slate-900 flex items-center">
            <FoldersIcon className="h-5 w-5 mr-2 text-indigo-500" />
            Mapped Folders ({folders.length})
          </h2>
          <Link
            href="/folders/new"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            + Create New Folder
          </Link>
        </div>

        {folders.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center border border-dashed border-slate-200 rounded-lg">
            No active storage folders have been initialized under this retention division yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {folders.map((f) => (
              <div
                key={f.id}
                className="p-3 border border-slate-200 rounded-lg hover:border-indigo-300 transition flex items-center justify-between"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-slate-800 text-sm">{f.name}</p>
                  <p className="text-xs text-slate-500 font-mono">Path: {f.path}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                    f.is_active ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-slate-50 border-slate-150 text-slate-600'
                  }`}>
                    {f.is_active ? 'Active' : 'Archived'}
                  </span>
                  <Link
                    href={`/folders/${f.id}/edit`}
                    className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded transition"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
