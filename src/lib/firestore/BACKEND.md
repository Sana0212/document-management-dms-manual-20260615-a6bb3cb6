# Firestore layer — backend data access

Split reads and writes. API routes call these files; they do not touch Firestore directly.

| File | Contains |
|------|----------|
| `app-data.ts` | `listX`, `getX`, aggregates (dashboard, etc.) |
| `app-writes.ts` | `createX`, `updateX`, `deleteX` |

## First write on a new table

1. Add table in `src/templates/app.ts`
2. Call `ensureAppTables(db)` before first write
3. Use `appCollection(db, 'tableName')` from `src/lib/firebase/collections.ts`

## Example create

```ts
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { appCollection, ensureAppTables } from '@/lib/firebase/collections';

export async function createCustomer(input: { name: string; email: string }, actor: AuthActor) {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const ref = appCollection(db, 'customers').doc();
  await ref.set({
    ...input,
    createdBy: actor.uid,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return { id: ref.id, ...input };
}
```

Add your domain functions here as you build each template.
