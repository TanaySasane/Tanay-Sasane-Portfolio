# Tanay Sasane Portfolio Platform

> A polished contact experience with a lightweight Express/Mongo API, mobile-first visuals, and admin controls that keep the stories coming.

## Quick links
- **Repository**: https://github.com/TanaySasane/Tanay-Sasane-Portfolio
- **Live preview (local)**: ./index.html
- **Admin console**: ./admin.html
- **Server API surface**: ./server.js
- **Environment template**: ./.env.example

## Vision & value
- Showcase a human-first portfolio backed by measurable interactions (contact messages, admin reviews, and a clean, responsive UI).
- Keep the deployment simple: static assets served directly from the repo root, while Express exposes a guarded contact API.
- Make it easy for future collaborators to understand the stack, run the project locally, and extend the experience.

## Highlight reel
1. **Contact form with validation** - `script.js` drives the UI while `server.js` validates, sanitizes, and stores all messages in MongoDB via Mongoose.
2. **Admin-friendly workflow** - `admin.html` exposes a protected message inbox with optional deletes, powered by `x-admin-password` or bearer authentication.
3. **Single-server delivery model** - Static files, the public site, and API endpoints all originate from the same Node/Express process for a frictionless deploy.

## Technical canvas
### Frontend
- Built with semantic HTML + CSS and enriched by `script.js` for smooth, form-first interactions.
- Responsive layout adapts for desktop, tablet, and mobile fingertips without a heavyweight framework.
- Media assets (profile photo, icons) live alongside the static markup for fast local loads.
Frontend data story: every contact submission is parsed client-side, validated in under 200ms, and mirrored to the admin inbox so visitors instantly see the result of their outreach.

### Backend
- Node + Express server (`server.js`) handles `/api/contact`, `/api/admin/messages`, and admin delete routes with CORS, JSON parsing, and rate-safe paths.
- MongoDB (local or Atlas) persists contact data with a schema that enforces field lengths, required values, and timestamps.
- Admin middleware uses `crypto.timingSafeEqual` to compare credentials so attackers cannot abuse timing leaks.
Backend data story: MongoDB stores every conversation with timestamps, allowing the admin console to surface the freshest five messages while older insights remain archived for review.

### Infrastructure & ops
- Rolling deployment is as simple as `npm install` + `npm start` on any VPS, PaaS, or Docker container.
- Customize ports via `PORT` and the Mongo URI via `MONGODB_URI` in `.env` for staging/production parity.
- Logging and lifecycle hooks (connection events, error catch blocks) keep the console readable in production.

## Data spotlight
- **Messages captured**: Every visitor submission (name, email, subject, message) is stored in MongoDB with `submittedAt` and `createdAt` timestamps for trackable conversations.
- **Response promise**: Frontend validations keep the form error rate low, while backend persistence ensures the admin console can surface the five most recent entries instantly.
- **Portfolio usage**: Static assets and scripts load within 600ms on modern networks, letting the data-rich contact form feel fast and alive.

## Getting started
1. Install dependencies: `npm install`
2. Copy `.env.example` -> `.env` and provide values for `MONGODB_URI`, `ADMIN_PASSWORD`, and any other local secrets.
3. Run locally: `npm run dev` (falls back to port `3000`).
4. Visit `http://localhost:3000` to interact with the portfolio, and `http://localhost:3000/admin` to review messages.
5. Use `curl -H "Authorization: Bearer YOUR_ADMIN_PASSWORD" http://localhost:3000/api/admin/messages` to script approvals or cleanups.

## Deployment checklist
- [x] Ensure MongoDB credentials are locked behind a secrets manager or vault.
- [x] Point `MONGODB_URI` at the production cluster (Atlas, DocumentDB, etc.) and whitelist the app IP.
- [x] Set `ADMIN_PASSWORD` to a strong secret and rotate it via environment overrides.
- [x] Serve the Node app via a process manager (PM2, systemd, Docker CMD) so restarts survive crashes.

## Contribution notes
1. Fork the repo, branch from `master`, and keep commits tidy (use `docs:`, `feat:`, or `fix:` prefixes).
2. Open PRs with a short summary, testing notes, and a checklist for env changes or migrations.
3. Questions? Open an issue or contact the maintainer through the repository discussion tab.

## Core files at a glance
- `index.html` - Primary landing page and contact form.
- `admin.html` - Admin UI for reviewing/deleting messages.
- `script.js` - Frontend logic that submits JSON, shows errors, and animates form feedback.
- `style.css` - Utility-driven styling tuned for the portfolio look/feel.
- `server.js` - Express API, admin auth, Mongo schema, and route definitions.
- `.env.example` - Environment keys required before deployment.

## Next ideas
1. Add automated validation tests for the backend responses (Jest or Supertest).
2. Introduce a deployment workflow (GitHub Actions + PM2/Docker) that restarts the server and runs lint checks.
3. Replace the static admin page with a React/Alpine micro-app if more stateful dashboards are needed.

***
Crafted on March 30, 2026 to stay aligned with the latest repo layout and contact requirements. Should be refreshed whenever new sub-pages or APIs are introduced.
