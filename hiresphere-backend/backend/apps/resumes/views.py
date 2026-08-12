from rest_framework import generics, permissions

from apps.core.models import ActivityLog
from .models import Resume
from .serializers import ResumeSerializer
from .tasks import parse_resume


class ResumeUploadListView(generics.ListCreateAPIView):
    """GET /api/resumes/ — candidate's resume history
    POST /api/resumes/ — drag-and-drop upload, kicks off async AI parsing
    """
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(candidate=self.request.user)

    def perform_create(self, serializer):
        resume = serializer.save(
            candidate=self.request.user,
            original_filename=self.request.data.get("file").name if self.request.data.get("file") else "",
        )
        parse_resume.delay(str(resume.id))
        ActivityLog.objects.create(
            user=self.request.user, action=ActivityLog.ActionType.RESUME_UPLOADED,
            description="Resume uploaded", ip_address=self.request.client_ip,
        )


class ResumeDetailView(generics.RetrieveDestroyAPIView):
    """GET/DELETE /api/resumes/<id>/"""
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(candidate=self.request.user)
