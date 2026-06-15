'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Document } from '@/data/types';
import { ChevronLeft, Pencil, Shield, Mail, Building, Activity, Calendar, FileText, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface UserDetailModuleProps {
  id: string;
}

export default function UserDetailModule({ id }: UserDetailModuleProps) {
  const router = useRouter();
  const [userRecord, setUserRecord] = useState<User | null>(null);
  const [userDocs, setUserDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Get user details
        const userRes = await fetch(`/api/users/${id}`);
        if (!userRes.ok) {
          throw new Error('User record could not be extracted');
        }
        const userData = await userRes.json();
        setUserRecord(userData.data || userData);

        // Try load documents owned by user if any
        const docsRes = await fetch(`/api/documents?owner_user_id=${id}`);
        if (docsRes.ok) {
          const docsData = await docsRes.json();
          const docList = Array.isArray(docsData) ? docsData : (docsData.data || []);
          setUserDocs(docList.filter((d: Document) => d.owner_user_id === id));
        }
      } catch (err: any) {
        setError(err.message || 'Error pulling account specifics');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      void loadData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="text-sm font-medium text-slate-600">Retrieving account registry...</span>
      </div>
    );
  }

  if (error || !userRecord) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Link href="/users" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
          <ChevronLeft className="h-4 w-4 mr-0.5" />
          Back to User Accounts
        </Link>
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
          {error || 'User details not found.'}
        </div>
      </div>
    );
  }

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

  const roleStyle = getRoleLabel(userRecord.role_key);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/users"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ChevronLeft className="h-4 w-4 mr-0.5" />
          Back to User Dashboard
        </Link>

        <Link
          href={`/users/${id}/edit`}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition"
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit Account
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-center space-y-4 md:col-span-1">
          <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 text-indigo-600 flex items-center justify-center font-bold text-2xl uppercase mx-auto shadow-sm">
            {userRecord.first_name?.[0]}
            {userRecord.last_name?.[0]}
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              {userRecord.first_name} {userRecord.last_name}
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-mono">{userRecord.email}</p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col items-center space-y-1.5">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${roleStyle.bg}`}>
              <Shield className="h-3 w-3 mr-1" />
              {roleStyle.text}
            </span>

            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
              userRecord.is_active
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {userRecord.is_active ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              {userRecord.is_active ? 'Active Employee' : 'Deactivated'}
            </span>
          </div>
        </div>

        {/* User Meta Details */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6 md:col-span-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              System metadata & placement
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-sm text-slate-600">
              <div className="flex items-center space-x-3">
                <Building className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                <div>
                  <span className="block text-xs font-semibold text-slate-400">Department</span>
                  <span className="font-semibold text-slate-700">{userRecord.department || 'Not Assigned'}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Activity className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                <div>
                  <span className="block text-xs font-semibold text-slate-400">Last Authentication</span>
                  <span className="font-semibold text-slate-700">
                    {userRecord.last_login_at
                      ? new Date(userRecord.last_login_at).toLocaleString()
                      : 'Never Authored'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                <div>
                  <span className="block text-xs font-semibold text-slate-400">Onboarded At</span>
                  <span className="font-semibold text-slate-700">
                    {new Date(userRecord.created_at).toLocaleDateString(undefined, {
                      dateStyle: 'long',
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                <div>
                  <span className="block text-xs font-semibold text-slate-400">Channel Verification</span>
                  <span className="font-semibold text-slate-700">Verified Database Email</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Managed Documents ({userDocs.length})</span>
              <FileText className="h-4 w-4 text-slate-400" />
            </h3>

            {userDocs.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 italic text-center">
                This account operates no primary metadata documents in the DMS storage stack.
              </p>
            ) : (
              <div className="mt-3 overflow-hidden text-xs rounded-lg border border-slate-100 divide-y divide-slate-100 max-h-52 overflow-y-auto">
                {userDocs.map((doc) => (
                  <div key={doc.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                    <span className="font-semibold text-slate-705 truncate max-w-xs">{doc.title}</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xxs font-bold uppercase ${
                      doc.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700'
                        : doc.status === 'pending'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
