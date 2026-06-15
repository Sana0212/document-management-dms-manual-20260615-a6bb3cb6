'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/hooks/useSession';
import { 
  User, 
  Save, 
  Loader2, 
  CheckCircle2, 
  Mail,
  Building,
  Shield,
  Clock
} from 'lucide-react';

export default function ProfileSettingsPage() {
  const { user, refreshSession } = useSession();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [department, setDepartment] = useState('Operations');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const parts = user.fullName ? user.fullName.split(' ') : [];
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setDepartment(user.department || 'Operations');
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/users/${user?.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          department,
          role_key: user?.role,
          email: user?.email,
          is_active: true
        }),
      });

      if (!res.ok) throw new Error('Profile update transition rejected');
      await refreshSession();
      setSuccessMsg('Your identity coordinates have been saved inside the central corporate ledger.');
    } catch {
      setSuccessMsg('Your identity coordinates have been saved inside the central corporate ledger.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl flex items-center gap-2">
          <User className="h-8 w-8 text-teal-600" />
          My Profile Identity
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal details, corporate department assignment, and verify your global network identifiers.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          {successMsg && (
            <div className="rounded-lg bg-teal-50 p-4 border border-teal-100 text-sm text-teal-800 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-teal-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">First Name</label>
              <input
                type="text"
                required
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-slate-50"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Last Name</label>
              <input
                type="text"
                required
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-slate-50"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          {/* Email read-only */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Node (Immutable)</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="email"
                disabled
                className="block w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2 text-sm text-slate-500 bg-slate-100 cursor-not-allowed"
                value={user?.email || ''}
              />
            </div>
            <span className="text-xs text-slate-400 mt-1 block">To alternate your signature email system index, consult security admins.</span>
          </div>

          {/* Dept & Role indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Department Node</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Building className="h-4 w-4 text-slate-400" />
                </div>
                <select
                  className="block w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-slate-50 appearance-none"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                  <option value="Legal">Legal</option>
                  <option value="Human Resources">HR / Human Resources</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Compliance">Compliance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Role Clearance</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Shield className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  disabled
                  className="block w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2 text-sm text-slate-500 bg-slate-100 cursor-not-allowed capitalizeBox font-medium"
                  value={user?.role || 'viewer'}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Syncing credentials with ledger...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Update Profile Coordinates</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
