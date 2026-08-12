from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import (
    User, CandidateProfile, Education, Experience, Certification, Project, Skill,
)


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "category"]


class RegisterCandidateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "full_name", "phone", "password", "password_confirm"]
        read_only_fields = ["id"]

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User.objects.create_user(role=User.Role.CANDIDATE, **validated_data)
        user.set_password(password)
        user.save()
        CandidateProfile.objects.create(user=user)
        return user


class RegisterRecruiterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    company_name = serializers.CharField(write_only=True, max_length=200)

    class Meta:
        model = User
        fields = ["id", "email", "full_name", "phone", "password", "password_confirm", "company_name"]
        read_only_fields = ["id"]

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        from apps.companies.models import Company, RecruiterProfile

        password = validated_data.pop("password")
        company_name = validated_data.pop("company_name")
        user = User.objects.create_user(role=User.Role.RECRUITER, **validated_data)
        user.set_password(password)
        user.save()

        company, _ = Company.objects.get_or_create(
            name=company_name, defaults={"created_by": user},
        )
        RecruiterProfile.objects.create(user=user, company=company)
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "email", "full_name", "role", "phone", "avatar_url",
            "is_verified", "is_approved", "date_joined",
        ]
        read_only_fields = fields


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Adds role/user payload to the token response so the frontend can
    route to the correct dashboard without a second request."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["full_name"] = user.full_name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        if self.user.role == User.Role.RECRUITER and not self.user.is_approved:
            raise serializers.ValidationError(
                {"detail": "Your recruiter account is pending admin approval."}
            )
        return data


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    new_password = serializers.CharField(validators=[validate_password])


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ["id", "institution", "degree", "field_of_study", "start_date", "end_date", "grade"]


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = [
            "id", "company_name", "title", "location",
            "start_date", "end_date", "is_current", "description",
        ]


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = ["id", "name", "issuing_organization", "issue_date", "credential_url"]


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ["id", "title", "description", "project_url", "repo_url", "tech_stack"]


class CandidateProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        source="skills", queryset=Skill.objects.all(), many=True, write_only=True, required=False,
    )
    education = EducationSerializer(many=True, read_only=True)
    experience = ExperienceSerializer(many=True, read_only=True)
    certifications = CertificationSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)

    class Meta:
        model = CandidateProfile
        fields = [
            "id", "user", "headline", "bio", "location", "resume",
            "skills", "skill_ids", "github_url", "linkedin_url", "portfolio_url",
            "years_of_experience", "expected_salary", "open_to_remote",
            "profile_completion", "education", "experience", "certifications", "projects",
        ]
        read_only_fields = ["id", "profile_completion", "resume"]

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        instance.recompute_completion()
        return instance
