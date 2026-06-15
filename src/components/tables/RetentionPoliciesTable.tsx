'use client';

import React from 'react';
import Link from 'next/link';
import { RetentionPolicy } from '@/data/types';
import { Eye, Edit2, Trash2, Check, X } from 'lucide-react';

interface RetentionPoliciesTableProps {
  policies: RetentionPolicy[];
  onDelete?: (id: string) => void;
}

export default function RetentionPoliciesTable({ policies, onDelete }: RetentionPoliciesTableProps) {
  if (!policies || policies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-white">
        <span className="text-4xl text-slate-300 mb-3">🛡️</span>
        <h3 className="text-sm font-semibold text-slate-900 mb-1">No Active Policies found</h3>
        <p className="text-xs text-slate-500 text-center max-w-sm mb-4">
          Retention rules enforce structured intervals before folders or standard contents are flagged for archiving or deletion.
        </p>
        <Link
          href="/categories/retention-policies/create"
          className="inline-flex items-center px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow transition"
        >
          Create first Retention Policy
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50 text-slate-700 border-b border-slate-100 font-semibold text-xs tracking-wider uppercase">
            <th className="py-3 px-4">Policy Name</th>
            <th className="py-3 px-4">Unique Code</th>
            <th className="py-3 px-4">Retention Span</th>
            <th className="py-3 px-4 text-center">Legal hold</th>
            <th className="py-3 px-4 text-center">Default Fallback</th>
            <th className="py-3 px-4 text-center">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-800">
          {policies.map((policy) => (
            <tr key={policy.id} className="hover:bg-slate-50/55 transition-colors">
              <td className="py-3 px-4 font-semibold text-slate-900">
                {policy.name}
              </td>
              <td className="py-3 px-4">
                <span className="px-2 py-0.5 text-xs font-mono font-medium rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                  {policy.code}
                </span>
              </td>
              <td className="py-3 px-4 text-xs font-medium text-slate-600">
                {policy.duration_value} {policy.duration_unit}
              </td>
              <td className="py-3 px-4 text-center">
                {policy.legal_hold_allowed ? (
                  <Check className="h-4 w-4 mx-auto text-indigo-600" />
                ) : (
                  <X className="h-4 w-4 mx-auto text-slate-300" />
                )}
              </td>
              <td className="py-3 px-4 text-center">
                {policy.is_default ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Default
                  </span>
                ) : (
                  <span className="text-slate-300 text-xs">-</span>
                )}
              </td>
              <td className="py-3 px-4 text-center">
                {policy.is_active ? (
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
                    href={`/categories/retention-policies/${policy.id}`}
                    title="View policy mapping details"
                    className="p-1 px-2 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded transition"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/categories/retention-policies/${policy.id}/edit`}
                    title="Edit policy structure"
                    className="p-1 px-2 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 rounded transition"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Link>
                  {onDelete && (
                    <button
                      onClick={() => {
                        if (confirm(`Confirm permanent removal of policy "${policy.name}"?`)) {
                          onDelete(policy.id || '');
                        }
                      }}
                      title="Destroy database record"
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
