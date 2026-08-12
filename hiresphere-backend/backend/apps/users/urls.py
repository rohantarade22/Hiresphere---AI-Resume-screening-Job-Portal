from django.urls import path
from . import views

urlpatterns = [
    path("register/candidate/", views.RegisterCandidateView.as_view(), name="register-candidate"),
    path("register/recruiter/", views.RegisterRecruiterView.as_view(), name="register-recruiter"),
    path("verify-email/", views.VerifyEmailView.as_view(), name="verify-email"),

    path("login/", views.CustomTokenObtainPairView.as_view(), name="token-obtain-pair"),
    path("refresh/", views.RefreshTokenView.as_view(), name="token-refresh"),

    path("forgot-password/", views.ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password/", views.ResetPasswordView.as_view(), name="reset-password"),

    path("me/", views.MeView.as_view(), name="me"),
    path("candidate-profile/", views.CandidateProfileView.as_view(), name="candidate-profile"),
    path("skills/", views.SkillListView.as_view(), name="skills-list"),
]
