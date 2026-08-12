import uuid
from django.db import models


class BaseModel(models.Model):
    """Abstract base: UUID primary key + created/updated timestamps.

    Every domain model in HireSphere AI inherits this so we get consistent,
    non-enumerable public IDs (no incremental integer ID leakage) and
    audit-friendly timestamps for free.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ["-created_at"]


class ActivityLog(BaseModel):
    """System-wide audit trail — who did what, when, from where.

    Powers the Admin > System Logs screen and recruiter/candidate
    'Activity Timeline' bonus feature.
    """

    class ActionType(models.TextChoices):
        LOGIN = "login", "Login"
        LOGOUT = "logout", "Logout"
        REGISTER = "register", "Register"
        PROFILE_UPDATE = "profile_update", "Profile Update"
        JOB_CREATED = "job_created", "Job Created"
        JOB_UPDATED = "job_updated", "Job Updated"
        JOB_DELETED = "job_deleted", "Job Deleted"
        APPLICATION_SUBMITTED = "application_submitted", "Application Submitted"
        APPLICATION_STATUS_CHANGED = "application_status_changed", "Application Status Changed"
        RESUME_UPLOADED = "resume_uploaded", "Resume Uploaded"
        INTERVIEW_SCHEDULED = "interview_scheduled", "Interview Scheduled"
        OTHER = "other", "Other"

    user = models.ForeignKey(
        "users.User", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="activity_logs",
    )
    action = models.CharField(max_length=40, choices=ActionType.choices, default=ActionType.OTHER)
    description = models.CharField(max_length=255, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["action"]),
        ]

    def __str__(self):
        return f"{self.action} — {self.user_id} @ {self.created_at:%Y-%m-%d %H:%M}"
