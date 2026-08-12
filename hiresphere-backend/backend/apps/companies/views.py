from rest_framework import generics, permissions
from apps.core.permissions import IsRecruiter
from .models import Company, RecruiterProfile
from .serializers import CompanySerializer, RecruiterProfileSerializer


class CompanyListView(generics.ListAPIView):
    """GET /api/companies/ — public directory, powers the landing page's
    'Trusted Companies' strip and the Company Page."""
    queryset = Company.objects.filter(is_verified=True)
    serializer_class = CompanySerializer
    permission_classes = [permissions.AllowAny]
    search_fields = ["name", "industry"]


class CompanyDetailView(generics.RetrieveAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"


class MyCompanyView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/companies/me/ — recruiter manages their own company profile."""
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def get_object(self):
        return self.request.user.recruiter_profile.company
