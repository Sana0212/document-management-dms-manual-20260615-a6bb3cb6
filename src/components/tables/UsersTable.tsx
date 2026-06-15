'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from '@/data/types';
import { Eye, Pencil, Trash2, Search, SlidersHorizontal, Shield, UserX, Loader2, Check, X } from 'lucide-react';

interface UsersTableProps {
  users?: User[];
  onDeleteSuccess?: () => void;
}

export default function UsersTable({ users: initialUsers, onDeleteSuccess }: UsersTableProps) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(initialUsers || []);
  const [loading, setLoading] = useState(!initialUsers);
  const [error, setError] = useState<string | null>(null);

  // Filters & Searching
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Delete Action states
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Could not retrieve database user roster');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : (data.data || []));
    } catch (err: any) {
      setError(err.message || 'Failed loading users list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialUsers) {
      void fetchUsers();
    } else {
      setUsers(initialUsers);
    }
  }, [initialUsers]);

  // Extract unique departments for helper filter select
  const departments = Array.from(
    new Set(users.map((u) => u.department).filter(Boolean))
  ) as string[];

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Could not delete user account');
      }
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setConfirmDeleteId(null);
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred during deletion.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.department || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !selectedRole || u.role_key === selectedRole;
    const matchesDept = !selectedDepartment || u.department === selectedDepartment;
    const matchesStatus =
      !selectedStatus ||
      (selectedStatus === 'active' ? u.is_active === true : u.is_active === false);

    return matchesSearch && matchesRole && matchesDept && matchesStatus;
  });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return { text: 'Administrator', bg: 'bg-red-50 text-red-700 border-red-200' };
      case 'manager':
        return { text: 'Manager', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'employee':
        return { text: 'Employee', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'viewer':
        return { text: 'Viewer', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
      default:
        return { text: role, bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="text-sm font-medium text-slate-600">Loading user catalog...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium flex items-center justify-between">
        <span>{error}</span>
        <button onClick={fetchUsers} className="px-3 py-1 bg-white border border-red-300 rounded-md text-xs hover:bg-red-100">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user name, email, department..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-semibold mr-1">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          <select
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="admin">Administrator</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
            <option value="viewer">Viewer</option>
          </select>

          {departments.length > 0 && (
            <select
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          )}

          <select
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <UserX className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-semibold text-slate-700">No users found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search filters or add a new team member to the register directory.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Assigned Role</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5">Last Active</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredUsers.map((u) => {
                  const roleStyle = getRoleLabel(u.role_key);
                  const isConfirming = confirmDeleteId === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-indigo-50/20 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-slate-900">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-indigo-600 border border-slate-200 flex items-center justify-center font-bold text-xs uppercase">
                            {u.first_name?.[0]}
                            {u.last_name?.[0]}
                          </div>
                          <div>
                            <span className="block font-semibold">
                              {u.first_name} {u.last_name}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-slate-500 font-mono text-xs">{u.email}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${roleStyle.bg}`}>
                          {roleStyle.text}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">{u.department || '—'}</td>
                      <td className="px-6 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold leading-none ${
                            u.is_active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-slate-500">
                        {u.last_login_at
                          ? new Date(u.last_login_at).toLocaleDateString(undefined, {
                              dateStyle: 'medium',
                            })
                          : 'Never'}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        {isConfirming ? (
                          <div className="flex items-center justify-end space-x-1.5 animate-fadeIn">
                            <span className="text-xs text-rose-600 font-medium mr-1">Confirm delete?</span>
                            <button
                              onClick={() => u.id && handleDelete(u.id)}
                              disabled={deletingId === u.id}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="p-1 text-slate-400 hover:bg-slate-100 border border-slate-200 rounded"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end space-x-1">
                            <Link
                              href={`/users/${u.id}`}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition"
                              title="View Details"
                            >
                              <Eye className="h-4.5 w-4.5" />
                            </Link>

                            <Link
                              href={`/users/${u.id}/edit`}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-50 rounded-lg transition"
                              title="Edit User Profile"
                            >
                              <Pencil className="h-4.5 w-4.5" />
                            </Link>

                            <button
                              onClick={() => setConfirmDeleteId(u.id || null)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition"
                              title="Remove User Account"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
