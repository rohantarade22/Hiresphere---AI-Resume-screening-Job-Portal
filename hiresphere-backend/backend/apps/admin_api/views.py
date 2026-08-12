from datetime import timedelta

from django.db.models import Count
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.models import ActivityLog
from apps.core.permissions import IsAdminRole
from apps.users.models import User, Skill
from apps.jobs.models import Job
from apps.applications.models import Application
from apps.companies.models import Company
from apps.notifications.models import Notification

from .serializers import (
    AdminUserSerializer,
    PendingRecruiterSerializer,
    AdminJobSerializer,
    ActivityLogSerializer,
    PlatformStatsSerializer,
)


class AdminPermissionMixin:
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]


class PlatformStatsView(AdminPermissionMixin, APIView):
    """GET /api/admin/stats/ — powers the admin dashboard's overview cards
    and charts (candidate growth, recruiter activity, top skills)."""

    def get(self, request):
        six_months_ago = timezone.now() - timedelta(days=180)

        candidate_growth = (
            User.objects.filter(role=User.Role.CANDIDATE, date_joined__gte=six_months_ago)
            .annotate(month=TruncMonth("date_joined"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )
        recruiter_activity = (
            ActivityLog.objects.filter(
                user__role=User.Role.RECRUITER, created_at__gte=six_months_ago,
            )
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )
        top_skills = (
            Skill.objects.annotate(job_count=Count("jobs"))
            .filter(job_count__gt=0)
            .order_by("-job_count")[:8]
            .values("name", "job_count")
        )

        data = {
            "total_users": User.objects.count(),
            "total_candidates": User.objects.filter(role=User.Role.CANDIDATE).count(),
            "total_recruiters": User.objects.filter(role=User.Role.RECRUITER).count(),
            "pending_recruiter_approvals": User.objects.filter(
                role=User.Role.RECRUITER, is_approved=False,
            ).count(),
            "total_companies": Company.objects.count(),
            "total_jobs": Job.objects.count(),
            "published_jobs": Job.objects.filter(status=Job.Status.PUBLISHED).count(),
            "total_applications": Application.objects.count(),
            "candidate_growth": [
                {"month": row["month"].strftime("%b"), "count": row["count"]} for row in candidate_growth
            ],
            "recruiter_activity": [
                {"month": row["month"].strftime("%b"), "count": row["count"]} for row in recruiter_activity
            ],
            "top_skills": list(top_skills),
        }
        return Response(PlatformStatsSerializer(data).data)


class AdminUserListView(AdminPermissionMixin, generics.ListAPIView):
    """GET /api/admin/users/?role=candidate&search=jane — Manage Users screen."""
    serializer_class = AdminUserSerializer
    filterset_fields = ["role", "is_active"]
    search_fields = ["email", "full_name"]

    def get_queryset(self):
        return User.objects.all().order_by("-date_joined")


class AdminUserDetailView(AdminPermissionMixin, generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/admin/users/<id>/ — toggle is_active, edit role-adjacent flags."""
    serializer_class = AdminUserSerializer
    queryset = User.objects.all()


class PendingRecruitersView(AdminPermissionMixin, generics.ListAPIView):
    """GET /api/admin/recruiters/pending/ — the approval queue."""
    serializer_class = PendingRecruiterSerializer

    def get_queryset(self):
        return User.objects.filter(
            role=User.Role.RECRUITER, is_approved=False,
        ).select_related("recruiter_profile__company")


class ApproveRecruiterView(AdminPermissionMixin, APIView):
    """POST /api/admin/recruiters/<id>/approve/"""

    def post(self, request, pk):
        user = User.objects.filter(pk=pk, role=User.Role.RECRUITER).first()
        if not user:
            return Response({"message": "Recruiter not found."}, status=status.HTTP_404_NOT_FOUND)
        user.is_approved = True
        user.save(update_fields=["is_approved"])
        Notification.objects.create(
            recipient=user, type=Notification.Type.SYSTEM,
            title="Account approved", message="Your recruiter account has been approved — you can now post jobs.",
            link="/recruiter/dashboard",
        )
        return Response({"message": "Recruiter approved."})


class RejectRecruiterView(AdminPermissionMixin, APIView):
    """POST /api/admin/recruiters/<id>/reject/ — deactivates rather than deletes,
    preserving the audit trail."""

    def post(self, request, pk):
        user = User.objects.filter(pk=pk, role=User.Role.RECRUITER).first()
        if not user:
            return Response({"message": "Recruiter not found."}, status=status.HTTP_404_NOT_FOUND)
        user.is_active = False
        user.save(update_fields=["is_active"])
        return Response({"message": "Recruiter rejected."})


class AdminJobListView(AdminPermissionMixin, generics.ListAPIView):
    """GET /api/admin/jobs/?status=published — Manage Jobs screen."""
    serializer_class = AdminJobSerializer
    filterset_fields = ["status", "category"]
    search_fields = ["title", "company__name"]

    def get_queryset(self):
        return Job.objects.select_related("company", "posted_by").order_by("-created_at")


class AdminJobModerateView(AdminPermissionMixin, APIView):
    """POST /api/admin/jobs/<id>/unpublish/ — pull a job from public listing
    without deleting it (e.g. reported/inappropriate content)."""

    def post(self, request, pk):
        job = Job.objects.filter(pk=pk).first()
        if not job:
            return Response({"message": "Job not found."}, status=status.HTTP_404_NOT_FOUND)
        job.status = Job.Status.CLOSED
        job.save(update_fields=["status"])
        return Response({"message": "Job unpublished."})


class SystemLogsView(AdminPermissionMixin, generics.ListAPIView):
    """GET /api/admin/logs/?action=login — System Logs screen."""
    serializer_class = ActivityLogSerializer
    filterset_fields = ["action"]

    def get_queryset(self):
        return ActivityLog.objects.select_related("user").order_by("-created_at")[:500]


class ExportUsersCSVView(AdminPermissionMixin, APIView):
    """GET /api/admin/users/export/ — CSV download of the full user list."""

    def get(self, request):
        import csv
        from django.http import HttpResponse

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="hiresphere_users.csv"'

        writer = csv.writer(response)
        writer.writerow(["Name", "Email", "Role", "Active", "Verified", "Approved", "Joined"])
        for user in User.objects.all().order_by("-date_joined"):
            writer.writerow([
                user.full_name, user.email, user.role,
                user.is_active, user.is_verified, user.is_approved,
                user.date_joined.strftime("%Y-%m-%d"),
            ])
        return response


class ExportJobsCSVView(AdminPermissionMixin, APIView):
    """GET /api/admin/jobs/export/ — CSV download of every job on the platform."""

    def get(self, request):
        import csv
        from django.http import HttpResponse

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="hiresphere_jobs.csv"'

        writer = csv.writer(response)
        writer.writerow(["Title", "Company", "Status", "Category", "Location", "Applicants", "Views", "Posted"])
        for job in Job.objects.select_related("company").order_by("-created_at"):
            writer.writerow([
                job.title, job.company.name, job.status, job.category, job.location,
                job.applicants_count, job.views_count, job.created_at.strftime("%Y-%m-%d"),
            ])
        return response
