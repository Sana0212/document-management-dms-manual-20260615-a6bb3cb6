import React from 'react';
import CategoriesList from '@/modules/categories/List';

export const dynamic = 'force-dynamic';

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <CategoriesList />
    </div>
  );
}
