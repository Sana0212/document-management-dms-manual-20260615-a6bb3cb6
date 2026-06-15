'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import Link from 'next/link';
import { Layers, ShieldCheck, CheckCircle2, Search, ArrowRight, Lock, Mail, Loader2, FileCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { refreshSession } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Authentication failed');
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
      {/* LEFT PANEL: Enterprise and unique branding view */}
      <div className="relative hidden w-0 flex-1 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 lg:block lg:w-1/2">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.15),transparent_50%)]" />
        <div className="absolute inset-x-0 bottom-0 top-auto h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />
        
        {/* Subtle grid pattern background lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-white shadow-xl shadow-teal-500/20">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">DocuFlow DMS</span>
              <span className="ml-2 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-teal-500/10 text-teal-300 border border-teal-500/20">Enterprise</span>
            </div>
          </div>

          {/* Core App Features Display */}
          <div className="max-w-md my-auto space-y-6">
            <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
              Centralized Control, <br />
              <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Impeccable Compliance.</span>
            </h2>
            <p className="text-lg text-slate-300/90 leading-relaxed font-normal">
              Structured storage, full version control, automated approval workflows, and rigid fine-grained access control tailored for small and medium enterprises.
            </p>

            {/* Structured bullet points highlighting system capabilities */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-teal-500/10 p-1 text-teal-400">
                  <FileCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">Smart Meta & Retention Periods</h4>
                  <p className="text-xs text-slate-400">Structure documents with folders and legally binding custom policies.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-teal-500/10 p-1 text-teal-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">Automated Manager Approvals</h4>
                  <p className="text-xs text-slate-400">Route documents for review before publishing to live production tracks.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-teal-500/10 p-1 text-teal-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">Absolute Confidentiality & Permissions</h4>
                  <p className="text-xs text-slate-400">Lock high-sensitivity assets by roles and custom user assignments.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer branding */}
          <div className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} DocuFlow Inc. All rights reserved. Secure Cloud Storage API.
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Authentication Form Panel */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            {/* Mobile View Header Title */}
            <div className="flex items-center gap-2.5 lg:hidden mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white">
                <Layers className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-950">DocuFlow DMS</span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Sign in to your space</h2>
            <p className="mt-2.5 text-sm text-slate-500">
              New to DocuFlow?{' '}
              <Link href="/register" className="font-semibold text-teal-600 hover:text-teal-500 transition-colors">
                Register an account
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-sm text-rose-700 animate-fadeIn">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-rose-500 rotate-180" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Work Email Address
                </label>
                <div className="relative mt-1.5 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm bg-slate-50 transition-all"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                    Security Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-teal-600 hover:text-teal-500"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative mt-1.5 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm bg-slate-50 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center items-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-teal-500/10 hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
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
