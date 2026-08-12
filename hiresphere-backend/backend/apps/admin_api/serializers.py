from rest_framework import serializers

from apps.users.models import User
from apps.companies.models import Company
from apps.jobs.models import Job
from apps.core.models import ActivityLog


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "email", "full_name", "role", "is_active", "is_verified",
            "is_approved", "date_joined", "last_login",
        ]
        read_only_fields = ["id", "email", "role", "date_joined", "last_login"]


class AdminCompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["id", "name", "slug", "industry", "size", "is_verified", "created_at"]
        read_only_fields = ["id", "slug", "created_at"]


class PendingRecruiterSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="recruiter_profile.company.name", read_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "full_name", "phone", "date_joined", "company_name"]


class AdminJobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)
    posted_by_email = serializers.CharField(source="posted_by.email", read_only=True)

    class Meta:
        model = Job
        fields = [
            "id", "title", "slug", "company_name", "posted_by_email", "status",
            "category", "location", "applicants_count", "views_count", "created_at", "published_at",
        ]
        read_only_fields = fields


class ActivityLogSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source="user.email", read_only=True, default=None)

    class Meta:
        model = ActivityLog
        fields = ["id", "user_email", "action", "description", "ip_address", "created_at"]
        read_only_fields = fields


class PlatformStatsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    total_candidates = serializers.IntegerField()
    total_recruiters = serializers.IntegerField()
    pending_recruiter_approvals = serializers.IntegerField()
    total_companies = serializers.IntegerField()
    total_jobs = serializers.IntegerField()
    published_jobs = serializers.IntegerField()
    total_applications = serializers.IntegerField()
    candidate_growth = serializers.ListField()
    recruiter_activity = serializers.ListField()
    top_skills = serializers.ListField()
