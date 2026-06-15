import React from 'react';
import UserDetailModule from '@/modules/users/Detail';

export const dynamic = 'force-dynamic';

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <UserDetailModule id={id} />
    </div>
  );
}
