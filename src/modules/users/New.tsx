'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UserCreateForm from '@/components/forms/UserCreateForm';
import { ChevronLeft } from 'lucide-react';

export default function UserNewModule() {
  const router = useRouter();

  const handleSuccess = (id: string) => {
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
          Back to User Accounts List
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">Provision User Account</h1>
          <p className="text-xs text-slate-500 mt-1">
            Register a secure credentials record and assign workspace roles. New users will be prompt to change their passwords.
          </p>
        </div>

        <UserCreateForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
}
