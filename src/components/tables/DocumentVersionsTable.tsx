'use client';

import React from 'react';
import { DocumentVersion, User } from '@/data/types';
import { 
  FileText, 
  User as UserIcon, 
  Calendar, 
  HardDrive, 
  Download, 
  ExternalLink,
  CheckCircle,
  FileCheck
} from 'lucide-react';

interface DocumentVersionsTableProps {
  versions: DocumentVersion[];
  users: User[];
  canDownload: boolean;
  onSetCurrentVersion?: (versionId: string) => void;
}

export default function DocumentVersionsTable({
  versions,
  users,
  canDownload,
  onSetCurrentVersion,
}: DocumentVersionsTableProps) {
  
  const getUserName = (id: string) => {
    const found = users.find((u) => u.id === id);
    return found ? `${found.first_name} ${found.last_name}` : 'Unknown User';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Sort versions by descending version number
  const sortedVersions = [...versions].sort((a, b) => b.version_number - a.version_number);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-[#f8fafc] flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <HardDrive className="h-4 w-4 text-teal-600" />
          Version History & Changelog ({versions.length} revision{versions.length === 1 ? '' : 's'})
        </h4>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-[#f8fafc]/50 text-slate-500 font-semibold border-b border-slate-100">
            <tr>
              <th className="px-5 py-3 text-xs tracking-wider uppercase">Rev</th>
              <th className="px-5 py-3 text-xs tracking-wider uppercase">File Name</th>
              <th className="px-5 py-3 text-xs tracking-wider uppercase">Attached Info</th>
              <th className="px-5 py-3 text-xs tracking-wider uppercase">Uploaded By</th>
              <th className="px-5 py-3 text-xs tracking-wider uppercase">Timeline Notes</th>
              <th className="px-5 py-3 text-xs tracking-wider uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedVersions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400 text-xs">
                  No version logs tracked under this metadata container card.
                </td>
              </tr>
            ) : (
              sortedVersions.map((ver) => (
                <tr
                  key={ver.id}
                  className={`transition-colors ${
                    ver.is_current ? 'bg-teal-50/20 font-medium' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border">
                        v{ver.version_number}.0
                      </span>
                      {ver.is_current && (
                        <span className="inline-flex items-center gap-1 bg-teal-100 text-teal-800 text-[10px] font-bold px-1.5 py-0.2 rounded uppercase border border-teal-200">
                          <CheckCircle className="h-3 w-3" /> CURRENT
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 max-w-xs md:max-w-md">
                      <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-slate-800 truncate text-xs font-semibold" title={ver.file_name}>
                          {ver.file_name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {formatBytes(ver.file_size_bytes)} &bull; {ver.file_mime_type}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {ver.checksum ? (
                      <span title={`Checksum: ${ver.checksum}`}>MD5: {ver.checksum.slice(0, 12)}...</span>
                    ) : (
                      <span className="text-slate-300">No checksum stamp</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-600 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                      <span>{getUserName(ver.uploaded_by_user_id)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-xs">
                      <p className="text-slate-700 italic line-clamp-2">
                        {ver.change_notes || 'No change notes provided.'}
                      </p>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        {new Date(ver.uploaded_at).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2 text-xs">
                      {/* Download mechanism */}
                      {canDownload ? (
                        <a
                          href={ver.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-teal-600 font-bold hover:underline bg-teal-50 px-2 py-1 rounded hover:bg-teal-100 transition"
                          title="Open or download revision file"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded border">
                          Locked
                        </span>
                      )}

                      {/* Set current version rollback */}
                      {!ver.is_current && onSetCurrentVersion && (
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Are you sure you want to promote v${ver.version_number}.0 to be the active CURRENT system version?`
                              )
                            ) {
                              onSetCurrentVersion(ver.id!);
                            }
                          }}
                          className="text-slate-700 hover:text-white hover:bg-teal-600 bg-slate-100 p-1 px-1.5 rounded transition"
                          title="Promote / Rollback to this version"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
