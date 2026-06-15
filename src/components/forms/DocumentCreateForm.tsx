'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { Category, Folder, RetentionPolicy } from '@/data/types';
import { Loader2, Plus, X } from 'lucide-react';

interface DocumentCreateFormProps {
  onSuccess?: (docId: string) => void;
  onCancel?: () => void;
}

export default function DocumentCreateForm({ onSuccess, onCancel }: DocumentCreateFormProps) {
  const router = useRouter();
  const { user } = useSession();

  // Loading states
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  // Form options
  const [categories, setCategories] = useState<Category[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [folderId, setFolderId] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isConfidential, setIsConfidential] = useState(false);
  const [retentionPolicyId, setRetentionPolicyId] = useState('');
  const [canDownload, setCanDownload] = useState(true);

  // File upload states for the initial version
  const [file, setFile] = useState<File | null>(null);
  const [changeNotes, setChangeNotes] = useState('Initial upload');

  // Error/Success state
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFormOptions() {
      try {
        const [categoriesRes, foldersRes, policiesRes] = await Promise.all([
          fetch('/api/categories').then((r) => (r.ok ? r.json() : [])),
          fetch('/api/folders').then((r) => (r.ok ? r.json() : [])),
          fetch('/api/retention_policies').then((r) => (r.ok ? r.json() : [])),
        ]);

        // Handlers for formats (might be raw list or wrap in { data: ... })
        setCategories(Array.isArray(categoriesRes) ? categoriesRes : (categoriesRes.data || []));
        setFolders(Array.isArray(foldersRes) ? foldersRes : (foldersRes.data || []));
        setPolicies(Array.isArray(policiesRes) ? policiesRes : (policiesRes.data || []));
      } catch (err) {
        console.error('Failed to load options', err);
      } finally {
        setInitLoading(false);
      }
    }
    void loadFormOptions();
  }, []);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleaned = tagInput.trim().toLowerCase().replace(/,/g, '');
      if (cleaned && !tags.includes(cleaned)) {
        setTags([...tags, cleaned]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!categoryId) {
      setError('Category is required');
      return;
    }
    if (!file) {
      setError('An initial file attachment is required for version control');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create the Document record
      const docPayload = {
        title,
        description,
        category_id: categoryId,
        folder_id: folderId || undefined,
        owner_user_id: user?.userId || '',
        status: 'draft', // Draft by default, requests approval later
        tags,
        is_confidential: isConfidential,
        retention_policy_id: retentionPolicyId || undefined,
        can_download: canDownload,
      };

      const docRes = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docPayload),
      });

      if (!docRes.ok) {
        const errJson = await docRes.json();
        throw new Error(errJson.error || 'Failed to create document');
      }

      const createdDoc = await docRes.json();
      const documentId = createdDoc.id;

      // 2. Create the Document Version record
      // In a real staging environment, we upload files to storage.
      // Here, we save metadata and a mock file path.
      const versionPayload = {
        document_id: documentId,
        version_number: 1,
        file_path: `/uploads/${Date.now()}_${file.name}`,
        file_name: file.name,
        file_size_bytes: file.size,
        file_mime_type: file.type || 'application/octet-stream',
        is_current: true,
        change_notes: changeNotes || 'Initial upload version',
      };

      const versionRes = await fetch('/api/document_versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(versionPayload),
      });

      if (!versionRes.ok) {
        const errJson = await versionRes.json();
        throw new Error(errJson.error || 'Failed to create document version');
      }

      const createdVersion = await versionRes.json();

      // 3. Link the version we just created back to the document
      await fetch(`/api/documents/${documentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_version_id: createdVersion.id,
        }),
      });

      if (onSuccess) {
        onSuccess(documentId);
      } else {
        router.push(`/documents/${documentId}`);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  const filteredFoldersBySelectedCategory = folders.filter(
    (folder) => folder.category_id === categoryId
  );

  if (initLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-2">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <span className="text-sm text-slate-500">Loading classification directories...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 border-b pb-2 mb-4">
            Document Metadata
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Document Title *
              </label>
              <input
                type="text"
                required
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                placeholder="e.g. FY2024 General Audit Procedure"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Description / Abstract
              </label>
              <textarea
                rows={3}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                placeholder="Brief summary of document scope and contents..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                required
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setFolderId(''); // Reset folder list on category change
                }}
              >
                <option value="">Select a Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Destination Folder
              </label>
              <select
                disabled={!categoryId}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm disabled:opacity-60"
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
              >
                <option value="">Root of Category</option>
                {filteredFoldersBySelectedCategory.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.path})
                  </option>
                ))}
              </select>
              {!categoryId && (
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Please select a Category first to see folders
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Retention Policy
              </label>
              <select
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                value={retentionPolicyId}
                onChange={(e) => setRetentionPolicyId(e.target.value)}
              >
                <option value="">No Retention Policy (Keep Indefinitely)</option>
                {policies.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.duration_value} {p.duration_unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Keywords & Tags
              </label>
              <input
                type="text"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                placeholder="Type and press Enter or comma"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 bg-teal-50 text-teal-800 text-xs font-semibold px-2 py-0.5 rounded-full border border-teal-200"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(idx)}
                        className="hover:bg-teal-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 border-b pb-2 mb-4">
            Security & Compliance Options
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="is_confidential"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  checked={isConfidential}
                  onChange={(e) => setIsConfidential(e.target.checked)}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="is_confidential" className="font-semibold text-slate-700 cursor-pointer">
                  Confidential Storage
                </label>
                <p className="text-slate-500 text-xs">
                  Restricts default viewer roles from searching or viewing details without explicit grant.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="can_download"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  checked={canDownload}
                  onChange={(e) => setCanDownload(e.target.checked)}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="can_download" className="font-semibold text-slate-700 cursor-pointer">
                  Allow Digital Download
                </label>
                <p className="text-slate-500 text-xs">
                  Permit users with read permissions to download files to local storage.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 border-b pb-2 mb-4 animate-pulse-once">
            Upload Initial Version *
          </h3>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition cursor-pointer relative">
              <input
                type="file"
                required
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  const targetFile = e.target.files?.[0];
                  if (targetFile) setFile(targetFile);
                }}
              />
              <div className="space-y-1">
                <p className="text-teal-600 font-bold text-sm">
                  {file ? file.name : 'Click to select or drop document file'}
                </p>
                <p className="text-xs text-slate-400">
                  {file
                    ? `Size: ${(file.size / 1024 / 1024).toFixed(2)} MB • Mime: ${file.type || 'Unknown'}`
                    : 'PDF, DOCX, XLSX, PNG up to 50MB'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Upload Revision Notes
              </label>
              <input
                type="text"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                placeholder="e.g. Initial version for approval review"
                value={changeNotes}
                onChange={(e) => setChangeNotes(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3.5 border-t pt-4">
        <button
          type="button"
          onClick={onCancel ? onCancel : () => router.push('/documents')}
          className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 transition flex items-center gap-1.5 shadow-sm"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>Create Document</span>
        </button>
      </div>
    </form>
  );
}
