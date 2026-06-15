'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Folder, Category } from '@/data/types';
import FoldersTable from '@/components/tables/FoldersTable';
import { Plus, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export default function FoldersListingPage() {
  const router = useRouter();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFoldersAndCats = async () => {
    setLoading(true);
    setError(null);
    try {
      const [foldRes, catRes] = await Promise.all([
        fetch('/api/folders'),
        fetch('/api/categories'),
      ]);

      if (!foldRes.ok || !catRes.ok) {
        throw new Error('API failure returning folders structures.');
      }

      const foldersData = await foldRes.json();
      const categoriesData = await catRes.json();

      setFolders(Array.isArray(foldersData) ? foldersData : (foldersData.data || []));
      setCategories(Array.isArray(categoriesData) ? categoriesData : (categoriesData.data || []));
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Error occurred downloading folder directory tables.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchFoldersAndCats();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/folders/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Could not delete selected folder map.');
      }
      void fetchFoldersAndCats();
    } catch (err: any) {
      alert(err.message || 'Error deleting folder structure.');
    }
  };

  return (
    <div className="space-y-6 container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Link href="/categories" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Folder Directories</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1 ml-9">
            Build clean paths mapping out where files of different categories are safely categorized.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href="/categories/folders/create"
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Create Folder Map
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl flex items-start space-x-3 text-sm">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold">Sync failure</h4>
            <p className="text-xs text-amber-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-xs text-slate-500 mt-3 font-semibold">Listing structured folder layouts...</p>
        </div>
      ) : (
        <FoldersTable folders={folders} categories={categories} onDelete={handleDelete} />
      )}
    </div>
  );
}
