import { getAdminFirestore } from '@/lib/firebase/admin';
import { appCollection } from '@/lib/firebase/collections';
import { UserRecord } from '@/data/types';
import * as crypto from 'crypto';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const db = getAdminFirestore();
  const snapshot = await appCollection(db, 'users')
    .where('email', '==', email.toLowerCase())
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as UserRecord;
}
