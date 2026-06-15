'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FolderCreateForm from '@/components/forms/FolderCreateForm';
import { ChevronLeft } from 'lucide-react';

export default function FolderCreatePage() {
  const router = useRouter();

  const handleCreated = (newId: string) => {
    router.push('/categories/folders');
  };

  const handleCancel = () => {
    router.push('/categories/folders');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 container mx-auto px-4 py-8">
      <div className="flex items-center space-x-2">
        <Link
          href="/categories/folders"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ChevronLeft className="h-4 w-4 mr-0.5" />
          Back to folder structured paths
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">Configure Storage Folder</h1>
          <p className="text-xs text-slate-500 mt-1">
            Instantiate digital structures linked under active parent categories. Create nested paths relative to previous nodes.
          </p>
        </div>

        <FolderCreateForm onSuccess={handleCreated} onCancel={handleCancel} />
      </div>
    </div>
  );
}
