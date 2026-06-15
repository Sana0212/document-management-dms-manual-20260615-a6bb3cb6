import React from 'react';
import CategoryNew from '@/modules/categories/New';

export const dynamic = 'force-dynamic';

export default function CreateCategoryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <CategoryNew />
    </div>
  );
}
