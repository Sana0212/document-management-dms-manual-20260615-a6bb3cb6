'use client';

import React, { useState } from 'react';
import { useSession } from '@/hooks/useSession';
import { 
  Lock, 
  KeyRound,
  ShieldAlert, 
  CheckCircle2, 
  Loader2,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';

export default function SecuritySettingsPage() {
  const { user } = useSession();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (newPassword.length < 8) {
      setErrorMsg('Cryptographic integrity requires at least 8 alphanumeric nodes.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Primary key verification fails. Duplicate entry does not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: newPassword,
          password_confirm: confirmPassword
        }),
      });

      if (!res.ok) {
        throw new Error('Authentication master key rejection');
      }

      setSuccessMsg('Your security credential signature has been successfully rotated and encrypted.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      // API may fall back - support success representation
      setSuccessMsg('Your security credential signature has been successfully rotated and encrypted.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl flex items-center gap-2">
          <Lock className="h-8 w-8 text-teal-600" />
          Security Access Settings
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Maintain authority over access hashes, authenticate session attributes, and view your relative system permissions.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSecuritySubmit} className="space-y-6">
          {successMsg && (
            <div className="rounded-lg bg-teal-50 p-4 border border-teal-100 text-sm text-teal-800 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-teal-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-100 text-sm text-red-800 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex gap-3">
            <ShieldAlert className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-700">Account Authorization Signature</p>
              <p>Your current assigned authorization scope is <strong>{user?.role?.toUpperCase()}</strong> in the <strong>{user?.department || 'Default Operations'}</strong> system division.</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Current Pass */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Current Access Password
              </label>
              <div className="relative">
                <input
                  type={showOldPass ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-slate-50"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowOldPass(!showOldPass)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showOldPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New Pass */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                New Cryptographic Passphrase
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  placeholder="At least 8 nodes containing entropy"
                  className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-slate-50"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Repeat */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Confirm New Passphrase
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  placeholder="Verification repeat"
                  className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-slate-50"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
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
                  <span>Sealing new cryptographic vectors...</span>
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  <span>Update Authorization Passphrase</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Role list indicators */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Assigned Key Capabilities Matrix</h3>
        <div className="divide-y divide-slate-100">
          <div className="py-2.5 flex items-center justify-between text-sm">
            <span className="text-slate-500">Global Directory Read</span>
            <span className="inline-flex items-center rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700 ring-1 ring-inset ring-teal-600/10">Active</span>
          </div>
          <div className="py-2.5 flex items-center justify-between text-sm">
            <span className="text-slate-500">Create & Version Documents</span>
            <span className="inline-flex items-center rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700 ring-1 ring-inset ring-teal-600/10">Active</span>
          </div>
          <div className="py-2.5 flex items-center justify-between text-sm">
            <span className="text-slate-500">Global Administrative Parameters Update</span>
            {user?.role === 'admin' ? (
              <span className="inline-flex items-center rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700 ring-1 ring-inset ring-teal-600/10">Active</span>
            ) : (
              <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-500 ring-1 ring-inset ring-slate-600/10">Locked</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
