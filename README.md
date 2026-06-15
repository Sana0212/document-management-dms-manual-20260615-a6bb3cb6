# Full app template

Same scaffold as `BaseTemplate` — auth + health APIs wired; **no** dashboard, settings, or notifications (each product adds its own features). See `_hints` folders for backend/frontend creation guides.

## Run (no Firebase required)

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you should see **App is running**.

## Firebase setup

1. Firebase Console → Project settings → Service accounts → **Generate new private key**
2. Save the JSON as `src/config/ServiceAccountKey.json` (see `src/config/README.md`)
3. Copy `.env.example` to `.env` and set:

```env
FIREBASE_CREDENTIALS=src/config/ServiceAccountKey.json
```

4. Restart the dev server
5. Check http://localhost:3000/api/health — expect `"firebase": "connected"`

## Where to add your product

| Area | Hint file |
|------|-----------|
| Feature APIs | `src/app/api/_hints/BACKEND.md` |
| Auth APIs | `src/app/api/auth/HINTS.md` |
| App screens | `src/app/(app)/_hints/FRONTEND.md` |
| Firestore | `src/lib/firestore/BACKEND.md` |

Full walkthrough: `BaseTemplate/docs/guide.md` in this repo.
