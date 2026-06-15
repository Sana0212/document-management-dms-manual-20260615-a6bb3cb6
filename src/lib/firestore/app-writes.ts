import { getAdminFirestore } from '@/lib/firebase/admin';
import { appCollection, ensureAppTables } from '@/lib/firebase/collections';
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
export async function createUser(data: Omit<UserRecord, 'id' | 'created_at'>): Promise<string> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const ref = appCollection(db, 'users').doc();
  const timestamp = new Date().toISOString();
  await ref.set({
    ...data,
    email: data.email.toLowerCase(),
    created_at: timestamp,
  });
  return ref.id;
}

export async function updateUser(id: string, data: Partial<Omit<UserRecord, 'id' | 'created_at'>>): Promise<void> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const ref = appCollection(db, 'users').doc(id);
  const patch = { ...data };
  if (patch.email) patch.email = patch.email.toLowerCase();
  await ref.update(patch);
}

export async function deleteUser(id: string): Promise<void> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  await appCollection(db, 'users').doc(id).delete();
}

/** DOCUMENTS */
export async function createDocument(data: Omit<DocumentRecord, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const ref = appCollection(db, 'documents').doc();
  const timestamp = new Date().toISOString();
  await ref.set({
    ...data,
    created_at: timestamp,
    updated_at: timestamp,
  });
  return ref.id;
}

export async function updateDocument(id: string, data: Partial<Omit<DocumentRecord, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const ref = appCollection(db, 'documents').doc(id);
  const timestamp = new Date().toISOString();
  await ref.update({
    ...data,
    updated_at: timestamp,
  });
}

export async function deleteDocument(id: string): Promise<void> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  await appCollection(db, 'documents').doc(id).delete();
}

/** DOCUMENT VERSIONS */
export async function createDocumentVersion(data: Omit<DocumentVersionRecord, 'id' | 'uploaded_at'>): Promise<string> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const ref = appCollection(db, 'document_versions').doc();
  const timestamp = new Date().toISOString();

  // If this version is flagged as current, unset current flag on other versions of this document
  if (data.is_current) {
    const snapshot = await appCollection(db, 'document_versions')
      .where('document_id', '==', data.document_id)
      .where('is_current', '==', true)
      .get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { is_current: false });
    });
    await batch.commit();
  }

  await ref.set({
    ...data,
    uploaded_at: timestamp,
  });

  // Automatically link document current_version_id to this new one if current
  if (data.is_current) {
    const docRef = appCollection(db, 'documents').doc(data.document_id);
    await docRef.update({
      current_version_id: ref.id,
      updated_at: timestamp,
    });
  }

  return ref.id;
}

export async function updateDocumentVersion(id: string, data: Partial<Omit<DocumentVersionRecord, 'id' | 'uploaded_at'>>): Promise<void> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const ref = appCollection(db, 'document_versions').doc(id);

  if (data.is_current) {
    const currentVer = await ref.get();
    if (currentVer.exists) {
      const docId = (currentVer.data() as DocumentVersionRecord).document_id;
      const snapshot = await appCollection(db, 'document_versions')
        .where('document_id', '==', docId)
        .where('is_current', '==', true)
        .get();
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        if (doc.id !== id) {
          batch.update(doc.ref, { is_current: false });
        }
      });
      await batch.commit();

      const docRef = appCollection(db, 'documents').doc(docId);
      await docRef.update({
        current_version_id: id,
        updated_at: new Date().toISOString(),
      });
    }
  }

  await ref.update(data);
}

export async function deleteDocumentVersion(id: string): Promise<void> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  await appCollection(db, 'document_versions').doc(id).delete();
}

/** APPROVALS */
export async function createApproval(data: Omit<ApprovalRecord, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const ref = appCollection(db, 'approvals').doc();
  const timestamp = new Date().toISOString();
  await ref.set({
    ...data,
    created_at: timestamp,
    updated_at: timestamp,
  });
  return ref.id;
}

export async function updateApproval(id: string, data: Partial<Omit<ApprovalRecord, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const ref = appCollection(db, 'approvals').doc(id);
  const timestamp = new Date().toISOString();
  await ref.update({
    ...data,
    updated_at: timestamp,
  });
}

export async function deleteApproval(id: string): Promise<void> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  await appCollection(db, 'approvals').doc(id).delete();
}

/** CATEGORIES */
export async function createCategory(data: Omit<CategoryRecord, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const ref = appCollection(db, 'categories').doc();
  const timestamp = new Date().toISOString();
  await ref.set({
    ...data,
    created_at: timestamp,
    updated_at: timestamp,
  });
  return ref.id;
}

export async function updateCategory(id: string, data: Partial<Omit<CategoryRecord, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const ref = appCollection(db, 'categories').doc(id);
  const timestamp = new Date().toISOString();
  await ref.update({
    ...data,
    updated_at: timestamp,
  });
}

export async function deleteCategory(id: string): Promise<void> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  await appCollection(db, 'categories').doc(id).delete();
}

/** FOLDERS */
export async function createFolder(data: Omit<FolderRecord, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const ref = appCollection(db, 'folders').doc();
  const timestamp = new Date().toISOString();
  await ref.set({
    ...data,
    created_at: timestamp,
    updated_at: timestamp,
  });
  return ref.id;
}

export async function updateFolder(id: string, data: Partial<Omit<FolderRecord, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const ref = appCollection(db, 'folders').doc(id);
  const timestamp = new Date().toISOString();
  await ref.update({
    ...data,
    updated_at: timestamp,
  });
}

export async function deleteFolder(id: string): Promise<void> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  await appCollection(db, 'folders').doc(id).delete();
}

/** RETENTION POLICIES */
export async function createRetentionPolicy(data: Omit<RetentionPolicyRecord, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const ref = appCollection(db, 'retention_policies').doc();
  const timestamp = new Date().toISOString();
  await ref.set({
    ...data,
    created_at: timestamp,
    updated_at: timestamp,
  });
  return ref.id;
}

export async function updateRetentionPolicy(id: string, data: Partial<Omit<RetentionPolicyRecord, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const ref = appCollection(db, 'retention_policies').doc(id);
  const timestamp = new Date().toISOString();
  await ref.update({
    ...data,
    updated_at: timestamp,
  });
}

export async function deleteRetentionPolicy(id: string): Promise<void> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  await appCollection(db, 'retention_policies').doc(id).delete();
}

/** DOCUMENT PERMISSIONS */
export async function createDocumentPermission(data: Omit<DocumentPermissionRecord, 'id' | 'created_at'>): Promise<string> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const ref = appCollection(db, 'document_permissions').doc();
  const timestamp = new Date().toISOString();
  await ref.set({
    ...data,
    created_at: timestamp,
  });
  return ref.id;
}

export async function updateDocumentPermission(id: string, data: Partial<Omit<DocumentPermissionRecord, 'id' | 'created_at'>>): Promise<void> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const ref = appCollection(db, 'document_permissions').doc(id);
  await ref.update(data);
}

export async function deleteDocumentPermission(id: string): Promise<void> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  await appCollection(db, 'document_permissions').doc(id).delete();
}

/** SETTINGS */
export async function createSetting(data: Omit<SettingRecord, 'id' | 'updated_at'>): Promise<string> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const ref = appCollection(db, 'settings').doc();
  const timestamp = new Date().toISOString();
  await ref.set({
    ...data,
    updated_at: timestamp,
  });
  return ref.id;
}

export async function updateSetting(id: string, data: Partial<Omit<SettingRecord, 'id' | 'updated_at'>>): Promise<void> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const ref = appCollection(db, 'settings').doc(id);
  const timestamp = new Date().toISOString();
  await ref.update({
    ...data,
    updated_at: timestamp,
  });
}

export async function updateSettingByKey(key: string, value: string, updatedByUserId: string): Promise<void> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const snapshot = await appCollection(db, 'settings').where('key', '==', key).limit(1).get();
  const timestamp = new Date().toISOString();
  if (snapshot.empty) {
    const ref = appCollection(db, 'settings').doc();
    await ref.set({
      key,
      value,
      category: 'general',
      updated_by_user_id: updatedByUserId,
      updated_at: timestamp,
    });
  } else {
    const doc = snapshot.docs[0];
    await doc.ref.update({
      value,
      updated_by_user_id: updatedByUserId,
      updated_at: timestamp,
    });
  }
}

export async function deleteSetting(id: string): Promise<void> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  await appCollection(db, 'settings').doc(id).delete();
}
