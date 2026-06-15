import React from 'react';
import CategoryEdit from '@/modules/categories/Edit';

export const dynamic = 'force-dynamic';

export default function EditCategoryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <CategoryEdit />
    </div>
  );
}
