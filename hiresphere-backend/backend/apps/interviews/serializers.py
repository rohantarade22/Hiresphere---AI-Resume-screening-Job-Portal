from rest_framework import serializers
from apps.applications.serializers import ApplicationForRecruiterSerializer
from .models import Interview


class InterviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interview
        fields = [
            "id", "application", "scheduled_at", "duration_minutes", "mode",
            "meeting_link", "location", "status", "notes", "feedback", "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class InterviewDetailSerializer(InterviewSerializer):
    application = ApplicationForRecruiterSerializer(read_only=True)
