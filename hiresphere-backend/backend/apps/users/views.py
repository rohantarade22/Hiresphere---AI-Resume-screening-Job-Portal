from datetime import timedelta

from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.core.models import ActivityLog
from .models import User, CandidateProfile, EmailVerificationToken, PasswordResetToken, Skill
from .serializers import (
    RegisterCandidateSerializer,
    RegisterRecruiterSerializer,
    CustomTokenObtainPairSerializer,
    UserSerializer,
    CandidateProfileSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    SkillSerializer,
)
from .tasks import send_verification_email, send_password_reset_email


class RegisterCandidateView(generics.CreateAPIView):
    """POST /api/auth/register/candidate/"""
    serializer_class = RegisterCandidateSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        _issue_verification_email(user)
        ActivityLog.objects.create(
            user=user, action=ActivityLog.ActionType.REGISTER,
            description="Candidate registered", ip_address=self.request.client_ip,
        )


class RegisterRecruiterView(generics.CreateAPIView):
    """POST /api/auth/register/recruiter/"""
    serializer_class = RegisterRecruiterSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        _issue_verification_email(user)
        ActivityLog.objects.create(
            user=user, action=ActivityLog.ActionType.REGISTER,
            description="Recruiter registered (pending approval)", ip_address=self.request.client_ip,
        )


def _issue_verification_email(user: User):
    token = EmailVerificationToken.objects.create(
        user=user, expires_at=timezone.now() + timedelta(hours=48),
    )
    send_verification_email.delay(str(user.id), str(token.id))


class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token_id = request.data.get("token")
        try:
            token = EmailVerificationToken.objects.select_related("user").get(id=token_id)
        except (EmailVerificationToken.DoesNotExist, ValueError):
            return Response({"message": "Invalid verification token."}, status=status.HTTP_400_BAD_REQUEST)

        if not token.is_valid():
            return Response({"message": "Verification token expired or already used."}, status=status.HTTP_400_BAD_REQUEST)

        token.used = True
        token.save(update_fields=["used"])
        token.user.is_verified = True
        token.user.save(update_fields=["is_verified"])
        return Response({"message": "Email verified successfully."})


class CustomTokenObtainPairView(TokenObtainPairView):
    """POST /api/auth/login/ — role-aware JWT login."""
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            email = request.data.get("email")
            user = User.objects.filter(email=email).first()
            if user:
                user.last_login_ip = request.client_ip
                user.save(update_fields=["last_login_ip", "last_login"])
                ActivityLog.objects.create(
                    user=user, action=ActivityLog.ActionType.LOGIN,
                    ip_address=request.client_ip, user_agent=request.client_user_agent,
                )
        return response


class RefreshTokenView(TokenRefreshView):
    """POST /api/auth/refresh/"""
    pass


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        user = User.objects.filter(email=email).first()
        if user:
            token = PasswordResetToken.objects.create(
                user=user, expires_at=timezone.now() + timedelta(hours=1),
            )
            send_password_reset_email.delay(str(user.id), str(token.id))

        # Always return 200 — don't leak whether an email is registered.
        return Response({"message": "If that email exists, a reset link has been sent."})


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token_id = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        try:
            token = PasswordResetToken.objects.select_related("user").get(id=token_id)
        except PasswordResetToken.DoesNotExist:
            return Response({"message": "Invalid reset token."}, status=status.HTTP_400_BAD_REQUEST)

        if not token.is_valid():
            return Response({"message": "Reset token expired or already used."}, status=status.HTTP_400_BAD_REQUEST)

        token.user.set_password(new_password)
        token.user.save(update_fields=["password"])
        token.used = True
        token.save(update_fields=["used"])
        return Response({"message": "Password reset successfully."})


class MeView(APIView):
    """GET /api/auth/me/ — current authenticated user."""

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class CandidateProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/candidate-profile/"""
    serializer_class = CandidateProfileSerializer

    def get_object(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return profile


class SkillListView(generics.ListAPIView):
    """GET /api/auth/skills/?search=react — used for autocomplete inputs."""
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [permissions.AllowAny]
    search_fields = ["name"]
