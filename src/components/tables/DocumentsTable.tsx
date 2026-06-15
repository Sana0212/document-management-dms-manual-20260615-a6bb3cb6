'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Document, Category, Folder, User } from '@/data/types';
import { 
  Eye, 
  Edit2, 
  Trash2, 
  Lock, 
  Unlock, 
  ArrowUpRight, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Archive,
  DownloadCloud,
  FileCheck
} from 'lucide-react';

interface DocumentsTableProps {
  documents: Document[];
  categories: Category[];
  folders: Folder[];
  users: User[];
  onDelete?: (id: string) => void;
  onRequestApproval?: (id: string) => void;
}

export default function DocumentsTable({
  documents,
  categories,
  folders,
  users,
  onDelete,
  onRequestApproval,
}: DocumentsTableProps) {
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterConfidential, setFilterConfidential] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Helper resolvers
  const getCategoryName = (id: string) => {
    const found = categories.find((c) => c.id === id);
    return found ? `${found.name} (${found.code})` : 'Unassigned Category';
  };

  const getFolderName = (id?: string) => {
    if (!id) return '/ Root';
    const found = folders.find((f) => f.id === id);
    return found ? `/${found.path}` : 'Unknown Location';
  };

  const getOwnerName = (id: string) => {
    const found = users.find((u) => u.id === id);
    return found ? `${found.first_name} ${found.last_name}` : 'Unknown User';
  };

  // Filter application
  const filtered = documents.filter((doc) => {
    const catMatch = !filterCategory || doc.category_id === filterCategory;
    const statusMatch = !filterStatus || doc.status === filterStatus;
    const confMatch =
      !filterConfidential ||
      (filterConfidential === 'yes' ? doc.is_confidential : !doc.is_confidential);

    const matchQuery =
      !searchQuery ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.tags && doc.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    return catMatch && statusMatch && confMatch && matchQuery;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5" />
            Draft
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            Pending Approval
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            <CheckCircle className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
            <Archive className="w-3.5 h-3.5" />
            Archived
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Dynamic inline filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by title, abstract or tag keyword..."
              className="w-full px-3.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs text-slate-600"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs text-slate-600"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved & Published</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
            </select>

            <select
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs text-slate-600"
              value={filterConfidential}
              onChange={(e) => setFilterConfidential(e.target.value)}
            >
              <option value="">Any Confidentiality</option>
              <option value="yes">Confidential Only</option>
              <option value="no">Public Access Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-[#f8fafc] text-[#475569] font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5 font-semibold text-xs tracking-wider uppercase">Document Info</th>
                <th className="px-6 py-3.5 font-semibold text-xs tracking-wider uppercase">Classification</th>
                <th className="px-6 py-3.5 font-semibold text-xs tracking-wider uppercase">Owner</th>
                <th className="px-6 py-3.5 font-semibold text-xs tracking-wider uppercase">Confidential</th>
                <th className="px-6 py-3.5 font-semibold text-xs tracking-wider uppercase">Status</th>
                <th className="px-6 py-3.5 font-semibold text-xs tracking-wider uppercase">Created At</th>
                <th className="px-6 py-3.5 font-semibold text-xs tracking-wider uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <FileCheck className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-base mb-1">No documents found matching conditions</p>
                    <p className="text-xs text-slate-400">Try adjusting your filters or upload a new classification record.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <Link
                          href={`/documents/${doc.id}`}
                          className="font-bold text-slate-900 group-hover:text-teal-600 transition flex items-center gap-1"
                        >
                          {doc.title}
                          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition text-teal-600" />
                        </Link>
                        {doc.description && (
                          <span className="text-xs text-slate-500 line-clamp-1 max-w-sm mt-0.5">
                            {doc.description}
                          </span>
                        )}
                        {doc.tags && doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {doc.tags.map((tg, i) => (
                              <span
                                key={i}
                                className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.2 rounded-full border border-slate-200"
                              >
                                {tg}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs space-y-0.5">
                        <span className="font-semibold text-slate-700">
                          {getCategoryName(doc.category_id)}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {getFolderName(doc.folder_id)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-slate-700">
                        {getOwnerName(doc.owner_user_id)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {doc.is_confidential ? (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-semibold text-xs bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
                          <Lock className="h-3 w-3" /> Confidential
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 text-xs px-2 py-0.5">
                          <Unlock className="h-3 w-3 text-slate-400" /> General
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(doc.status)}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                      {doc.created_at ? new Date(doc.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        {/* Request Approval workflow trigger (if in draft/rejected state) */}
                        {onRequestApproval && (doc.status === 'draft' || doc.status === 'rejected') && (
                          <button
                            onClick={() => onRequestApproval(doc.id!)}
                            className="bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-xs font-bold text-slate-700 px-2 py-1 rounded border border-slate-200 transition"
                            title="Request executive workflow approval signature"
                          >
                            Submit Approval
                          </button>
                        )}

                        <Link
                          href={`/documents/${doc.id}`}
                          className="p-1 px-1.5 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/documents/${doc.id}/edit`}
                          className="p-1 px-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition"
                          title="Edit Document"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        {onDelete && (
                          <button
                            onClick={() => {
                              if (confirm('Are you absolutely sure you want to permanently delete this document listing AND all of its revisions?')) {
                                onDelete(doc.id!);
                              }
                            }}
                            className="p-1 px-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded transition"
                            title="Purge Document"
                          >
                            <Trash2 className="w-4 h-4" />
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
    </div>
  );
}
