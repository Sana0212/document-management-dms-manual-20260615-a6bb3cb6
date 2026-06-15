import { getAdminFirestore } from '@/lib/firebase/admin';
import { appCollection } from '@/lib/firebase/collections';
import {
  UserRecord,
  DocumentRecord,
  DocumentVersionRecord,
  ApprovalRecord,
  CategoryRecord,
  FolderRecord,
  RetentionPolicyRecord,
  DocumentPermissionRecord,
  SettingRecord,
} from '@/data/types';

/** USERS */
export async function listUsers(): Promise<UserRecord[]> {
  const db = getAdminFirestore();
  const snapshot = await appCollection(db, 'users').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as UserRecord));
}

export async function getUser(id: string): Promise<UserRecord | null> {
  const db = getAdminFirestore();
  const doc = await appCollection(db, 'users').doc(id).get();
  return doc.exists ? ({ id: doc.id, ...doc.data() } as UserRecord) : null;
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const db = getAdminFirestore();
  const snapshot = await appCollection(db, 'users').where('email', '==', email.toLowerCase()).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as UserRecord;
}

/** DOCUMENTS */
export async function listDocuments(): Promise<DocumentRecord[]> {
  const db = getAdminFirestore();
  const snapshot = await appCollection(db, 'documents').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as DocumentRecord));
}

export async function getDocument(id: string): Promise<DocumentRecord | null> {
  const db = getAdminFirestore();
  const doc = await appCollection(db, 'documents').doc(id).get();
  return doc.exists ? ({ id: doc.id, ...doc.data() } as DocumentRecord) : null;
}

/** DOCUMENT VERSIONS */
export async function listDocumentVersions(): Promise<DocumentVersionRecord[]> {
  const db = getAdminFirestore();
  const snapshot = await appCollection(db, 'document_versions').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as DocumentVersionRecord));
}

export async function getDocumentVersion(id: string): Promise<DocumentVersionRecord | null> {
  const db = getAdminFirestore();
  const doc = await appCollection(db, 'document_versions').doc(id).get();
  return doc.exists ? ({ id: doc.id, ...doc.data() } as DocumentVersionRecord) : null;
}

export async function getVersionsForDocument(documentId: string): Promise<DocumentVersionRecord[]> {
  const db = getAdminFirestore();
  const snapshot = await appCollection(db, 'document_versions')
    .where('document_id', '==', documentId)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as DocumentVersionRecord));
}

/** APPROVALS */
export async function listApprovals(): Promise<ApprovalRecord[]> {
  const db = getAdminFirestore();
  const snapshot = await appCollection(db, 'approvals').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ApprovalRecord));
}

export async function getApproval(id: string): Promise<ApprovalRecord | null> {
  const db = getAdminFirestore();
  const doc = await appCollection(db, 'approvals').doc(id).get();
  return doc.exists ? ({ id: doc.id, ...doc.data() } as ApprovalRecord) : null;
}

/** CATEGORIES */
export async function listCategories(): Promise<CategoryRecord[]> {
  const db = getAdminFirestore();
  const snapshot = await appCollection(db, 'categories').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CategoryRecord));
}

export async function getCategory(id: string): Promise<CategoryRecord | null> {
  const db = getAdminFirestore();
  const doc = await appCollection(db, 'categories').doc(id).get();
  return doc.exists ? ({ id: doc.id, ...doc.data() } as CategoryRecord) : null;
}

/** FOLDERS */
export async function listFolders(): Promise<FolderRecord[]> {
  const db = getAdminFirestore();
  const snapshot = await appCollection(db, 'folders').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FolderRecord));
}

export async function getFolder(id: string): Promise<FolderRecord | null> {
  const db = getAdminFirestore();
  const doc = await appCollection(db, 'folders').doc(id).get();
  return doc.exists ? ({ id: doc.id, ...doc.data() } as FolderRecord) : null;
}

/** RETENTION POLICIES */
export async function listRetentionPolicies(): Promise<RetentionPolicyRecord[]> {
  const db = getAdminFirestore();
  const snapshot = await appCollection(db, 'retention_policies').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as RetentionPolicyRecord));
}

export async function getRetentionPolicy(id: string): Promise<RetentionPolicyRecord | null> {
  const db = getAdminFirestore();
  const doc = await appCollection(db, 'retention_policies').doc(id).get();
  return doc.exists ? ({ id: doc.id, ...doc.data() } as RetentionPolicyRecord) : null;
}

/** DOCUMENT PERMISSIONS */
export async function listDocumentPermissions(): Promise<DocumentPermissionRecord[]> {
  const db = getAdminFirestore();
  const snapshot = await appCollection(db, 'document_permissions').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as DocumentPermissionRecord));
}

export async function getDocumentPermission(id: string): Promise<DocumentPermissionRecord | null> {
  const db = getAdminFirestore();
  const doc = await appCollection(db, 'document_permissions').doc(id).get();
  return doc.exists ? ({ id: doc.id, ...doc.data() } as DocumentPermissionRecord) : null;
}

export async function getPermissionsForDocument(documentId: string): Promise<DocumentPermissionRecord[]> {
  const db = getAdminFirestore();
  const snapshot = await appCollection(db, 'document_permissions')
    .where('document_id', '==', documentId)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as DocumentPermissionRecord));
}

/** SETTINGS */
export async function listSettings(): Promise<SettingRecord[]> {
  const db = getAdminFirestore();
  const snapshot = await appCollection(db, 'settings').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as SettingRecord));
}

export async function getSetting(id: string): Promise<SettingRecord | null> {
  const db = getAdminFirestore();
  const doc = await appCollection(db, 'settings').doc(id).get();
  return doc.exists ? ({ id: doc.id, ...doc.data() } as SettingRecord) : null;
}

export async function getSettingByKey(key: string): Promise<SettingRecord | null> {
  const db = getAdminFirestore();
  const snapshot = await appCollection(db, 'settings').where('key', '==', key).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as SettingRecord;
}
