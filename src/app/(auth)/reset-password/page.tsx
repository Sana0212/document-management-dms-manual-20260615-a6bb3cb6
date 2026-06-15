'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Layers, Lock, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, password_confirm: passwordConfirm }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Password reset failed');
      }

      setMessage(data.message || 'Password updated cataloged successfully. Redirecting to login...');
      setTimeout(() => {
        router.replace('/login');
      }, 2500);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-sm text-rose-700">
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="rounded-xl bg-teal-50 border border-teal-100 p-4 text-sm text-teal-800">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-teal-600 shrink-0" />
            <span>{message}</span>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="pass" className="block text-sm font-medium text-slate-700">
          New Security Password
        </label>
        <div className="relative mt-1.5 rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Lock className="h-4 w-4 text-slate-400" />
          </div>
          <input
            id="pass"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm bg-slate-50 transition-all"
            placeholder="••••••••"
          />
        </div>
      </div>

      <div>
        <label htmlFor="pass_confirm" className="block text-sm font-medium text-slate-700">
          Confirm Your Password
        </label>
        <div className="relative mt-1.5 rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Lock className="h-4 w-4 text-slate-400" />
          </div>
          <input
            id="pass_confirm"
            type="password"
            required
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="block w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm bg-slate-50 transition-all"
            placeholder="••••••••"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center items-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-teal-500/10 hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 transition-all"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span>Update Credentials</span>
          )}
        </button>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen">
      {/* LEFT display */}
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
              Reset Security Code
            </h2>
            <p className="text-lg text-slate-300/90 leading-relaxed font-normal">
              Re-establish password authentication vectors across the entire DocuFlow digital vault track.
            </p>
          </div>

          <div className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} DocuFlow Inc. All rights reserved. Secure Cloud Storage API.
          </div>
        </div>
      </div>

      {/* RIGHT Form Component with Suspense wrapper */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </Link>

            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Configure Password</h2>
            <p className="mt-2.5 text-sm text-slate-500">
              Enter your fresh, customized secure password coordinates below to verify changes.
            </p>
          </div>

          <div className="mt-8">
            <Suspense fallback={<div>Loading authorization context...</div>}>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
