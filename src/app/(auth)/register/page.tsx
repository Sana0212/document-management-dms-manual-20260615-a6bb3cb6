'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import Link from 'next/link';
import { Layers, ShieldCheck, CheckCircle2, ArrowRight, Lock, Mail, Loader2, User, Building } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { refreshSession } = useSession();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [roleKey, setRoleKey] = useState('employee'); // Default registration role
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          department,
          role_key: roleKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Registration failed');
      }

      await refreshSession();
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* LEFT PANEL: Branding & Context features */}
      <div className="relative hidden w-0 flex-1 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 lg:block lg:w-1/2">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.15),transparent_50%)]" />
        <div className="absolute inset-y-0 bottom-0 top-auto h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-white shadow-xl shadow-teal-500/20">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">DocuFlow DMS</span>
              <span className="ml-2 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-teal-500/10 text-teal-300 border border-teal-500/20">Enterprise</span>
            </div>
          </div>

          <div className="max-w-md my-auto space-y-6">
            <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
              Create your account. <br />
              <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Organize. Approve. Clear.</span>
            </h2>
            <p className="text-lg text-slate-300/90 leading-relaxed font-normal">
              Join your workspace to begin publishing secure files, managing audit trails, reviewing metadata and requesting rapid approvals from management.
            </p>

            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-teal-500/10 p-1 text-teal-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">Team Workspaces & Departments</h4>
                  <p className="text-xs text-slate-400">Upload records into categorized buckets with custom, secure visibility tracks.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} DocuFlow Inc. All rights reserved. Secure Cloud Storage API.
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-6">
            <div className="flex items-center gap-2.5 lg:hidden mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white">
                <Layers className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-950">DocuFlow DMS</span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Become a Member</h2>
            <p className="mt-2.5 text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-teal-600 hover:text-teal-500 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-sm text-rose-700">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-rose-500 rotate-180" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="first_name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    First Name
                  </label>
                  <input
                    id="first_name"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 mt-1 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm bg-slate-50 transition-all"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Last Name
                  </label>
                  <input
                    id="last_name"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 mt-1 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm bg-slate-50 transition-all"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Work Email Address
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm bg-slate-50 transition-all"
                    placeholder="john@company.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="department" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Department
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Building className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="department"
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm bg-slate-50 transition-all"
                    placeholder="Engineering, Legal etc."
                  />
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Select Role
                </label>
                <select
                  id="role"
                  value={roleKey}
                  onChange={(e) => setRoleKey(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 mt-1 px-3 py-2 text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm bg-slate-50"
                >
                  <option value="employee">Employee - Can upload documents, request reviews</option>
                  <option value="manager">Manager - Can approve department assets</option>
                  <option value="viewer">Viewer - Read-only reviewer</option>
                  <option value="admin">Admin - Full configuration permissions</option>
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Workspace Password
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm bg-slate-50 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-500/10 hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating Profile...</span>
                    </>
                  ) : (
                    <>
                      <span>Register Profile</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
