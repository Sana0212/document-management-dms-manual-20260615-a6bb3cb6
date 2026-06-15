import React from 'react';

export interface NavItem {
  label: string;
  route: string;
  icon: string; // lucide icon identifier
}

export const navigationConfig = {
  main: [
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: 'LayoutDashboard',
    },
    {
      label: 'Documents',
      route: '/documents',
      icon: 'FileText',
    },
    {
      label: 'Approvals',
      route: '/approvals',
      icon: 'CheckSquare',
    },
    {
      label: 'Categories',
      route: '/categories',
      icon: 'FolderTree',
    },
    {
      label: 'Users',
      route: '/users',
      icon: 'Users',
    },
  ] as NavItem[],
  secondary: [
    {
      label: 'My Profile',
      route: '/settings/profile',
      icon: 'User',
    },
  ] as NavItem[],
  settings: [
    {
      label: 'General Settings',
      route: '/settings/general',
      icon: 'Settings',
    },
    {
      label: 'Security',
      route: '/settings/security',
      icon: 'Lock',
    },
  ] as NavItem[],
  by_role: {
    admin: {
      hidden_routes: [] as string[],
    },
    manager: {
      hidden_routes: [
        '/categories',
        '/users',
      ] as string[],
    },
    employee: {
      hidden_routes: [
        '/categories',
        '/users',
        '/approvals',
      ] as string[],
    },
    viewer: {
      hidden_routes: [
        '/categories',
        '/users',
        '/approvals',
      ] as string[],
    },
  } as Record<string, { hidden_routes: string[] }>,
};
