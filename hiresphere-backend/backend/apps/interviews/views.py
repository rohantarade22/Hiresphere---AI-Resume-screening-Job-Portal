from rest_framework import generics, permissions

from apps.applications.models import Application
from apps.core.models import ActivityLog
from apps.core.permissions import IsRecruiter, IsCandidate
from .models import Interview
from .serializers import InterviewSerializer, InterviewDetailSerializer
from .tasks import send_interview_reminder


class ScheduleInterviewView(generics.CreateAPIView):
    """POST /api/interviews/ — recruiter schedules an interview for an applicant."""
    serializer_class = InterviewSerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def perform_create(self, serializer):
        application = Application.objects.get(
            pk=self.request.data.get("application"), job__posted_by=self.request.user,
        )
        interview = serializer.save(application=application, scheduled_by=self.request.user)
        application.status = Application.Status.INTERVIEW
        application.save(update_fields=["status", "updated_at"])
        ActivityLog.objects.create(
            user=self.request.user, action=ActivityLog.ActionType.INTERVIEW_SCHEDULED,
            description=f"Interview scheduled with {application.candidate.email}",
            ip_address=self.request.client_ip,
        )
        send_interview_reminder.apply_async(args=[str(interview.id)], eta=interview.scheduled_at)


class RecruiterInterviewListView(generics.ListAPIView):
    """GET /api/interviews/mine-as-recruiter/ — interview calendar for recruiter dashboard."""
    serializer_class = InterviewDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def get_queryset(self):
        return Interview.objects.filter(application__job__posted_by=self.request.user).select_related(
            "application", "application__job", "application__candidate",
        )


class CandidateInterviewListView(generics.ListAPIView):
    """GET /api/interviews/mine-as-candidate/ — candidate's upcoming interviews."""
    serializer_class = InterviewDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsCandidate]

    def get_queryset(self):
        return Interview.objects.filter(application__candidate=self.request.user).select_related(
            "application", "application__job",
        )


class InterviewDetailView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/interviews/<id>/ — reschedule, add feedback, mark completed."""
    serializer_class = InterviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "recruiter":
            return Interview.objects.filter(application__job__posted_by=user)
        return Interview.objects.filter(application__candidate=user)
