'use client';

import React, { useState } from 'react';
import { useSession } from '@/hooks/useSession';
import { Loader2 } from 'lucide-react';

interface DocumentVersionCreateFormProps {
  documentId: string;
  nextVersionNumber: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function DocumentVersionCreateForm({
  documentId,
  nextVersionNumber,
  onSuccess,
  onCancel,
}: DocumentVersionCreateFormProps) {
  const { user } = useSession();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [changeNotes, setChangeNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a replacement file to upload as the new revision.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Submit the new Version record (re-versioning structure)
      const versionPayload = {
        document_id: documentId,
        version_number: nextVersionNumber,
        file_path: `/uploads/${Date.now()}_${file.name}`,
        file_name: file.name,
        file_size_bytes: file.size,
        file_mime_type: file.type || 'application/octet-stream',
        is_current: true,
        change_notes: changeNotes || `Updated to revision v${nextVersionNumber}`,
      };

      const versionRes = await fetch('/api/document_versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(versionPayload),
      });

      if (!versionRes.ok) {
        const errJson = await versionRes.json();
        throw new Error(errJson.error || 'Failed to submit document version record');
      }

      const createdVersion = await versionRes.json();

      // 2. Put old versions to is_current = false, and update parent Document pointer to refer to this new version
      const docUpdatePayload = {
        current_version_id: createdVersion.id,
        updated_by_user_id: user?.userId || '',
        updated_at: new Date().toISOString(),
      };

      const docUpdateRes = await fetch(`/api/documents/${documentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docUpdatePayload),
      });

      if (!docUpdateRes.ok) {
        const errJson = await docUpdateRes.json();
        throw new Error(errJson.error || 'Failed to update parent document reference link');
      }

      if (onSuccess) {
        onSuccess();
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
        <div className="p-3.5 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Target Version Number
          </label>
          <input
            type="text"
            disabled
            className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 font-mono text-sm"
            value={`v${nextVersionNumber}.0 (Automatic Revision Stage)`}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Replacement File Attachment *
          </label>
          <div className="border border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition cursor-pointer relative">
            <input
              type="file"
              required
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => {
                const targetFile = e.target.files?.[0];
                if (targetFile) setFile(targetFile);
              }}
            />
            <p className="text-teal-600 font-bold text-sm">
              {file ? file.name : 'Select updated file...'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {file
                ? `Size: ${(file.size / 1024).toFixed(1)} KB • Mime: ${file.type || 'Unknown'}`
                : 'Click to select newer revision file'}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Revision / Change Log Comments *
          </label>
          <textarea
            required
            rows={2}
            className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
            placeholder="Describe what changed in this version (e.g. Added section 4.2 compliance clauses)"
            value={changeNotes}
            onChange={(e) => setChangeNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>Upload Version {nextVersionNumber}.0</span>
        </button>
      </div>
    </form>
  );
}
