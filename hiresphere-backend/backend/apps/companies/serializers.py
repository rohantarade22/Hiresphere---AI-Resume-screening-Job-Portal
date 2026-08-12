from rest_framework import serializers
from .models import Company, RecruiterProfile


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            "id", "name", "slug", "logo_url", "website", "industry", "size",
            "headquarters", "description", "founded_year", "is_verified",
        ]
        read_only_fields = ["id", "slug", "is_verified"]


class RecruiterProfileSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)

    class Meta:
        model = RecruiterProfile
        fields = ["id", "user", "company", "job_title", "department"]
        read_only_fields = ["id", "user", "company"]
