import React from 'react';
import ApprovalDetailModule from '@/modules/approvals/Detail';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ApprovalDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <ApprovalDetailModule id={id} />
    </div>
  );
}
