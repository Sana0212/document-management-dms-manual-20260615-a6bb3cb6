'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UserEditForm from '@/components/forms/UserEditForm';
import { ChevronLeft } from 'lucide-react';

interface UserEditModuleProps {
  id: string;
}

export default function UserEditModule({ id }: UserEditModuleProps) {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/users');
    router.refresh();
  };

  const handleCancel = () => {
    router.push('/users');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center">
        <Link
          href="/users"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ChevronLeft className="h-4 w-4 mr-0.5" />
          Cancel and Return
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">Modify User Metadata</h1>
          <p className="text-xs text-slate-500 mt-1">
            Update account specifications, adjust role hierarchy levels, or mark workspace access as inactive.
          </p>
        </div>

        <UserEditForm id={id} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
}
