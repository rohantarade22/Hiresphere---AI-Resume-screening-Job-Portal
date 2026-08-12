import uuid
from django.conf import settings
from django.db import models


class Resume(models.Model):
    """Stores the uploaded PDF plus everything the AI parsing pipeline
    extracts from it (Phase 3 wires up the actual parser/Celery task —
    the schema is defined now so the frontend can be built against it).
    """

    class ParseStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSING = "processing", "Processing"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="resumes")

    file = models.FileField(upload_to="resumes/%Y/%m/")
    original_filename = models.CharField(max_length=255, blank=True)

    parse_status = models.CharField(max_length=20, choices=ParseStatus.choices, default=ParseStatus.PENDING)

    # AI-extracted structured data
    extracted_name = models.CharField(max_length=150, blank=True)
    extracted_email = models.EmailField(blank=True)
    extracted_phone = models.CharField(max_length=30, blank=True)
    extracted_skills = models.JSONField(default=list, blank=True)
    extracted_education = models.JSONField(default=list, blank=True)
    extracted_experience = models.JSONField(default=list, blank=True)

    # AI scoring
    resume_score = models.PositiveSmallIntegerField(null=True, blank=True)       # 0-100 overall strength
    ats_score = models.PositiveSmallIntegerField(null=True, blank=True)          # 0-100 ATS compatibility
    keyword_matches = models.JSONField(default=list, blank=True)
    missing_keywords = models.JSONField(default=list, blank=True)
    ai_feedback = models.TextField(blank=True)
    recommended_courses = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Resume({self.candidate.email}, {self.parse_status})"
