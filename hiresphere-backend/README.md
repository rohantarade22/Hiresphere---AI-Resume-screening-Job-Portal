# HireSphere AI — Backend (Phases 1, 2 & 5: Foundation, Admin, AI Resume Parsing)

**Smart Hiring Powered by Artificial Intelligence** — a production-shaped Django REST API with JWT auth, a normalized PostgreSQL schema, Docker Compose orchestration, and a real (not stubbed) AI resume-parsing pipeline.

This is real, runnable code — not stubs — validated at every step (`python manage.py check`, `makemigrations` across every app, and the resume parser tested against generated PDFs with sensible output). The remaining phases (recruiter analytics endpoints, React frontend — built separately, see the frontend project — and final polish) are noted in the roadmap below.

## What's included

**9 Django apps, fully wired:**
- `apps.users` — custom `User` model (email login, role field: candidate/recruiter/admin), JWT auth (login/refresh/blacklist), email verification, forgot/reset password, `CandidateProfile` with Education/Experience/Certifications/Projects, global `Skill` taxonomy, profile-completion scoring
- `apps.companies` — `Company` + `RecruiterProfile`, recruiter approval workflow
- `apps.jobs` — `Job` postings with full filtering (location, salary, remote/hybrid, skills, experience level), `SavedJob` bookmarks, recommended-jobs endpoint
- `apps.applications` — `Application` + `ApplicationStatusHistory` (hiring pipeline with a full audit timeline), recruiter applicant views, status transitions, real job-match scoring on submission
- `apps.resumes` — `Resume` model plus a real, working AI parsing pipeline (`apps/resumes/services.py`): pdfplumber text extraction, contact/skill/education/experience extraction, explainable resume + ATS scoring, keyword-gap analysis, and course recommendations, run async via Celery on upload
- `apps.notifications` — in-app notification feed
- `apps.interviews` — interview scheduling with Celery-scheduled reminder emails
- `apps.core` — shared base model, activity-log audit trail, custom permission classes (`IsCandidate`/`IsRecruiter`/`IsAdminRole`), consistent DRF error envelope, demo data seed command
- `apps.admin_api` — platform-wide admin surface: stats aggregation (user/job/application counts, candidate growth, top skills), user management (activate/deactivate), recruiter approval queue, job moderation (unpublish), full system activity log viewer

**Infrastructure:**
- Docker Compose: Postgres 16, Redis 7, Django (Gunicorn), Celery worker, Celery beat
- JWT via `djangorestframework-simplejwt` with rotation + blacklisting
- Swagger/ReDoc auto-generated docs via `drf-spectacular`
- Cloudinary-ready file storage for resumes/avatars/logos
- Consistent error responses, rate limiting, security headers, UUID primary keys throughout (no enumerable IDs)

## Quick start

```bash
cd hiresphere-backend/backend
cp .env.example .env        # fill in SECRET_KEY at minimum
cd ..
docker compose up --build
```

Then, in a second terminal:

```bash
docker compose exec backend python manage.py seed_demo_data
```

This creates:
- Admin: `admin@hiresphere.ai` / `Admin@12345`
- Demo recruiter: `recruiter@hiresphere.ai` / `Recruiter@12345` (pre-approved, with a company + one published job)

API docs: `http://localhost:8000/api/docs/`
Admin panel: `http://localhost:8000/admin/`

## API surface (Phase 1)

| Area | Endpoint |
|---|---|
| Auth | `POST /api/auth/register/candidate/`, `POST /api/auth/register/recruiter/`, `POST /api/auth/login/`, `POST /api/auth/refresh/`, `POST /api/auth/verify-email/`, `POST /api/auth/forgot-password/`, `POST /api/auth/reset-password/`, `GET /api/auth/me/` |
| Candidate | `GET/PATCH /api/auth/candidate-profile/`, `GET /api/auth/skills/` |
| Companies | `GET /api/companies/`, `GET /api/companies/<slug>/`, `GET/PATCH /api/companies/me/` |
| Jobs | `GET/POST /api/jobs/`, `GET/PATCH/DELETE /api/jobs/<slug>/`, `POST /api/jobs/<slug>/publish/`, `GET /api/jobs/mine/`, `GET /api/jobs/recommended/`, `GET/POST /api/jobs/saved/` |
| Applications | `POST /api/applications/apply/`, `GET /api/applications/mine/`, `GET /api/applications/job/<job_id>/`, `PATCH /api/applications/<id>/status/`, `POST /api/applications/<id>/withdraw/` |
| Resumes | `GET/POST /api/resumes/`, `GET/DELETE /api/resumes/<id>/` |
| Notifications | `GET /api/notifications/`, `POST /api/notifications/<id>/read/`, `POST /api/notifications/read-all/` |
| Interviews | `POST /api/interviews/`, `GET /api/interviews/mine-as-recruiter/`, `GET /api/interviews/mine-as-candidate/`, `GET/PATCH /api/interviews/<id>/` |
| Admin | `GET /api/admin/stats/`, `GET /api/admin/users/`, `PATCH /api/admin/users/<id>/`, `GET /api/admin/recruiters/pending/`, `POST /api/admin/recruiters/<id>/approve/`, `POST /api/admin/recruiters/<id>/reject/`, `GET /api/admin/jobs/`, `POST /api/admin/jobs/<id>/unpublish/`, `GET /api/admin/logs/` |

## Database schema (normalized PostgreSQL)

`User` (role-based auth) → `CandidateProfile` (1:1) → `Education` / `Experience` / `Certification` / `Project` (1:many)
`User` → `RecruiterProfile` (1:1) → `Company` (many:1)
`Company` → `Job` (1:many) → `Application` (1:many) → `ApplicationStatusHistory` (1:many), `Interview` (1:many)
`Resume` (many:1 User) ← linked from `Application` and `CandidateProfile`
`Skill` (many:many with `CandidateProfile` and `Job`)
`Notification`, `ActivityLog` — cross-cutting, FK to `User`

All models use UUID primary keys (no sequential-ID enumeration), `created_at`/`updated_at` timestamps, and indexed foreign keys / status fields for the query patterns the dashboards need (e.g. `Job` indexed on `(status, -published_at)`, `Application` on `(job, status)`).

## Phase 5: AI resume parsing pipeline (real, not stubbed)

`apps/resumes/services.py` is a dependency-light, rule-based pipeline — deliberately transparent rather than an opaque ML black box, since every score a candidate sees should be explainable:

- **Text extraction** — pdfplumber
- **Contact extraction** — name/email/phone via regex + heuristics
- **Section detection** — Summary, Experience, Education, Skills, Projects, Certifications, via common header aliases
- **Skill extraction** — matches against the live `Skill` table (whole-word, case-insensitive), so new skills are picked up with zero code changes
- **Resume score & ATS score** — weighted, documented scoring (contact completeness, section presence, skill breadth, word count, action-verb usage)
- **Keyword-gap analysis** — matched vs. missing skills against a benchmark list, each missing skill mapped to a course recommendation
- **Job-match scoring** — computed synchronously at application time (`apps/applications/serializers.py`) from skill-set overlap + experience-level fit between the candidate and the specific job
- **Profile auto-sync** — detected skills are automatically added to the candidate's profile, so job recommendations improve immediately after upload

Validated end-to-end with a generated test PDF (`fpdf2`) run through the actual pipeline — correctly extracted name/email/phone/skills/sections, and produced sensible scores for both a strong resume (87/100) and an intentionally thin one (15/100).

## Admin dashboard API (real, not stubbed)

`apps/admin_api` — all endpoints require `IsAdminRole`:

- **Platform stats** — user/job/application/company counts, pending-approval count, 6-month candidate growth and recruiter activity time series (via `TruncMonth` aggregation), top-8 in-demand skills by job count
- **User management** — searchable/filterable user list, activate/deactivate any account
- **Recruiter approval queue** — list pending recruiters (with their company name), approve (flips `is_approved`, fires a notification) or reject (deactivates, preserving the audit trail rather than deleting)
- **Job moderation** — list all jobs platform-wide, unpublish (sets status to closed) without deleting
- **System logs** — full `ActivityLog` viewer, filterable by action type

Validated: `python manage.py check` passes with the new app registered, and `makemigrations --check` confirms zero pending migrations (this app is pure aggregation/API — no new models).

## Polish pass: CSV export & recruiter analytics

- **CSV export** — `GET /api/applications/job/<job_id>/export/` (recruiter's own applicants), `GET /api/admin/users/export/` and `GET /api/admin/jobs/export/` (admin, platform-wide). All auth-gated by the same role permissions as their JSON counterparts; frontend downloads use an authenticated blob fetch rather than a plain link, since these endpoints require a JWT bearer token.
- **Recruiter analytics endpoint** — `GET /api/jobs/analytics/`, scoped to `request.user`'s own job postings: active job count, total applicants, total views, 6-month applications-per-month time series, a *real* per-status hiring funnel (applied/under_review/shortlisted/interview/offered/hired/rejected counts from the database — no more client-side estimation), and top 5 jobs by applicant volume. Mirrors the same aggregation approach as `apps.admin_api`.

## Roadmap (remaining)

- Dark mode, command palette, accessibility pass, deployment polish (frontend)

## Security notes

JWT with short-lived access tokens + rotating/blacklisted refresh tokens, password validation via Django's built-in validators, per-endpoint role permissions, file-upload type/size validation, rate limiting on all endpoints (stricter on auth), CORS locked to `FRONTEND_URL`, HTTPS/HSTS enforced when `DEBUG=False`, no enumerable integer IDs anywhere in the API.
