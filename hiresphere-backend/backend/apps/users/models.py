import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        extra_fields.setdefault("role", User.Role.CANDIDATE)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.ADMIN)
        extra_fields.setdefault("is_verified", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self._create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Single auth table for all three roles. Role-specific data lives in
    apps.users.CandidateProfile / apps.companies.RecruiterProfile so the
    auth table stays lean and every role shares one login/JWT/reset flow.
    """

    class Role(models.TextChoices):
        CANDIDATE = "candidate", "Candidate"
        RECRUITER = "recruiter", "Recruiter"
        ADMIN = "admin", "Admin"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    full_name = models.CharField(max_length=150)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CANDIDATE, db_index=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)

    # Recruiter accounts require admin approval (bonus: "Approval System")
    is_approved = models.BooleanField(default=True)

    phone = models.CharField(max_length=20, blank=True)
    avatar_url = models.URLField(blank=True)

    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    class Meta:
        ordering = ["-date_joined"]
        indexes = [
            models.Index(fields=["role", "is_active"]),
        ]

    def __str__(self):
        return f"{self.full_name} <{self.email}> ({self.role})"

    def save(self, *args, **kwargs):
        # Recruiters need explicit admin approval before they can post jobs.
        if self.role == self.Role.RECRUITER and self._state.adding:
            self.is_approved = False
        super().save(*args, **kwargs)


class EmailVerificationToken(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="verification_tokens")
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)

    def is_valid(self):
        return not self.used and timezone.now() < self.expires_at


class PasswordResetToken(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reset_tokens")
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)

    def is_valid(self):
        return not self.used and timezone.now() < self.expires_at


class Skill(models.Model):
    """Global skill taxonomy — shared by candidate profiles, job postings,
    and the AI skill-gap analysis."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True, db_index=True)
    category = models.CharField(max_length=100, blank=True)  # e.g. "Frontend", "DevOps"

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class CandidateProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="candidate_profile")

    headline = models.CharField(max_length=200, blank=True)  # e.g. "Full Stack Developer"
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=150, blank=True)

    resume = models.ForeignKey(
        "resumes.Resume", on_delete=models.SET_NULL, null=True, blank=True, related_name="+",
    )

    skills = models.ManyToManyField(Skill, blank=True, related_name="candidates")

    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)

    years_of_experience = models.PositiveSmallIntegerField(default=0)
    expected_salary = models.PositiveIntegerField(null=True, blank=True)
    open_to_remote = models.BooleanField(default=True)

    profile_completion = models.PositiveSmallIntegerField(default=0)  # 0-100, recomputed on save

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"CandidateProfile({self.user.email})"

    def recompute_completion(self):
        """Simple weighted completeness score powering the animated
        'Profile Completion' ring on the candidate dashboard."""
        fields_weight = {
            "headline": 10, "bio": 10, "location": 5,
            "github_url": 5, "linkedin_url": 5, "portfolio_url": 5,
        }
        score = 0
        for field, weight in fields_weight.items():
            if getattr(self, field):
                score += weight
        if self.resume_id:
            score += 25
        if self.skills.exists():
            score += 15
        if self.education.exists():
            score += 10
        if self.experience.exists():
            score += 10
        self.profile_completion = min(score, 100)
        self.save(update_fields=["profile_completion"])
        return self.profile_completion


class Education(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name="education")
    institution = models.CharField(max_length=200)
    degree = models.CharField(max_length=150)
    field_of_study = models.CharField(max_length=150, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    grade = models.CharField(max_length=50, blank=True)

    class Meta:
        ordering = ["-start_date"]


class Experience(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name="experience")
    company_name = models.CharField(max_length=200)
    title = models.CharField(max_length=150)
    location = models.CharField(max_length=150, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["-start_date"]


class Certification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name="certifications")
    name = models.CharField(max_length=200)
    issuing_organization = models.CharField(max_length=200)
    issue_date = models.DateField(null=True, blank=True)
    credential_url = models.URLField(blank=True)


class Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name="projects")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    project_url = models.URLField(blank=True)
    repo_url = models.URLField(blank=True)
    tech_stack = models.CharField(max_length=300, blank=True)  # comma-separated
