'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Folder, Category } from '@/data/types';
import { ChevronLeft, Edit2, Loader2, Calendar, HardDrive, LayoutTemplate } from 'lucide-react';

export default function FolderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [folder, setFolder] = useState<Folder | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [parentFolder, setParentFolder] = useState<Folder | null>(null);
  const [subFolders, setSubFolders] = useState<Folder[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFolderData() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const folderRes = await fetch(`/api/folders/${id}`);
        if (!folderRes.ok) {
          throw new Error('This folder structure was not found in the DMS index definitions.');
        }
        const currentFolder = (await folderRes.json()) as Folder;
        setFolder(currentFolder);

        // Fetch parent details if configured
        if (currentFolder.parent_folder_id) {
          const parentRes = await fetch(`/api/folders/${currentFolder.parent_folder_id}`);
          if (parentRes.ok) {
            setParentFolder(await parentRes.json());
          }
        }

        // Fetch category specifications
        const catRes = await fetch(`/api/categories/${currentFolder.category_id}`);
        if (catRes.ok) {
          setCategory(await catRes.json());
        }

        // Fetch other folders to detect children
        const allRes = await fetch('/api/folders');
        if (allRes.ok) {
          const foldersList = await allRes.json();
          const items = Array.isArray(foldersList) ? foldersList : (foldersList.data || []);
          setSubFolders(items.filter((f: Folder) => f.parent_folder_id === id));
        }

      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error occurred looking up structured folder specifications.');
      } finally {
        setLoading(false);
      }
    }
    void loadFolderData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="text-sm font-semibold text-slate-500">Checking indexing maps...</span>
      </div>
    );
  }

  if (error || !folder) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl space-y-2 text-sm">
          <h4 className="font-bold">Retrieval Failed</h4>
          <p>{error || 'Folder map query invalid.'}</p>
          <div className="pt-2">
            <Link href="/categories/folders" className="text-xs font-semibold text-indigo-600 hover:underline">
              &larr; Back to maps index
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
          href="/categories/folders"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ChevronLeft className="h-4 w-4 mr-0.5" />
          Back to list
        </Link>
        <Link
          href={`/categories/folders/${folder.id}/edit`}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition shadow-sm"
        >
          <Edit2 className="h-3 w-3 mr-1.5" />
          Modify Folder Mapping
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Context info Header */}
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider px-2 py-0.5 rounded">
                Structure Node
              </span>
              <h1 className="text-xl font-bold text-slate-900">{folder.name}</h1>
            </div>
            <p className="font-mono text-xs text-slate-500">
              Virtual Calculated Path: {folder.path}
            </p>
          </div>

          <div>
            {folder.is_active ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Active for uploads
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                Archived / Closed
              </span>
            )}
          </div>
        </div>

        {/* Hierarchy parameters matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-sm">
          {/* Linked relationships */}
          <div className="p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
              <LayoutTemplate className="h-4 w-4 mr-1.5 text-indigo-500" />
              Hierarchy context
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Parent Category assignment</span>
                {category ? (
                  <Link
                    href={`/categories/${category.id}`}
                    className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:underline hover:text-indigo-800 mt-1"
                  >
                    {category.name} ({category.code})
                  </Link>
                ) : (
                  <span className="text-xs italic text-slate-400">No Category details uploaded</span>
                )}
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Direct parent folder directory</span>
                {parentFolder ? (
                  <Link
                    href={`/categories/folders/${parentFolder.id}`}
                    className="inline-flex items-center text-xs font-semibold text-slate-700 hover:underline mt-1"
                  >
                    {parentFolder.name} ({parentFolder.path})
                  </Link>
                ) : (
                  <span className="text-xs text-slate-500 italic">None (This folder sits directly at the category Root level)</span>
                )}
              </div>
            </div>
          </div>

          {/* Creation Audit log */}
          <div className="p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
              <Calendar className="h-4 w-4 mr-1.5 text-indigo-500" />
              Directory properties
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500">Record Created</span>
                <span className="font-mono text-slate-700">
                  {folder.created_at ? new Date(folder.created_at).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500">Last System Update</span>
                <span className="font-mono text-slate-700">
                  {folder.updated_at ? new Date(folder.updated_at).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-xs py-1">
                <span className="text-slate-500">Subfolders (Children)</span>
                <span className="font-semibold text-slate-700">
                  {subFolders.length} nested child node{subFolders.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nested folders breakdown chart */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center">
          <HardDrive className="h-5 w-5 mr-2 text-indigo-500" />
          Recursive Directories mapped inside {folder.name}
        </h2>

        {subFolders.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4 bg-slate-50 border border-slate-100 rounded-lg text-center">
            This directory currently contains no children folder maps.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {subFolders.map((sub) => (
              <div
                key={sub.id}
                className="p-3 bg-slate-50/75 border border-slate-200 rounded-lg flex items-center justify-between hover:bg-slate-50 transition"
              >
                <div>
                  <h4 className="text-xs font-semibold text-slate-800">{sub.name}</h4>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">{sub.path}</p>
                </div>
                <Link
                  href={`/categories/folders/${sub.id}`}
                  className="px-2 py-1 text-[10px] bg-white border border-slate-300 rounded font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Manage folder Map
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
