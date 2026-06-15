'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import FolderEditForm from '@/components/forms/FolderEditForm';
import { ChevronLeft } from 'lucide-react';

export default function FolderEditPage() {
  const router = useRouter();
  const params = useParams();
  const folderId = params?.id as string;

  const handleUpdated = () => {
    router.push('/categories/folders');
  };

  const handleCancel = () => {
    router.push('/categories/folders');
  };

  if (!folderId) {
    return (
      <div className="text-sm p-4 text-red-500 font-semibold">
        No folder identifier found in URL path.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 container mx-auto px-4 py-8">
      <div className="flex items-center space-x-2">
        <Link
          href="/categories/folders"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ChevronLeft className="h-4 w-4 mr-0.5" />
          Back to directory mapping
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">Modify Folder structure</h1>
          <p className="text-xs text-slate-500 mt-1">
            Reclassify folder groupings, move parent node references, or alter visibility tags. Changing parent nodes will update the active calculated file path automatically.
          </p>
        </div>

        <FolderEditForm folderId={folderId} onSuccess={handleUpdated} onCancel={handleCancel} />
      </div>
    </div>
  );
}
