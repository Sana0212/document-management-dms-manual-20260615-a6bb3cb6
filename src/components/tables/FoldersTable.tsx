'use client';

import React from 'react';
import Link from 'next/link';
import { Folder, Category } from '@/data/types';
import { Eye, Edit2, Trash2 } from 'lucide-react';

interface FoldersTableProps {
  folders: Folder[];
  categories: Category[];
  onDelete?: (id: string) => void;
}

export default function FoldersTable({ folders, categories, onDelete }: FoldersTableProps) {
  const getCategoryCode = (catId: string) => {
    const matched = categories.find((c) => c.id === catId);
    return matched ? matched.code : 'UNKNOWN';
  };

  const getParentFolderName = (parentId?: string) => {
    if (!parentId) return <span className="text-slate-400 italic">None (Root)</span>;
    const matched = folders.find((f) => f.id === parentId);
    return matched ? matched.name : 'Unknown parent';
  };

  if (!folders || folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-white">
        <span className="text-4xl text-slate-300 mb-3">📁</span>
        <h3 className="text-sm font-semibold text-slate-900 mb-1">No Folders Found</h3>
        <p className="text-xs text-slate-500 text-center max-w-sm mb-4">
          Create sub-folders under parent categories to safely structure and compartmentalize actual digital records.
        </p>
        <Link
          href="/categories/folders/create"
          className="inline-flex items-center px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow transition"
        >
          Create New Folder
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50 text-slate-700 border-b border-slate-100 font-semibold text-xs tracking-wider uppercase">
            <th className="py-3 px-4">Name</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Parent folder</th>
            <th className="py-3 px-4">Virtual Filepath</th>
            <th className="py-3 px-4 text-center">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-800">
          {folders.map((folder) => (
            <tr key={folder.id} className="hover:bg-slate-50/55 transition-colors">
              <td className="py-3 px-4 font-semibold text-slate-900">{folder.name}</td>
              <td className="py-3 px-4">
                <span className="px-2 py-0.5 text-xs font-mono font-medium rounded bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                  {getCategoryCode(folder.category_id)}
                </span>
              </td>
              <td className="py-3 px-4 text-slate-600 text-xs">
                {getParentFolderName(folder.parent_folder_id)}
              </td>
              <td className="py-3 px-4 font-mono text-slate-500 text-xs">
                {folder.path}
              </td>
              <td className="py-3 px-4 text-center">
                {folder.is_active ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-55 text-emerald-700 border border-emerald-100">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                    Inactive
                  </span>
                )}
              </td>
              <td className="py-3 px-4 text-right overflow-visible">
                <div className="flex items-center justify-end space-x-1">
                  <Link
                    href={`/categories/folders/${folder.id}`}
                    title="View folder structure details"
                    className="p-1 px-2 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded transition"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/categories/folders/${folder.id}/edit`}
                    title="Edit folder mapping"
                    className="p-1 px-2 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 rounded transition"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Link>
                  {onDelete && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete folder "${folder.name}"? This might disconnect subdocuments.`)) {
                          onDelete(folder.id || '');
                        }
                      }}
                      title="Destroy structure entry"
                      className="p-1 px-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
