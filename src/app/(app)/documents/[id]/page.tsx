import React from 'react';
import DocumentDetailsComponent from '@/modules/documents/Detail';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <DocumentDetailsComponent documentId={id} />;
}
