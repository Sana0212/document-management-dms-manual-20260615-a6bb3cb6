'use client';

import React from 'react';
import Link from 'next/link';
import { Category, RetentionPolicy } from '@/data/types';
import { Eye, Edit2, Trash2 } from 'lucide-react';

interface CategoriesTableProps {
  categories: Category[];
  policies: RetentionPolicy[];
  onDelete?: (id: string) => void;
}

export default function CategoriesTable({ categories, policies, onDelete }: CategoriesTableProps) {
  const getPolicyName = (policyId?: string) => {
    if (!policyId) return 'None (Indefinite)';
    const policy = policies.find((p) => p.id === policyId);
    return policy ? `${policy.name} (${policy.duration_value} ${policy.duration_unit})` : 'Unknown Policy';
  };

  if (!categories || categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-white">
        <span className="text-4xl text-slate-300 mb-3">📁</span>
        <h3 className="text-sm font-semibold text-slate-900 mb-1">No Categories Found</h3>
        <p className="text-xs text-slate-500 text-center max-w-sm mb-4">
          Categories define business groups or divisions such as HR, Finance, and Legal to categorize your digital assets.
        </p>
        <Link
          href="/categories/create"
          className="inline-flex items-center px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow transition"
        >
          Create New Category
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
            <th className="py-3 px-4">Code</th>
            <th className="py-3 px-3">Description</th>
            <th className="py-3 px-4">Default Retention Policy</th>
            <th className="py-3 px-4 text-center">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-800">
          {categories.map((category) => (
            <tr key={category.id} className="hover:bg-slate-50/55 transition-colors">
              <td className="py-3 px-4 font-semibold text-slate-900">{category.name}</td>
              <td className="py-3 px-4">
                <span className="px-2 py-0.5 text-xs font-mono font-medium rounded bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                  {category.code}
                </span>
              </td>
              <td className="py-3 px-3 text-slate-500 text-xs max-w-xs truncate" title={category.description}>
                {category.description || <span className="italic text-slate-300">No description</span>}
              </td>
              <td className="py-3 px-4 text-slate-600 text-xs">
                {getPolicyName(category.default_retention_policy_id)}
              </td>
              <td className="py-3 px-4 text-center">
                {category.is_active ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-55 text-emerald-700 border border-emerald-100">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                    Inactive
                  </span>
                )}
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end space-x-1">
                  <Link
                    href={`/categories/${category.id}`}
                    title="View details"
                    className="p-1 px-2 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded transition"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/categories/${category.id}/edit`}
                    title="Edit category"
                    className="p-1 px-2 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 rounded transition"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Link>
                  {onDelete && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete category "${category.name}"?`)) {
                          onDelete(category.id || '');
                        }
                      }}
                      title="Delete category"
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
