# TrackMe — Dashboard (Frontend)

React/Vite single-page app for the TrackMe employee monitoring platform.
This repo contains **only** the dashboard. The backend API lives in a
separate repository.

## Tech stack

- **React 18** + **TypeScript**
- **Vite** (build tool / dev server)
- **Tailwind CSS** + Radix UI
- **Zustand** (state) · **Axios** (HTTP) · **Recharts** (charts)
- **Vitest** + Playwright (tests)

## Getting started

```bash
npm install
cp .env.example .env       # fill in VITE_API_URL etc.
npm run dev                # http://localhost:5173
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright end-to-end tests |

## Environment variables

See `.env.example`. Minimum required:

```
VITE_API_URL=https://your-backend-host
```

## Deployment

Deploys to **Vercel** out of the box (`vercel.json` is included).
Connect the repo on vercel.com — build command is `npm run build`,
output directory `dist/`.

## Related

- Backend repo: TrackMe backend (FastAPI on Railway) — separate repository.
