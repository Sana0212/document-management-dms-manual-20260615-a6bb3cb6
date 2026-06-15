'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import RetentionPolicyCreateForm from '@/components/forms/RetentionPolicyCreateForm';
import { ChevronLeft } from 'lucide-react';

export default function RetentionPolicyCreatePage() {
  const router = useRouter();

  const handleCreated = (newId: string) => {
    router.push('/categories/retention-policies');
  };

  const handleCancel = () => {
    router.push('/categories/retention-policies');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 container mx-auto px-4 py-8">
      <div className="flex items-center space-x-2">
        <Link
          href="/categories/retention-policies"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ChevronLeft className="h-4 w-4 mr-0.5" />
          Back to schedules list
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">Define Retention policy</h1>
          <p className="text-xs text-slate-500 mt-1">
            Build schedules stating duration restrictions and constraints before legal deletion flags trigger automatically.
          </p>
        </div>

        <RetentionPolicyCreateForm onSuccess={handleCreated} onCancel={handleCancel} />
      </div>
    </div>
  );
}
