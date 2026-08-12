<div align="center">

# HireSphere AI

### Smart Hiring Powered by Artificial Intelligence

A full-stack AI-powered resume screening & job portal — candidates get AI resume scoring and job matching, recruiters get a real hiring pipeline, admins get full platform oversight.

Built with **Django REST Framework**, **React**, **PostgreSQL**, **Celery**, and **Docker**.

[Features](#features) · [Tech Stack](#tech-stack) · [Screenshots](#screenshots) · [Getting Started](#getting-started) · [API Docs](#api-documentation) · [Project Structure](#project-structure)

</div>

---

## Overview

HireSphere AI is a production-shaped SaaS job portal — think a scaled-down LinkedIn Jobs / Lever / Greenhouse — with three distinct roles (**Candidate**, **Recruiter**, **Admin**), a real hiring pipeline, and a genuine AI resume-parsing and scoring pipeline (not a mock).

This is a portfolio/learning project demonstrating full-stack architecture: normalized relational schema design, JWT auth with role-based permissions, async task processing, a rule-based (explainable) AI scoring engine, and a component-driven React frontend with a distinct visual identity.

## Features

### For Candidates
- Profile builder with education, experience, certifications, projects, and skills
- Drag-and-drop resume upload (PDF) with async AI analysis
- **AI resume scoring** — resume strength score, ATS compatibility score, keyword-gap analysis, course recommendations
- Job search with filters (location, salary, remote/hybrid, experience level, skills) and infinite scroll
- Save jobs, apply with one click, track applications with a full status timeline
- Personalized job recommendations based on extracted/profile skills

### For Recruiters
- Company profile management
- Job posting CRUD with draft/publish workflow
- **Kanban-style hiring pipeline** — Applied → Review → Shortlisted → Interview → Offered → Hired/Rejected
- AI-computed job-match score per applicant
- Interview scheduling with automated reminder emails
- Analytics dashboard (applications per job, real hiring funnel) and CSV export of applicants

### For Admins
- Platform-wide stats dashboard (user/job/application counts, candidate growth, top in-demand skills)
- User management (activate/deactivate any account)
- Recruiter approval queue (new recruiter accounts require admin approval before posting jobs)
- Job moderation (unpublish)
- Full system activity log (audit trail) and CSV export

### Platform-wide
- JWT authentication with refresh-token rotation & blacklisting, email verification, password reset
- Role-based permissions enforced on every endpoint
- In-app notifications with unread badges
- Swagger/ReDoc auto-generated API documentation
- Dark, glassmorphic UI with Framer Motion animations throughout

## Tech Stack

**Backend**
- Django 5 + Django REST Framework
- PostgreSQL (normalized schema, UUID primary keys)
- JWT auth (`djangorestframework-simplejwt`)
- Celery + Redis (async resume parsing, scheduled interview reminders, transactional email)
- `pdfplumber` for resume text extraction
- `drf-spectacular` for OpenAPI/Swagger docs
- Docker + Docker Compose

**Frontend**
- React 18 + Vite
- Tailwind CSS (custom design tokens)
- Framer Motion (page transitions, scroll reveals, micro-interactions)
- Redux Toolkit (auth state, persisted)
- TanStack Query (server state, infinite scroll, caching)
- React Hook Form
- Chart.js / Recharts (analytics dashboards)
- Axios with automatic JWT refresh interceptor

## Screenshots

> _Add screenshots or a demo GIF here before publishing — e.g._
>
> `![Landing page](./docs/screenshots/landing.png)`
> `![Candidate dashboard](./docs/screenshots/candidate-dashboard.png)`
> `![Recruiter pipeline](./docs/screenshots/recruiter-pipeline.png)`

## Architecture

```
┌─────────────────┐        ┌──────────────────┐        ┌─────────────┐
│  React (Vite)    │ ─────▶ │  Django REST API  │ ─────▶ │ PostgreSQL   │
│  Tailwind/Motion  │  JWT   │  9 apps, DRF       │        │ (normalized) │
└─────────────────┘        └──────────────────┘        └─────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │  Celery + Redis   │
                            │  resume parsing,   │
                            │  emails, reminders │
                            └──────────────────┘
```

Two repos, run independently:

```
hiresphere-backend/     # Django REST API + Docker Compose (Postgres, Redis, Celery)
hiresphere-frontend/    # React + Vite SPA
```

## Getting Started

### Prerequisites
- Docker Desktop (recommended — bundles Postgres/Redis for you), **or** Python 3.12 + PostgreSQL + Redis installed locally
- Node.js 18+ and npm

### 1. Backend

```bash
cd hiresphere-backend/backend
cp .env.example .env        # set SECRET_KEY at minimum
cd ..
docker compose up --build
```

In a second terminal, load demo data:
```bash
docker compose exec backend python manage.py seed_demo_data
```

This creates:
| Role | Email | Password |
|---|---|---|
| Admin | `admin@hiresphere.ai` | `Admin@12345` |
| Recruiter | `recruiter@hiresphere.ai` | `Recruiter@12345` |

API docs available at `http://localhost:8000/api/docs/`.

<details>
<summary>Running the backend without Docker</summary>

```bash
cd hiresphere-backend/backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env    # set POSTGRES_HOST=localhost, REDIS_URL=redis://localhost:6379/0
python manage.py migrate
python manage.py seed_demo_data
python manage.py runserver
```

Run Celery separately (required for resume parsing/emails/reminders):
```bash
celery -A config worker -l info   # Windows: add --pool=solo
```

You'll need PostgreSQL and Redis installed and running locally (see platform-specific install steps for your OS).
</details>

### 2. Frontend

```bash
cd hiresphere-frontend
cp .env.example .env        # points at http://localhost:8000/api by default
npm install
npm run dev
```

Open `http://localhost:5173`.

### 3. Try it out

- Log in as the seeded recruiter, post a job, publish it
- Register a new candidate account, upload a resume PDF on the profile page — wait a few seconds for the AI analysis to complete (runs via Celery), then refresh to see the resume score, ATS score, and feedback
- Apply to the recruiter's job as that candidate
- Log in as the recruiter and move the applicant through the hiring pipeline
- Log in as admin to see platform-wide stats and the recruiter approval queue

## API Documentation

Full interactive API docs (Swagger + ReDoc) are auto-generated and served at:
- `http://localhost:8000/api/docs/` (Swagger UI)
- `http://localhost:8000/api/redoc/` (ReDoc)

Key endpoint groups: `/api/auth/`, `/api/jobs/`, `/api/applications/`, `/api/resumes/`, `/api/interviews/`, `/api/notifications/`, `/api/companies/`, `/api/admin/`.

## Project Structure

```
hiresphere-backend/backend/apps/
├── users/          # Custom User model, JWT auth, candidate profiles, skills
├── companies/       # Company + RecruiterProfile
├── jobs/             # Job postings, search/filters, saved jobs, recruiter analytics
├── applications/     # Hiring pipeline, status history, CSV export
├── resumes/          # Resume model + AI parsing/scoring pipeline (services.py)
├── notifications/    # In-app notifications
├── interviews/       # Interview scheduling + reminder emails
├── admin_api/         # Platform admin: stats, user/job moderation, approvals
└── core/              # Shared base models, activity log, permissions

hiresphere-frontend/src/
├── api/               # Axios client + service layer, JWT refresh interceptor
├── store/             # Redux Toolkit (auth)
├── components/        # layout/, ui/, landing/, jobs/, dashboard/, recruiter/
└── pages/              # landing/, auth/, candidate/, recruiter/, admin/
```

## Roadmap

- [ ] Dark/light mode toggle
- [ ] Command palette (Cmd+K)
- [ ] Accessibility audit pass
- [ ] PDF export (in addition to existing CSV export)
- [ ] Production deployment configs (Railway/Render/Fly.io)

## License

This project is available for personal/portfolio use. Add a license of your choice (MIT is a common default) before publishing publicly.

## Acknowledgements

Built as a full-stack portfolio project demonstrating production-style architecture across the full stack — normalized database design, async task processing, explainable AI scoring, and a component-driven frontend.
