import uuid
from django.conf import settings
from django.db import models

from apps.applications.models import Application


class Interview(models.Model):
    class Mode(models.TextChoices):
        VIDEO = "video", "Video Call"
        PHONE = "phone", "Phone Call"
        ONSITE = "onsite", "On-site"

    class Status(models.TextChoices):
        SCHEDULED = "scheduled", "Scheduled"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"
        RESCHEDULED = "rescheduled", "Rescheduled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name="interviews")
    scheduled_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="+")

    scheduled_at = models.DateTimeField()
    duration_minutes = models.PositiveSmallIntegerField(default=30)
    mode = models.CharField(max_length=20, choices=Mode.choices, default=Mode.VIDEO)
    meeting_link = models.URLField(blank=True)
    location = models.CharField(max_length=255, blank=True)  # for onsite

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)
    notes = models.TextField(blank=True)
    feedback = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["scheduled_at"]
