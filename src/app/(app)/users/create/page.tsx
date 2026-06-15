import React from 'react';
import UserNewModule from '@/modules/users/New';

export const dynamic = 'force-dynamic';

export default function UserCreatePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <UserNewModule />
    </div>
  );
}
