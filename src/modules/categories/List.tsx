'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Category, RetentionPolicy } from '@/data/types';
import CategoriesTable from '@/components/tables/CategoriesTable';
import { Plus, Loader2, FolderOpen, ShieldCheck, AlertCircle } from 'lucide-react';

export default function CategoriesList() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [catsRes, policiesRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/retention_policies'),
      ]);

      if (!catsRes.ok || !policiesRes.ok) {
        throw new Error('Could not pull categories structure data from API');
      }

      const catsData = await catsRes.json();
      const policiesData = await policiesRes.json();

      setCategories(Array.isArray(catsData) ? catsData : (catsData.data || []));
      setPolicies(Array.isArray(policiesData) ? policiesData : (policiesData.data || []));
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failure syncing document schemas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAll();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('API reported rejection deleting the designated category');
      }
      void fetchAll();
    } catch (err: any) {
      alert(err.message || 'Unable to delete category.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Categories & Classification</h1>
          <p className="text-sm text-slate-500 mt-1">
            Establish legal metadata categories. Create nested structures and configure legal constraints.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/categories/folders"
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition"
          >
            <FolderOpen className="h-4 w-4 mr-1.5 text-slate-500" />
            Manage Folder Structures
          </Link>
          <Link
            href="/categories/retention-policies"
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition"
          >
            <ShieldCheck className="h-4 w-4 mr-1.5 text-slate-500" />
            Retention Schedules
          </Link>
          <Link
            href="/categories/create"
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Category
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl flex items-start space-x-3 text-sm">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold">Unable to fetch categories</h4>
            <p className="text-xs text-amber-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-xs text-slate-500 mt-3 font-semibold">Synchronizing schemas...</p>
        </div>
      ) : (
        <CategoriesTable categories={categories} policies={policies} onDelete={handleDelete} />
      )}
    </div>
  );
}
