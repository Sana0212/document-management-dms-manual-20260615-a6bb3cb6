import React from 'react';
import ApprovalsListModule from '@/modules/approvals/List';

export const dynamic = 'force-dynamic';

export default function ApprovalsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ApprovalsListModule />
    </div>
  );
}
