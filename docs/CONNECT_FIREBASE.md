# Connect Firebase — DocuFlow DMS

This app was generated without Firebase credentials. To go live with real data:

1. Create a Firebase project and enable Firestore.
2. Download a service account JSON key.
3. Set environment variables:

```env
FIREBASE_CREDENTIALS=src/config/ServiceAccountKey.json
SESSION_SECRET=your-random-secret
```

Or in production:

```env
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
SESSION_SECRET=your-random-secret
```

4. Restart the app and open `/api/health` — expect `"firebase": "connected"`.

Never commit `ServiceAccountKey.json` or real secrets to GitHub.
