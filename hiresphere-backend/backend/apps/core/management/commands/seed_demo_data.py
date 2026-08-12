from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.users.models import User, Skill
from apps.companies.models import Company, RecruiterProfile
from apps.jobs.models import Job


SKILLS = [
    ("React", "Frontend"), ("Django", "Backend"), ("PostgreSQL", "Database"),
    ("Docker", "DevOps"), ("Python", "Backend"), ("TypeScript", "Frontend"),
    ("Node.js", "Backend"), ("AWS", "DevOps"), ("Redis", "Database"), ("GraphQL", "Backend"),
]

COMPANIES = [
    {"name": "Nimbus Cloud", "industry": "Cloud Infrastructure", "size": "201-1000", "headquarters": "Austin, TX"},
    {"name": "Fintra", "industry": "Fintech", "size": "51-200", "headquarters": "New York, NY"},
    {"name": "PixelForge Studios", "industry": "Design Tools", "size": "11-50", "headquarters": "Remote"},
]


class Command(BaseCommand):
    help = "Seeds the database with demo skills, companies, recruiter, jobs, and an admin superuser."

    def handle(self, *args, **options):
        skills = {}
        for name, category in SKILLS:
            skill, _ = Skill.objects.get_or_create(name=name, defaults={"category": category})
            skills[name] = skill
        self.stdout.write(self.style.SUCCESS(f"Seeded {len(skills)} skills."))

        if not User.objects.filter(email="admin@hiresphere.ai").exists():
            User.objects.create_superuser(
                email="admin@hiresphere.ai", password="Admin@12345", full_name="Platform Admin",
            )
            self.stdout.write(self.style.SUCCESS("Created admin user: admin@hiresphere.ai / Admin@12345"))

        recruiter_user, created = User.objects.get_or_create(
            email="recruiter@hiresphere.ai",
            defaults={"full_name": "Jordan Reyes", "role": User.Role.RECRUITER, "is_verified": True, "is_approved": True},
        )
        if created:
            recruiter_user.set_password("Recruiter@12345")
            recruiter_user.save()

        company, _ = Company.objects.get_or_create(
            name=COMPANIES[0]["name"], defaults={**COMPANIES[0], "is_verified": True, "created_by": recruiter_user},
        )
        for data in COMPANIES[1:]:
            Company.objects.get_or_create(name=data["name"], defaults={**data, "is_verified": True})

        RecruiterProfile.objects.get_or_create(
            user=recruiter_user, defaults={"company": company, "job_title": "Talent Acquisition Lead"},
        )
        self.stdout.write(self.style.SUCCESS(
            f"Companies ready. Demo recruiter: recruiter@hiresphere.ai / Recruiter@12345"
        ))

        if not Job.objects.filter(company=company).exists():
            job = Job.objects.create(
                company=company, posted_by=recruiter_user,
                title="Senior Full Stack Engineer",
                category="Engineering",
                description="Build and scale HireSphere's candidate-facing platform.",
                responsibilities="Own features end-to-end across React and Django.",
                requirements="5+ years experience with React and Django REST Framework.",
                job_type=Job.JobType.FULL_TIME, work_mode=Job.WorkMode.REMOTE,
                experience_level=Job.ExperienceLevel.SENIOR,
                location="Remote", salary_min=120000, salary_max=160000,
                status=Job.Status.PUBLISHED, published_at=timezone.now(),
            )
            job.skills_required.set([skills["React"], skills["Django"], skills["PostgreSQL"]])
            self.stdout.write(self.style.SUCCESS(f"Created demo job: {job.title}"))

        self.stdout.write(self.style.SUCCESS("Demo data seed complete."))
