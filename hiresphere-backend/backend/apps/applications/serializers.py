from rest_framework import serializers
from apps.jobs.serializers import JobListSerializer
from apps.users.serializers import UserSerializer, CandidateProfileSerializer
from apps.resumes.serializers import ResumeSerializer
from .models import Application, ApplicationStatusHistory


class StatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationStatusHistory
        fields = ["id", "status", "note", "created_at"]


class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ["id", "job", "resume", "cover_letter"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        request = self.context["request"]
        application = Application.objects.create(candidate=request.user, **validated_data)
        ApplicationStatusHistory.objects.create(
            application=application, status=Application.Status.APPLIED, changed_by=request.user,
        )
        application.job.__class__.objects.filter(pk=application.job_id).update(
            applicants_count=application.job.applicants_count + 1
        )
        self._compute_match_score(application)
        return application

    @staticmethod
    def _compute_match_score(application):
        """Best-effort synchronous match score — cheap set-overlap math,
        no need for a Celery round trip. Falls back silently (leaves
        match_score null) if the candidate has no profile/skills yet."""
        from apps.resumes.services import compute_job_match_score

        profile = getattr(application.candidate, "candidate_profile", None)
        if not profile:
            return

        candidate_skills = {s.name for s in profile.skills.all()}
        if application.resume and application.resume.extracted_skills:
            candidate_skills |= set(application.resume.extracted_skills)

        job_skills = {s.name for s in application.job.skills_required.all()}

        score = compute_job_match_score(
            candidate_skill_names=candidate_skills,
            job_skill_names=job_skills,
            candidate_years=profile.years_of_experience or 0,
            job_experience_level=application.job.experience_level,
        )
        application.match_score = score
        application.save(update_fields=["match_score"])


class ApplicationForCandidateSerializer(serializers.ModelSerializer):
    """Candidate's own view — 'Track Applications'."""
    job = JobListSerializer(read_only=True)
    resume = ResumeSerializer(read_only=True)
    status_history = StatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Application
        fields = [
            "id", "job", "resume", "cover_letter", "status", "match_score",
            "applied_at", "updated_at", "status_history",
        ]


class ApplicationForRecruiterSerializer(serializers.ModelSerializer):
    """Recruiter's view of an applicant — includes candidate profile for comparison."""
    candidate = UserSerializer(read_only=True)
    candidate_profile = serializers.SerializerMethodField()
    resume = ResumeSerializer(read_only=True)
    job = JobListSerializer(read_only=True)

    class Meta:
        model = Application
        fields = [
            "id", "job", "candidate", "candidate_profile", "resume", "cover_letter",
            "status", "match_score", "recruiter_notes", "applied_at", "updated_at",
        ]

    def get_candidate_profile(self, obj):
        profile = getattr(obj.candidate, "candidate_profile", None)
        return CandidateProfileSerializer(profile).data if profile else None


class ApplicationStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Application.Status.choices)
    note = serializers.CharField(required=False, allow_blank=True, max_length=255)
