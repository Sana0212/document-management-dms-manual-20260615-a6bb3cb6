import React from 'react';
import UserEditModule from '@/modules/users/Edit';

export const dynamic = 'force-dynamic';

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <UserEditModule id={id} />
    </div>
  );
}
