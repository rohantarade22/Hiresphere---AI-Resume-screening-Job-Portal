from rest_framework import serializers
from apps.companies.serializers import CompanySerializer
from apps.users.serializers import SkillSerializer
from apps.users.models import Skill
from .models import Job, SavedJob


class JobListSerializer(serializers.ModelSerializer):
    """Lightweight — used for search results / infinite scroll."""
    company = CompanySerializer(read_only=True)
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            "id", "title", "slug", "company", "category", "job_type", "work_mode",
            "experience_level", "location", "salary_min", "salary_max", "currency",
            "applicants_count", "published_at", "is_saved",
        ]

    def get_is_saved(self, obj):
        user = self.context["request"].user
        if not user.is_authenticated:
            return False
        return obj.saved_by.filter(candidate=user).exists()


class JobDetailSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    skills_required = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        source="skills_required", queryset=Skill.objects.all(), many=True, write_only=True, required=False,
    )
    is_saved = serializers.SerializerMethodField()
    has_applied = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            "id", "title", "slug", "company", "category", "description",
            "responsibilities", "requirements", "job_type", "work_mode", "experience_level",
            "location", "salary_min", "salary_max", "currency", "skills_required", "skill_ids",
            "status", "application_deadline", "views_count", "applicants_count",
            "created_at", "published_at", "is_saved", "has_applied",
        ]
        read_only_fields = ["id", "slug", "views_count", "applicants_count", "created_at", "published_at"]

    def get_is_saved(self, obj):
        user = self.context["request"].user
        return user.is_authenticated and obj.saved_by.filter(candidate=user).exists()

    def get_has_applied(self, obj):
        user = self.context["request"].user
        return user.is_authenticated and obj.applications.filter(candidate=user).exists()

    def create(self, validated_data):
        request = self.context["request"]
        validated_data["posted_by"] = request.user
        validated_data["company"] = request.user.recruiter_profile.company
        return super().create(validated_data)


class SavedJobSerializer(serializers.ModelSerializer):
    job = JobListSerializer(read_only=True)

    class Meta:
        model = SavedJob
        fields = ["id", "job", "created_at"]
