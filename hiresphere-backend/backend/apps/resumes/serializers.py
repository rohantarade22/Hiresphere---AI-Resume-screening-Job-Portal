from rest_framework import serializers
from django.conf import settings
import os
from .models import Resume


class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = [
            "id", "file", "original_filename", "parse_status",
            "extracted_name", "extracted_email", "extracted_phone",
            "extracted_skills", "extracted_education", "extracted_experience",
            "resume_score", "ats_score", "keyword_matches", "missing_keywords",
            "ai_feedback", "recommended_courses", "created_at",
        ]
        read_only_fields = [
            "id", "parse_status", "extracted_name", "extracted_email", "extracted_phone",
            "extracted_skills", "extracted_education", "extracted_experience",
            "resume_score", "ats_score", "keyword_matches", "missing_keywords",
            "ai_feedback", "recommended_courses", "created_at",
        ]

    def validate_file(self, value):
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in settings.ALLOWED_RESUME_EXTENSIONS:
            raise serializers.ValidationError("Only PDF resumes are accepted.")
        max_size = 5 * 1024 * 1024  # 5 MB
        if value.size > max_size:
            raise serializers.ValidationError("Resume file must be under 5MB.")
        return value
