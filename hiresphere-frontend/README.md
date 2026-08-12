# HireSphere AI — Frontend (Phases 2–5: Landing + Auth, Candidate Dashboard, Recruiter Dashboard, Admin Dashboard)

React + Vite + Tailwind + Framer Motion frontend, connected to the Phase 1 Django backend.

## Design identity

AI-driven candidate/job matching is the product, so the visual language is built around it directly:

- **Signature element** — "Match Constellation": an animated node graph (candidate ↔ job, connected by a pulsing gradient line with a live match %, orbited by skill chips). It's the hero visual and recurs on the 404 page at smaller scale.
- **Palette** — deep indigo-black base (`#0B0E1A`) with signal violet (`#7C6FFF`), match teal (`#2DD4BF`, reserved for match/success states), and spark amber (`#FFB454`, reserved for primary CTAs only).
- **Type** — Space Grotesk (display) + Inter (body) + JetBrains Mono (stats, scores, percentages — reinforces that these are data, not decoration).

## What's included

- Sticky navbar with mobile menu, footer with newsletter form
- Full landing page: Hero (with the Match Constellation), Trusted-by strip, animated count-up stats, feature grid, How It Works (3-step, justified numbered sequence), testimonials, pricing tiers, FAQ accordion, newsletter capture
- Auth pages wired to the real Phase 1 API: Login, Candidate Registration, Recruiter Registration (with approval notice), Forgot Password — all with React Hook Form validation and toast feedback
- Redux Toolkit auth slice with localStorage persistence
- Axios client with automatic JWT refresh-on-401 and a request queue during refresh
- Scroll-reveal and count-up animation primitives reused throughout
- 404 page
- Verified: `npm run build` completes cleanly (536 modules, no errors) and `vite preview` serves the build correctly

## Setup

```bash
cd hiresphere-frontend
cp .env.example .env   # points at http://localhost:8000/api by default
npm install
npm run dev             # http://localhost:5173
```

Requires the Phase 1 backend running (`docker compose up` in the backend project) for the auth forms to actually authenticate.

## Structure

```
src/
  api/client.js          — Axios instance, JWT refresh interceptor, service layer (authApi, jobsApi, companiesApi)
  store/                 — Redux Toolkit (authSlice, persisted to localStorage)
  hooks/useAuth.js
  components/
    layout/               — Navbar, Footer, AuthLayout
    ui/                    — ScrollReveal, CountUp, FormField (reused across pages)
    landing/               — Hero, MatchConstellation, Features, HowItWorks, Testimonials, Pricing, FAQ, Newsletter, TrustedBy, Stats
  pages/
    landing/LandingPage.jsx
    auth/                  — LoginPage, RegisterCandidatePage, RegisterRecruiterPage, ForgotPasswordPage
    NotFoundPage.jsx
```

## Phase 3: Candidate dashboard

Added under `/candidate/*`, protected by role (`ProtectedRoute` redirects to `/login` if unauthenticated, or `/` if the wrong role):

- **DashboardLayout** — sidebar nav (desktop) / slide-out drawer (mobile), topbar, user card with logout
- **Dashboard home** — animated profile-completion ring, stat cards, recommended jobs (skill-overlap from the backend), recent applications with status pills, empty states for both
- **Job search** — search bar, filter sidebar (location, job type, work mode, experience level; collapses to a full-screen sheet on mobile), infinite scroll via `IntersectionObserver` + React Query's `useInfiniteQuery`, loading skeletons
- **Job detail** — full posting view, save/unsave, one-click apply (using the candidate's most recent resume), applied-state confirmation
- **Saved jobs** — bookmarked listings with empty state
- **Applications** — status-filterable list with each application's full status-history timeline (backed by `ApplicationStatusHistory` from Phase 1)
- **Profile** — drag-and-drop PDF resume upload (kicks off the backend's async parsing), resume list with parse status, editable profile form (headline, bio, location, links, experience)

Verified: `npm run build` — 546 modules, zero errors.

## Phase 4: Recruiter dashboard

Added under `/recruiter/*`, same `DashboardLayout` shell (now role-aware — picks candidate or recruiter nav automatically):

- **Dashboard home** — active job posts, total applicants, total views, recent jobs list
- **My Jobs** — draft/published/closed job posts with publish/edit/delete actions
- **Job form** — single create/edit form (title, category, type, work mode, experience level, location, salary range, description, responsibilities, requirements); new jobs save as draft, publish separately
- **Applicant pipeline** — Kanban-style board (Applied → Under Review → Shortlisted → Interview → Offered → Hired / Rejected), each card has one-click status transitions that match what's actually legal in the backend's `Application.Status` flow, plus mailto and resume-view links
- **Interviews** — upcoming interview list pulled from the backend's Celery-reminder-backed `Interview` model
- **Analytics** — applicants-by-job bar chart and a hiring funnel chart (Recharts), computed from live job data
- **Company profile** — editable company info (logo, website, industry, headquarters, description)

Verified: `npm run build` — 1351 modules, zero errors.

## Phase 5: Admin dashboard

Added under `/admin/*`, same `DashboardLayout` shell (nav is now role-aware across all three roles):

- **Dashboard home** — stat cards (total users, published jobs, applications, pending approvals — clickable through to the relevant screen), a pending-approvals banner when action is needed, candidate-growth line chart and top-skills-in-demand bar chart (Chart.js), both from the real `/api/admin/stats/` aggregation endpoint
- **Manage Users** — searchable/role-filterable table, activate/deactivate any account
- **Approvals** — recruiter approval queue with one-click approve/reject
- **Manage Jobs** — platform-wide job table with unpublish action
- **System Logs** — scrollable, filterable activity audit trail

Verified: `npm run build` — 1360 modules, zero errors.

## Polish pass: CSV export, notifications page, real recruiter analytics

- **CSV export** — download buttons on the recruiter applicant pipeline (per job) and admin Manage Users / Manage Jobs, using an authenticated blob-fetch helper (`exportApi` in `api/client.js`) rather than a plain `<a href>`, since these endpoints require the JWT bearer header
- **Notifications page** (`/notifications`, shared across all three roles) — full history, unread indicators, click-to-mark-read, mark-all-read, deep links into the relevant application/interview/job
- **Notification bell** — now a real `Link` with a live unread-count badge (polled every 60s), replacing the static dot placeholder
- **Recruiter analytics** — `AnalyticsPage`'s hiring funnel now pulls real per-status counts from `/api/jobs/analytics/` instead of an estimated distribution; applicants-by-job chart also sources from the same real endpoint

Verified: `npm run build` — 1361 modules, zero errors.

## Next up

Dark/light mode toggle, command palette, accessibility pass.
