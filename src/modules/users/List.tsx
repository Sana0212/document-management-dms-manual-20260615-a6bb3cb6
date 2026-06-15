'use client';

import React from 'react';
import Link from 'next/link';
import UsersTable from '@/components/tables/UsersTable';
import { UserPlus, ShieldAlert } from 'lucide-react';

export default function UsersListModule() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure system access control, edit profiles, assign system roles, and audit login states.
          </p>
        </div>

        <Link
          href="/users/create"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add New User
        </Link>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3">
        <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-amber-800">Role Privilege Warning</h4>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            Changing user roles immediately modifies which modules, folders, and critical approval flows the user is authorized to interact with. Ensure correct permissions before saving.
          </p>
        </div>
      </div>

      <UsersTable />
    </div>
  );
}
