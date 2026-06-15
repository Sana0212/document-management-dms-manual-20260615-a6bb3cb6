'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import RetentionPolicyEditForm from '@/components/forms/RetentionPolicyEditForm';
import { ChevronLeft } from 'lucide-react';

export default function RetentionPolicyEditPage() {
  const router = useRouter();
  const params = useParams();
  const policyId = params?.id as string;

  const handleUpdated = () => {
    router.push('/categories/retention-policies');
  };

  const handleCancel = () => {
    router.push('/categories/retention-policies');
  };

  if (!policyId) {
    return (
      <div className="text-sm p-4 text-red-500 font-semibold">
        No retention policy code was received in Route Path.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 container mx-auto px-4 py-8">
      <div className="flex items-center space-x-2">
        <Link
          href="/categories/retention-policies"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ChevronLeft className="h-4 w-4 mr-0.5" />
          Back to list
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">Edit Retention Schedule</h1>
          <p className="text-xs text-slate-500 mt-1">
            Update timelines, fallback configurations, legal hold properties, and flags across active schedules.
          </p>
        </div>

        <RetentionPolicyEditForm policyId={policyId} onSuccess={handleUpdated} onCancel={handleCancel} />
      </div>
    </div>
  );
}
