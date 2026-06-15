'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CategoryCreateForm from '@/components/forms/CategoryCreateForm';
import { ChevronLeft } from 'lucide-react';

export default function CategoryNew() {
  const router = useRouter();

  const handleCreated = (newId: string) => {
    router.push('/categories');
    router.refresh();
  };

  const handleCancel = () => {
    router.push('/categories');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Link
          href="/categories"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ChevronLeft className="h-4 w-4 mr-0.5" />
          Back to categories
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">Create Category</h1>
          <p className="text-xs text-slate-500 mt-1">
            Build high-level division categorization for assigning default archival routines & directory security limits.
          </p>
        </div>

        <CategoryCreateForm onSuccess={handleCreated} onCancel={handleCancel} />
      </div>
    </div>
  );
}
