'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { navigationConfig } from '@/components/app/navConfig';
import * as LucideIcons from 'lucide-react';
import { Shield, ShieldAlert, LogOut, ChevronRight } from 'lucide-react';

interface SidebarProps {
  onMobileClose?: () => void;
}

export function Sidebar({ onMobileClose }: SidebarProps) {
  const { user } = useSession();
  const pathname = usePathname();

  const userRole = user?.role || 'viewer';
  const roleRestrictions = navigationConfig.by_role[userRole] || navigationConfig.by_role.viewer;
  const hiddenRoutes = roleRestrictions.hidden_routes;

  const filteredMainItems = navigationConfig.main.filter(
    (item) => !hiddenRoutes.some((route) => item.route === route || item.route.startsWith(route + '/'))
  );

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-200 bg-[#0f172a] text-slate-100">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2.5 transition hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500 text-white shadow-md shadow-teal-500/20">
            <LucideIcons.Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-base tracking-tight text-white">DocuFlow DMS</div>
            <div className="text-[10px] font-medium text-teal-400 uppercase tracking-widest leading-none">Enterprise</div>
          </div>
        </Link>
      </div>

      {/* Navigation Space */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-7">
        <div>
          <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Workspace
          </div>
          <nav className="space-y-1">
            {filteredMainItems.map((item) => {
              const active = pathname === item.route || pathname.startsWith(item.route + '/');
              // Dynamic lucide icon loader
              const IconComponent = (LucideIcons as any)[item.icon] || LucideIcons.FileText;

              return (
                <Link
                  key={item.route}
                  href={item.route}
                  onClick={onMobileClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <IconComponent className={`h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Profile Settings
          </div>
          <nav className="space-y-1">
            {navigationConfig.secondary.map((item) => {
              const active = pathname === item.route || pathname.startsWith(item.route + '/');
              const IconComponent = (LucideIcons as any)[item.icon] || LucideIcons.User;

              return (
                <Link
                  key={item.route}
                  href={item.route}
                  onClick={onMobileClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <IconComponent className="h-4 w-4 shrink-0 text-slate-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Footer context */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/10 text-teal-400 font-semibold text-sm border border-teal-500/20">
            {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate leading-tight">
              {user?.fullName || 'Active User'}
            </div>
            <div className="text-xs text-slate-400 truncate capitalize tracking-wide">
              {userRole} &bull; {user?.department || 'Internal'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
