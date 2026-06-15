'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { Bell, LogOut, User, Settings, Menu } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useSession();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const initialCircle = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onMenuToggle}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden lg:block">
          <h1 className="text-sm font-medium text-slate-500">
            Welcome back, <span className="font-semibold text-slate-900">{user?.fullName || 'User'}</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick notification center standard look */}
        <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
          <span className="sr-only">Notifications</span>
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-teal-600 ring-2 ring-white" />
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-50 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white font-semibold text-xs shadow-sm">
              {initialCircle}
            </div>
          </button>

          {dropdownOpen && (
            <>
              {/* Overlay Backdrop to dismiss */}
              <div
                className="fixed inset-0 z-20"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2.5 w-56 origin-top-right rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5 focus:outline-none z-30">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider leading-none mb-1">Authenticated as</p>
                  <p className="text-sm font-bold text-slate-800 truncate">{user?.fullName || 'Active User'}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-semibold text-teal-700 uppercase tracking-wider">
                    {user?.role || 'viewer'}
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    href="/settings/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    href="/settings/general"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    <span>Settings</span>
                  </Link>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
