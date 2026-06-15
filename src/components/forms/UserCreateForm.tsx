'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, UserPlus } from 'lucide-react';

interface UserCreateFormProps {
  onSuccess?: (id: string) => void;
  onCancel?: () => void;
}

export default function UserCreateForm({ onSuccess, onCancel }: UserCreateFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleKey, setRoleKey] = useState('employee');
  const [department, setDepartment] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        password_hash: password, // The API accepts user_create_form containing password_hash which gets processed (or standard register)
        role_key: roleKey,
        department: department.trim() || undefined,
        is_active: isActive,
        created_at: new Date().toISOString(),
      };

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to create user');
      }

      const data = await res.json();
      if (onSuccess) {
        onSuccess(data.id || data.userId || 'success');
      } else {
        router.push('/users');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-xs font-medium rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-705 uppercase tracking-wider mb-1">
            First Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Jane"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-705 uppercase tracking-wider mb-1">
            Last Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Doe"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-705 uppercase tracking-wider mb-1">
          Email Address *
        </label>
        <input
          type="email"
          required
          placeholder="e.g. jane.doe@company.com"
          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-705 uppercase tracking-wider mb-1">
          Temporary Password *
        </label>
        <input
          type="password"
          required
          placeholder="At least 6 characters"
          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-705 uppercase tracking-wider mb-1">
            Role Assignment *
          </label>
          <select
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={roleKey}
            onChange={(e) => setRoleKey(e.target.value)}
          >
            <option value="viewer">Viewer (Read-only)</option>
            <option value="employee">Employee (Uploader)</option>
            <option value="manager">Manager (Approver)</option>
            <option value="admin">Administrator (Full Access)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-705 uppercase tracking-wider mb-1">
            Department
          </label>
          <input
            type="text"
            placeholder="e.g. Human Resources"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center pt-2">
        <label className="inline-flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            className="h-4 w-4 bg-white border-slate-300 text-indigo-600 rounded focus:ring-indigo-500"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <span className="text-sm font-semibold text-slate-700">Account is active and ready to log in</span>
        </label>
      </div>

      <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm hover:bg-slate-100 rounded-lg font-medium text-slate-600 transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm flex items-center shadow-sm hover:shadow transition disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="mr-2 h-4 w-4" />
          )}
          Create User Account
        </button>
      </div>
    </form>
  );
}
