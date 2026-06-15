'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { ShellLayout } from '@/components/shell/layout';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Authorizing session...
          </p>
        </div>
      </div>
    );
  }

  // Double check session
  if (!user) {
    return null;
  }

  return <ShellLayout>{children}</ShellLayout>;
}
