import React from 'react';
import UsersListModule from '@/modules/users/List';

export const dynamic = 'force-dynamic';

export default function UsersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <UsersListModule />
    </div>
  );
}
