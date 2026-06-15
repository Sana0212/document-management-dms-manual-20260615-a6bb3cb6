'use client';

import React from 'react';
import { DocumentPermission, User } from '@/data/types';
import { ShieldCheck, User as UserIcon, Trash2, ShieldAlert } from 'lucide-react';

interface DocumentPermissionsTableProps {
  permissions: DocumentPermission[];
  users: User[];
  onDelete?: (id: string) => void;
}

export default function DocumentPermissionsTable({
  permissions,
  users,
  onDelete,
}: DocumentPermissionsTableProps) {
  
  const getUserNameAndRole = (perm: DocumentPermission) => {
    if (perm.user_id) {
      const found = users.find((u) => u.id === perm.user_id);
      return found 
        ? { title: `${found.first_name} ${found.last_name}`, subtitle: `User: ${found.email}` }
        : { title: 'Unknown User', subtitle: `ID: ${perm.user_id}` };
    }

    if (perm.role_key) {
      return { 
        title: `Role: ${perm.role_key.toUpperCase()}`, 
        subtitle: 'Applies to any authenticated workspace profile in this group' 
      };
    }

    return { title: 'Corrupted Target', subtitle: 'No user or role binds found' };
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-[#f8fafc] flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-teal-600" />
          Document Permission Overrides ({permissions.length})
        </h4>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-[#f8fafc]/50 text-slate-500 font-semibold border-b border-slate-100">
            <tr>
              <th className="px-5 py-3 text-xs tracking-wider uppercase">Grant Target</th>
              <th className="px-5 py-3 text-xs tracking-wider uppercase text-center">Can View</th>
              <th className="px-5 py-3 text-xs tracking-wider uppercase text-center">Can Edit</th>
              <th className="px-5 py-3 text-xs tracking-wider uppercase text-center">Can Approve</th>
              <th className="px-5 py-3 text-xs tracking-wider uppercase text-center">Can Download</th>
              <th className="px-5 py-3 text-xs tracking-wider uppercase text-right">Revoke</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {permissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400 text-xs">
                  No specialized permissions mapped yet. Default workspace role-based restrictions apply.
                </td>
              </tr>
            ) : (
              permissions.map((perm) => {
                const target = getUserNameAndRole(perm);
                return (
                  <tr key={perm.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500">
                          <UserIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{target.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{target.subtitle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${perm.can_view ? 'bg-emerald-500' : 'bg-slate-300'}`} title={perm.can_view ? 'Yes' : 'No'} />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${perm.can_edit ? 'bg-emerald-500' : 'bg-slate-300'}`} title={perm.can_edit ? 'Yes' : 'No'} />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${perm.can_approve ? 'bg-emerald-500' : 'bg-slate-300'}`} title={perm.can_approve ? 'Yes' : 'No'} />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${perm.can_download ? 'bg-emerald-500' : 'bg-slate-300'}`} title={perm.can_download ? 'Yes' : 'No'} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {onDelete && (
                        <button
                          onClick={() => {
                            if (confirm('Permanently revoke these security credentials from this user/role?')) {
                              onDelete(perm.id!);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                          title="Revoke Permission Grant"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
