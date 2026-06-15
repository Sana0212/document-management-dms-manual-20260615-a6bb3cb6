'use client';

import React from 'react';
import Link from 'next/link';
import DocumentCreateForm from '@/components/forms/DocumentCreateForm';
import { FileText, ArrowLeft } from 'lucide-react';

export default function DocumentNew() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      {/* Navigation and Title */}
      <div className="flex flex-col space-y-2">
        <Link
          href="/documents"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm font-medium transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Directory
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
            <FileText className="h-6 w-6 text-teal-600" />
            Upload New Document
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Classify and insert metadata records, target storage paths, and attach primary files.
          </p>
        </div>
      </div>

      {/* Main Upload form */}
      <DocumentCreateForm />
    </div>
  );
}
