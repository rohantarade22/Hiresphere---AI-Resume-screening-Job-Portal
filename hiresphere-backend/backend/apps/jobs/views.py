from django.db import models
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.models import ActivityLog
from apps.core.permissions import IsRecruiter
from .models import Job, SavedJob
from .filters import JobFilter
from .serializers import JobListSerializer, JobDetailSerializer, SavedJobSerializer


class JobListCreateView(generics.ListCreateAPIView):
    """GET /api/jobs/  — public search with filters/sort/pagination (infinite scroll friendly)
    POST /api/jobs/ — recruiter creates a job (starts as draft)
    """
    filterset_class = JobFilter
    search_fields = ["title", "description", "location", "company__name"]
    ordering_fields = ["published_at", "salary_min", "salary_max", "applicants_count"]

    def get_queryset(self):
        qs = Job.objects.select_related("company").prefetch_related("skills_required")
        if self.request.method == "GET":
            qs = qs.filter(status=Job.Status.PUBLISHED)
        return qs

    def get_serializer_class(self):
        return JobDetailSerializer if self.request.method == "POST" else JobListSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsRecruiter()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        job = serializer.save()
        ActivityLog.objects.create(
            user=self.request.user, action=ActivityLog.ActionType.JOB_CREATED,
            description=f"Created job '{job.title}'", ip_address=self.request.client_ip,
        )


class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET (public) / PATCH / DELETE (owning recruiter) /api/jobs/<slug>/"""
    queryset = Job.objects.select_related("company").prefetch_related("skills_required")
    serializer_class = JobDetailSerializer
    lookup_field = "slug"

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsRecruiter()]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        Job.objects.filter(pk=instance.pk).update(views_count=instance.views_count + 1)
        return super().retrieve(request, *args, **kwargs)

    def perform_update(self, serializer):
        job = serializer.save()
        ActivityLog.objects.create(
            user=self.request.user, action=ActivityLog.ActionType.JOB_UPDATED,
            description=f"Updated job '{job.title}'", ip_address=self.request.client_ip,
        )

    def perform_destroy(self, instance):
        ActivityLog.objects.create(
            user=self.request.user, action=ActivityLog.ActionType.JOB_DELETED,
            description=f"Deleted job '{instance.title}'", ip_address=self.request.client_ip,
        )
        instance.delete()


class PublishJobView(APIView):
    """POST /api/jobs/<slug>/publish/ — flips draft -> published."""
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def post(self, request, slug):
        job = Job.objects.filter(slug=slug, posted_by=request.user).first()
        if not job:
            return Response({"message": "Job not found."}, status=status.HTTP_404_NOT_FOUND)
        job.status = Job.Status.PUBLISHED
        job.published_at = timezone.now()
        job.save(update_fields=["status", "published_at"])
        return Response(JobDetailSerializer(job, context={"request": request}).data)


class MyJobsView(generics.ListAPIView):
    """GET /api/jobs/mine/ — recruiter's own postings, incl. drafts, for their dashboard."""
    serializer_class = JobDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def get_queryset(self):
        return Job.objects.filter(posted_by=self.request.user).select_related("company")


class RecommendedJobsView(generics.ListAPIView):
    """GET /api/jobs/recommended/ — naive skill-overlap recommendation engine.
    (Phase 3 will replace this with the full AI matching-score pipeline.)
    """
    serializer_class = JobListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        profile = getattr(self.request.user, "candidate_profile", None)
        qs = Job.objects.filter(status=Job.Status.PUBLISHED).select_related("company")
        if profile and profile.skills.exists():
            qs = qs.filter(skills_required__in=profile.skills.all()).distinct()
        return qs.order_by("-published_at")[:20]


class SavedJobListCreateView(generics.ListCreateAPIView):
    """GET /api/jobs/saved/ — list bookmarks
    POST /api/jobs/saved/ — body: {"job": "<job_id>"}
    """
    serializer_class = SavedJobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedJob.objects.filter(candidate=self.request.user).select_related("job", "job__company")

    def perform_create(self, serializer):
        serializer.save(candidate=self.request.user)


class SavedJobDeleteView(generics.DestroyAPIView):
    """DELETE /api/jobs/saved/<job_id>/"""
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return SavedJob.objects.get(candidate=self.request.user, job_id=self.kwargs["job_id"])


class RecruiterAnalyticsView(APIView):
    """GET /api/jobs/analytics/ — real server-side aggregation for the
    recruiter dashboard's charts (mirrors apps.admin_api's approach,
    scoped to jobs the requesting recruiter posted)."""
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def get(self, request):
        from django.db.models import Count
        from django.db.models.functions import TruncMonth
        from django.utils import timezone
        from datetime import timedelta
        from apps.applications.models import Application

        six_months_ago = timezone.now() - timedelta(days=180)
        my_jobs = Job.objects.filter(posted_by=request.user)

        applications_per_month = (
            Application.objects.filter(job__posted_by=request.user, applied_at__gte=six_months_ago)
            .annotate(month=TruncMonth("applied_at"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )

        funnel = (
            Application.objects.filter(job__posted_by=request.user)
            .values("status")
            .annotate(count=Count("id"))
        )
        funnel_map = {row["status"]: row["count"] for row in funnel}

        top_jobs = (
            my_jobs.order_by("-applicants_count")
            .values("title", "applicants_count")[:5]
        )

        data = {
            "active_job_posts": my_jobs.filter(status=Job.Status.PUBLISHED).count(),
            "total_applicants": Application.objects.filter(job__posted_by=request.user).count(),
            "total_views": my_jobs.aggregate(total=models.Sum("views_count"))["total"] or 0,
            "applications_per_month": [
                {"month": row["month"].strftime("%b"), "count": row["count"]} for row in applications_per_month
            ],
            "hiring_funnel": {
                "applied": funnel_map.get("applied", 0),
                "under_review": funnel_map.get("under_review", 0),
                "shortlisted": funnel_map.get("shortlisted", 0),
                "interview": funnel_map.get("interview", 0),
                "offered": funnel_map.get("offered", 0),
                "hired": funnel_map.get("hired", 0),
                "rejected": funnel_map.get("rejected", 0),
            },
            "top_jobs": list(top_jobs),
        }
        return Response(data)
