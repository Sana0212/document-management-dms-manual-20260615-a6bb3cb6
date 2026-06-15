'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import ApprovalCreateForm from '@/components/forms/ApprovalCreateForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewApprovalWindow() {
  const router = useRouter();

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Link
          href="/approvals"
          className="p-1 px-2 border hover:bg-slate-50 transition rounded-lg text-xs font-semibold text-slate-600 flex items-center gap-1"
        >
          <ChevronLeft className="h-3 w-3" /> Back
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-950">Initiate Document Approval</h1>
          <p className="text-sm text-slate-500">
            Assuring business alignment and policy tracking before public index listing.
          </p>
        </div>

        <ApprovalCreateForm
          onSuccess={() => {
            router.push('/approvals');
            router.refresh();
          }}
          onCancel={() => router.push('/approvals')}
        />
      </div>
    </div>
  );
}
