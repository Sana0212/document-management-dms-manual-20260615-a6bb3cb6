'use client';

import React, { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';

interface ShellLayoutProps {
  children: React.ReactNode;
}

export function ShellLayout({ children }: ShellLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:shrink-0 h-full">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar overlay backdrop */}
      {mobileSidebarOpen && (
        <div className="relative z-40 lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs transition-transform duration-300 ease-in-out">
            <aside className="flex h-full w-64 flex-col bg-[#0f172a] text-slate-100">
              <Sidebar onMobileClose={() => setMobileSidebarOpen(false)} />
            </aside>
          </div>
        </div>
      )}

      {/* Main workspace */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
