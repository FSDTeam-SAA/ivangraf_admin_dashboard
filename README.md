## Sharpos Admin Dashboard

Next.js admin app wired to Sharpos Analytics backend with:
- `next-auth` credentials authentication
- `axios` API client + auth/connection interceptors
- `@tanstack/react-query` data fetching
- `sonner` toast notifications
- `shadcn/ui` components

## Environment

Create `.env` with:

```env
NEXTPUBLICBASEURL=http://localhost:5000
NEXT_PUBLIC_BASE_URL=http://localhost:5000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-long-random-secret
```

`NEXTPUBLICBASEURL` is used as requested for backend base URL.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Flow

1. Login with backend user credentials.
2. Select a database from `Dashboard > Home`.
3. Optional: run sync for active database.
4. Use analytics and list pages from sidebar.