# Auth API — same procedure for every template

Implement these routes under `src/app/api/auth/`. Copy from a completed app (e.g. Billing) and keep the same flow.

| Folder | Method | Role |
|--------|--------|------|
| `login/` | POST | Email/password → session cookie; support demo credentials |
| `register/` | POST | Create user in Firestore `users` table; do not auto-login |
| `logout/` | POST | Clear session cookie |
| `me/` | GET | Return current user from cookie |
| `demo/` | POST | Demo sign-in + optional sample data seed |

## Supporting files to add

```text
src/lib/auth/session.ts          Session cookie create/verify
src/lib/auth/user-store.ts       users table read/write
src/lib/auth/verify-request.ts   requireAuth() for other APIs
src/lib/auth/demo-sign-in.ts     Demo user + sample data
src/lib/demo/constants.ts        DEMO_EMAIL, DEMO_PASSWORD
src/hooks/useSession.tsx         Client session provider
```

## Login flow

```text
POST /api/auth/login { email, password }
  → demo credentials? → signInWithDemoAccount()
  → else authenticateUser() from Firestore
  → createSessionToken() → Set-Cookie
  → { data: { user, isDemo? } }
```

## Protecting other APIs

```ts
import { requireAuth } from '@/lib/auth/verify-request';

export async function GET(request: Request) {
  const actor = await requireAuth(request);
  // actor.uid, actor.isDemo
}
```

Auth is **shared** across all templates. Feature APIs (`customers`, `invoices`, …) are **per product**.
