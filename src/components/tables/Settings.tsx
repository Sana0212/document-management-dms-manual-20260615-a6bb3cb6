'use client';

import React from 'react';
import { Setting } from '@/data/types';
import { Edit2, Shield, Settings, Key, Eye } from 'lucide-react';

interface SettingsTableProps {
  settings: Setting[];
  onEdit?: (setting: Setting) => void;
}

export default function SettingsTable({ settings, onEdit }: SettingsTableProps) {
  if (!settings || settings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-white">
        <span className="text-4xl text-slate-300 mb-3">⚙️</span>
        <h3 className="text-sm font-semibold text-slate-900 mb-1">No Settings found</h3>
        <p className="text-xs text-slate-500 text-center max-w-sm mb-4">
          Global system configurations determine authentication criteria, backup rules, and security controls.
        </p>
      </div>
    );
  }

  // Helper to categorize settings by icon
  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'security':
        return <Shield className="h-4 w-4 text-amber-600" />;
      case 'general':
        return <Settings className="h-4 w-4 text-blue-600" />;
      default:
        return <Key className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50 text-slate-700 border-b border-slate-100 font-semibold text-xs tracking-wider uppercase">
            <th className="py-3 px-4">Setting Key</th>
            <th className="py-3 px-4">Value</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-800">
          {settings.map((setting) => (
            <tr key={setting.key} className="hover:bg-slate-50/55 transition-colors">
              <td className="py-3 px-4 font-semibold text-slate-900">
                <span className="px-2 py-0.5 text-xs font-mono font-medium rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {setting.key}
                </span>
              </td>
              <td className="py-3 px-4 max-w-xs truncate text-xs font-medium text-slate-600">
                {setting.value}
              </td>
              <td className="py-3 px-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                  {getCategoryIcon(setting.category)}
                  <span className="capitalize">{setting.category}</span>
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end space-x-1">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(setting)}
                      title="Edit Global Setting Value"
                      className="p-1 px-2 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded transition flex items-center gap-1 text-xs font-medium"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit
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
