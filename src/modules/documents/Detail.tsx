'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { Document, DocumentVersion, DocumentPermission, User, Category, Folder, RetentionPolicy } from '@/data/types';
import DocumentVersionsTable from '@/components/tables/DocumentVersionsTable';
import DocumentPermissionsTable from '@/components/tables/DocumentPermissionsTable';
import DocumentVersionCreateForm from '@/components/forms/DocumentVersionCreateForm';
import DocumentPermissionCreateForm from '@/components/forms/DocumentPermissionCreateForm';
import { 
  ArrowLeft, 
  Loader2, 
  Settings, 
  FileText, 
  Layers, 
  ShieldCheck, 
  Plus, 
  FolderMinus, 
  Globe, 
  Lock, 
  User as UserIcon,
  Clock,
  CheckCircle,
  AlertTriangle,
  Archive,
  DownloadCloud
} from 'lucide-react';

interface DocumentDetailsComponentProps {
  documentId: string;
}

export default function DocumentDetailsComponent({ documentId }: DocumentDetailsComponentProps) {
  const router = useRouter();
  const { user: currentUser } = useSession();

  // Root Data Sync state
  const [document, setDocument] = useState<Document | null>(null);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [permissions, setPermissions] = useState<DocumentPermission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal / Form opening switches
  const [showUploadVersionModal, setShowUploadVersionModal] = useState(false);
  const [showGrantPermissionModal, setShowGrantPermissionModal] = useState(false);

  // Query function
  const fetchAllDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const [docRes, versRes, permsRes, usersRes, catsRes, foldersRes, policiesRes] = await Promise.all([
        fetch(`/api/documents/${documentId}`).then((r) => r.ok ? r.json() : null),
        fetch('/api/document_versions').then((r) => r.ok ? r.json() : []),
        fetch('/api/document_permissions').then((r) => r.ok ? r.json() : []),
        fetch('/api/users').then((r) => r.ok ? r.json() : []),
        fetch('/api/categories').then((r) => r.ok ? r.json() : []),
        fetch('/api/folders').then((r) => r.ok ? r.json() : []),
        fetch('/api/retention_policies').then((r) => r.ok ? r.json() : []),
      ]);

      if (!docRes) {
        throw new Error('This document record either does not exist, or you lack active credentials to view it.');
      }

      setDocument(docRes);
      
      // Filter versions relative to the document
      const docVersions = (Array.isArray(versRes) ? versRes : (versRes.data || []))
        .filter((v: DocumentVersion) => v.document_id === documentId);
      setVersions(docVersions);

      // Filter permissions relative to the document
      const docPermissions = (Array.isArray(permsRes) ? permsRes : (permsRes.data || []))
        .filter((p: DocumentPermission) => p.document_id === documentId);
      setPermissions(docPermissions);

      setUsers(Array.isArray(usersRes) ? usersRes : (usersRes.data || []));
      setCategories(Array.isArray(catsRes) ? catsRes : (catsRes.data || []));
      setFolders(Array.isArray(foldersRes) ? foldersRes : (foldersRes.data || []));
      setPolicies(Array.isArray(policiesRes) ? policiesRes : (policiesRes.data || []));

    } catch (err: any) {
      setError(err.message || 'Error occurred loading metadata card details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) {
      void fetchAllDetails();
    }
  }, [documentId]);

  // Promote version handler
  const handleSetCurrentVersion = async (versionId: string) => {
    try {
      setLoading(true);
      
      // Call PUT on version, API will set is_current flag and update parent document reference link
      const res = await fetch(`/api/document_versions/${versionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_current: true }),
      });

      if (!res.ok) {
        const errVal = await res.json();
        throw new Error(errVal.error || 'Failed to update system target version');
      }

      // Sync pointers on parent
      await fetch(`/api/documents/${documentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_version_id: versionId,
          updated_at: new Date().toISOString()
        })
      });

      await fetchAllDetails();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Revoke a permission instance
  const handleDeletePermission = async (id: string) => {
    try {
      const res = await fetch(`/api/document_permissions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Revoking authorization index failed');
      await fetchAllDetails();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
        <p className="text-slate-500 font-medium text-sm">Synchronizing version catalogs...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="p-6 text-center max-w-xl mx-auto space-y-4">
        <div className="p-4 bg-red-50 text-red-700 text-sm border border-red-200 rounded-lg">
          {error || 'Document metadata record is missing.'}
        </div>
        <Link
          href="/documents"
          className="inline-flex items-center gap-1.5 text-teal-600 hover:text-teal-700 font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Navigate Back to Document List
        </Link>
      </div>
    );
  }

  // Find references
  const linkedCategory = categories.find((c) => c.id === document.category_id);
  const linkedFolder = folders.find((f) => f.id === document.folder_id);
  const linkedPolicy = policies.find((p) => p.id === document.retention_policy_id);
  const ownerUser = users.find((u) => u.id === document.owner_user_id);
  const currentVersion = versions.find((v) => v.id === document.current_version_id);

  // Next sequential revision level
  const latestRevisionNum = versions.reduce((acc, curr) => Math.max(acc, curr.version_number), 0);
  const nextTargetRevNum = latestRevisionNum > 0 ? latestRevisionNum + 1 : 1;

  // Determine user permission overrides limits on client-side rendering
  // (In a real production app, the backend enforces this, but let's optimize client experience)
  const canModify = currentUser?.role === 'admin' || currentUser?.role === 'manager' || currentUser?.userId === document.owner_user_id;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/documents"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#0f172a] transition"
          >
            <ArrowLeft className="h-3 w-3" />
            Documents Workspace
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            {document.title}
          </h2>
          <p className="text-xs text-slate-400 font-mono">ID: {documentId}</p>
        </div>

        <div className="flex items-center gap-2">
          {canModify && (
            <Link
              href={`/documents/${documentId}/edit`}
              className="inline-flex items-center gap-1 bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-50 transition"
            >
              <Settings className="h-3.5 w-3.5" />
              Edit Meta Data
            </Link>
          )}

          {currentUser?.role !== 'viewer' && (
            <button
              onClick={() => setShowUploadVersionModal(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-sm transition inline-flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Upload Revision
            </button>
          )}
        </div>
      </div>

      {/* Main card grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metadata detailed stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata Card details */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div>
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Description</h3>
              <p className="text-slate-700 text-sm mt-1.5 leading-relaxed italic">
                {document.description || 'No supplementary specifications or descriptions added.'}
              </p>
            </div>

            {/* Keyword tags */}
            {document.tags && document.tags.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Classification Index tags</h3>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {document.tags.map((tg, i) => (
                    <span
                      key={i}
                      className="bg-teal-50 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-teal-100"
                    >
                      {tg}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* General detailed key values grid */}
            <div className="border-t border-slate-100 pt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400">Primary Category:</span>
                <span className="text-slate-800 font-bold">
                  {linkedCategory ? `${linkedCategory.name} (${linkedCategory.code})` : 'Unassigned'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400">Target Folder:</span>
                <span className="text-slate-800 font-bold font-mono">
                  {linkedFolder ? `/${linkedFolder.path}` : '/ Root Index'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400">Current Publisher:</span>
                <span className="text-slate-800 font-bold">
                  {ownerUser ? `${ownerUser.first_name} ${ownerUser.last_name}` : 'Unknown'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400">Confidentiality level:</span>
                <span className="text-slate-800 font-bold flex items-center gap-1">
                  {document.is_confidential ? (
                    <span className="text-rose-600 flex items-center gap-0.5">
                      <Lock className="w-3.5 h-3.5" /> High / Sensitive
                    </span>
                  ) : (
                    <span className="text-slate-500">General / Public</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400">Download Permissions:</span>
                <span className="text-slate-800 font-bold">
                  {document.can_download ? 'Unrestricted Digital Copies' : 'Streaming/Read-Only Only'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400">Active Retention Policy:</span>
                <span className="text-slate-800 font-bold">
                  {linkedPolicy ? `${linkedPolicy.name} (${linkedPolicy.duration_value} ${linkedPolicy.duration_unit})` : 'Indefinite Archival Keep'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg md:col-span-2">
                <span className="text-slate-400">Expiration Target:</span>
                <span className="text-slate-800 font-mono font-bold">
                  {document.retention_expiry_date
                    ? new Date(document.retention_expiry_date).toLocaleDateString()
                    : 'System Default Duration Policy applies'}
                </span>
              </div>
            </div>
          </div>

          {/* Versions Table */}
          <DocumentVersionsTable
            versions={versions}
            users={users}
            canDownload={document.can_download !== false}
            onSetCurrentVersion={canModify ? handleSetCurrentVersion : undefined}
          />
        </div>

        {/* Right Column: Active Status summary, Version Preview pane, custom grants */}
        <div className="space-y-6">
          {/* Active status panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Status Summary</h4>
            <div className="flex items-center gap-2">
              {document.status === 'approved' && (
                <div className="h-10 w-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle className="h-5 w-5" />
                </div>
              )}
              {document.status === 'pending' && (
                <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0 animate-pulse">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              )}
              {document.status === 'draft' && (
                <div className="h-10 w-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
              )}
              {document.status === 'rejected' && (
                <div className="h-10 w-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              )}

              <div>
                <p className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                  {document.status} document logs
                </p>
                <p className="text-xs text-slate-400">
                  {document.status === 'approved' && 'Released for digital downloads across corporate nodes.'}
                  {document.status === 'pending' && 'Awaiting managerial audit and workflow approval.'}
                  {document.status === 'draft' && 'Private sandbox draft. Submit a review call when finished.'}
                  {document.status === 'rejected' && 'Audit rejected. Upload a corrected file version.'}
                </p>
              </div>
            </div>

            {/* Quick Live Preview download pane */}
            {currentVersion && (
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 text-xs">
                  <span className="font-semibold text-teal-800 uppercase tracking-wider block mb-1">Active File revision</span>
                  <p className="font-bold text-slate-800 truncate font-mono">{currentVersion.file_name}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">Rev: v{currentVersion.version_number}.0 • Size: {(currentVersion.file_size_bytes / 1024).toFixed(1)} KB</span>
                </div>

                {document.can_download && (
                  <a
                    href={currentVersion.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center block bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2 rounded-lg transition shadow-sm"
                  >
                    Open Active File Release
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Access permissions Card overviews */}
          {currentUser?.role === 'admin' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Security Binds</h4>
                <button
                  type="button"
                  onClick={() => setShowGrantPermissionModal(true)}
                  className="text-teal-600 hover:text-teal-700 font-bold text-xs flex items-center gap-0.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Override Grant
                </button>
              </div>

              <DocumentPermissionsTable
                permissions={permissions}
                users={users}
                onDelete={handleDeletePermission}
              />
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Upload version revision */}
      {showUploadVersionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 transition-opacity">
          <div className="bg-white rounded-xl border border-slate-100 shadow-2xl p-6 max-w-lg w-full relative">
            <button
              onClick={() => setShowUploadVersionModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              &times;
            </button>
            <h3 className="text-base font-bold text-slate-900 border-b pb-2 mb-4">
              Upload Revised Document Stage
            </h3>
            <DocumentVersionCreateForm
              documentId={documentId}
              nextVersionNumber={nextTargetRevNum}
              onCancel={() => setShowUploadVersionModal(false)}
              onSuccess={async () => {
                setShowUploadVersionModal(false);
                await fetchAllDetails();
              }}
            />
          </div>
        </div>
      )}

      {/* MODAL 2: Create specialized security override */}
      {showGrantPermissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 transition-opacity">
          <div className="bg-white rounded-xl border border-slate-100 shadow-2xl p-6 max-w-lg w-full relative">
            <button
              onClick={() => setShowGrantPermissionModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              &times;
            </button>
            <h3 className="text-base font-bold text-slate-900 border-b pb-2 mb-4">
              Add Specialized Security Credentials Binds
            </h3>
            <DocumentPermissionCreateForm
              documentId={documentId}
              onCancel={() => setShowGrantPermissionModal(false)}
              onSuccess={async () => {
                setShowGrantPermissionModal(false);
                await fetchAllDetails();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
