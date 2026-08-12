from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.models import ActivityLog
from apps.core.permissions import IsCandidate, IsRecruiter
from .models import Application, ApplicationStatusHistory
from .serializers import (
    ApplicationCreateSerializer,
    ApplicationForCandidateSerializer,
    ApplicationForRecruiterSerializer,
    ApplicationStatusUpdateSerializer,
)


class ApplyToJobView(generics.CreateAPIView):
    """POST /api/applications/apply/ — candidate applies to a job."""
    serializer_class = ApplicationCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsCandidate]

    def perform_create(self, serializer):
        application = serializer.save()
        ActivityLog.objects.create(
            user=self.request.user, action=ActivityLog.ActionType.APPLICATION_SUBMITTED,
            description=f"Applied to '{application.job.title}'", ip_address=self.request.client_ip,
        )


class MyApplicationsView(generics.ListAPIView):
    """GET /api/applications/mine/ — candidate's 'Track Applications' dashboard."""
    serializer_class = ApplicationForCandidateSerializer
    permission_classes = [permissions.IsAuthenticated, IsCandidate]
    filterset_fields = ["status"]

    def get_queryset(self):
        return (
            Application.objects.filter(candidate=self.request.user)
            .select_related("job", "job__company", "resume")
            .prefetch_related("status_history")
        )


class JobApplicantsView(generics.ListAPIView):
    """GET /api/applications/job/<job_id>/ — recruiter views all applicants
    for one of their jobs (hiring pipeline / candidate comparison view)."""
    serializer_class = ApplicationForRecruiterSerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]
    filterset_fields = ["status"]

    def get_queryset(self):
        return (
            Application.objects.filter(
                job_id=self.kwargs["job_id"], job__posted_by=self.request.user,
            )
            .select_related("candidate", "job", "resume")
        )


class UpdateApplicationStatusView(APIView):
    """PATCH /api/applications/<id>/status/ — recruiter moves candidate
    through the hiring pipeline (shortlist / reject / interview / hire)."""
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def patch(self, request, pk):
        application = Application.objects.filter(pk=pk, job__posted_by=request.user).first()
        if not application:
            return Response({"message": "Application not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ApplicationStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        application.status = serializer.validated_data["status"]
        application.save(update_fields=["status", "updated_at"])
        ApplicationStatusHistory.objects.create(
            application=application, status=application.status,
            changed_by=request.user, note=serializer.validated_data.get("note", ""),
        )
        ActivityLog.objects.create(
            user=request.user, action=ActivityLog.ActionType.APPLICATION_STATUS_CHANGED,
            description=f"{application.candidate.email} -> {application.status}",
            ip_address=request.client_ip,
        )
        return Response(ApplicationForRecruiterSerializer(application).data)


class WithdrawApplicationView(APIView):
    """POST /api/applications/<id>/withdraw/ — candidate withdraws."""
    permission_classes = [permissions.IsAuthenticated, IsCandidate]

    def post(self, request, pk):
        application = Application.objects.filter(pk=pk, candidate=request.user).first()
        if not application:
            return Response({"message": "Application not found."}, status=status.HTTP_404_NOT_FOUND)
        application.status = Application.Status.WITHDRAWN
        application.save(update_fields=["status", "updated_at"])
        ApplicationStatusHistory.objects.create(
            application=application, status=Application.Status.WITHDRAWN, changed_by=request.user,
        )
        return Response({"message": "Application withdrawn."})


class ExportJobApplicantsCSVView(APIView):
    """GET /api/applications/job/<job_id>/export/ — CSV download of every
    applicant for one of the recruiter's own jobs (the "Export Applicants"
    bonus feature)."""
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def get(self, request, job_id):
        import csv
        from django.http import HttpResponse

        applications = (
            Application.objects.filter(job_id=job_id, job__posted_by=request.user)
            .select_related("candidate", "job")
            .order_by("-applied_at")
        )
        if not applications.exists() and not Application.objects.filter(job_id=job_id).exists():
            return Response({"message": "No applicants found for this job."}, status=status.HTTP_404_NOT_FOUND)

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = f'attachment; filename="applicants_{job_id}.csv"'

        writer = csv.writer(response)
        writer.writerow([
            "Candidate Name", "Email", "Phone", "Status", "Match Score",
            "Applied At", "Resume URL",
        ])
        for app in applications:
            writer.writerow([
                app.candidate.full_name,
                app.candidate.email,
                app.candidate.phone,
                app.get_status_display(),
                app.match_score if app.match_score is not None else "",
                app.applied_at.strftime("%Y-%m-%d %H:%M"),
                app.resume.file.url if app.resume and app.resume.file else "",
            ])
        return response
