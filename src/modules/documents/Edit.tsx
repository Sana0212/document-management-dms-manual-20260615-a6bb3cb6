'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import DocumentEditForm from '@/components/forms/DocumentEditForm';
import { Edit, ArrowLeft } from 'lucide-react';

export default function DocumentEdit() {
  const params = useParams();
  const documentId = typeof params?.id === 'string' ? params.id : '';

  if (!documentId) {
    return (
      <div className="p-6 text-center text-slate-500 text-sm">
        Invalid Document ID reference.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      {/* Navigation header */}
      <div className="flex flex-col space-y-2">
        <Link
          href={`/documents/${documentId}`}
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm font-medium transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Details
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
            <Edit className="h-6 w-6 text-teal-600" />
            Modify Document Metadata
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Modify index identifiers, categories, retention parameters or publication levels.
          </p>
        </div>
      </div>

      {/* Actual Form element wrapper */}
      <DocumentEditForm documentId={documentId} />
    </div>
  );
}
