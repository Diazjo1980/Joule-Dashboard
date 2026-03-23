# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # Install dependencies
npm start         # Dev server at http://localhost:3000
npm run build     # Production build → /build
npm test          # Run tests
```

## Architecture

This is a React 18 + Supabase SPA deployed on Netlify. It manages SAP Joule + SAP Ariba activation projects for consultants and admins.

**Stack**: React 18 (hooks), Supabase (PostgreSQL + Auth), jsPDF, Create React App, Netlify serverless functions.

### Key files

- `src/App.jsx` — Monolithic ~1000+ line component containing all views and logic
- `src/lib/supabase.js` — Supabase client (uses publishable key, safe for frontend)
- `src/lib/pdfReport.js` — PDF report generation (single-client and consolidated)
- `src/lib/checklistTemplate.js` — Predefined SAP activation checklist templates (~60+ steps)
- `src/i18n.js` — Spanish/English translations for all UI text
- `src/data.js` — Default data and color schemes
- `netlify/functions/admin-users.js` — Serverless function for admin user management; requires `SUPABASE_SERVICE_ROLE_KEY` env var

### Database schema (Supabase)

Core tables: `profiles` (extends auth.users with role: admin/consultant), `clients`, `client_assignments` (many-to-many with role: primary/specialist/backup), `client_checklist`, `client_tasks`, `client_resources`.

Row-Level Security: admins see all data; consultants see only assigned clients.

Migration files: `supabase-migration-sr.sql` (ServiceNow SRs), `supabase-migration-substeps.sql` (checklist sub-steps).

### Data flow

1. User authenticates via Supabase Auth
2. Profile + assigned clients loaded on login
3. Selecting a client fetches checklist, tasks, resources, service requests from Supabase
4. All CRUD operations persist to Supabase in real-time
5. PDFs generated client-side with jsPDF

### Views inside App.jsx

- `LoginView` — email/password auth
- `ClientListView` — shows assigned projects per consultant
- Client dashboard with 4 tabs: Overview, Checklist, Tasks, Resources
- Admin panel — user management (create/delete/reset password) via the Netlify function

### Styling

Pure inline CSS throughout — no CSS framework. Design tokens: DM Sans + DM Mono fonts. No ESLint, Prettier, or TypeScript configured.
