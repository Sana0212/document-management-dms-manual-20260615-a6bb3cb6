'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import CategoryEditForm from '@/components/forms/CategoryEditForm';
import { ChevronLeft } from 'lucide-react';

export default function CategoryEdit() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params?.id as string;

  const handleUpdated = () => {
    router.push('/categories');
    router.refresh();
  };

  const handleCancel = () => {
    router.push('/categories');
  };

  if (!categoryId) {
    return (
      <div className="text-sm text-red-500 font-semibold p-4">
        Missing valid Category reference ID.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Link
          href="/categories"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ChevronLeft className="h-4 w-4 mr-0.5" />
          Back to list
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="mb-6 animate-pulse-once">
          <h1 className="text-xl font-bold text-slate-900">Edit Category Classification</h1>
          <p className="text-xs text-slate-500 mt-1">
            Reassign target rules and parameters for active storage categories. Changing parameters may take active effect immediate.
          </p>
        </div>

        <CategoryEditForm categoryId={categoryId} onSuccess={handleUpdated} onCancel={handleCancel} />
      </div>
    </div>
  );
}
