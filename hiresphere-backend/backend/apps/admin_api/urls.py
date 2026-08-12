from django.urls import path
from . import views

urlpatterns = [
    path("stats/", views.PlatformStatsView.as_view(), name="admin-stats"),
    path("users/", views.AdminUserListView.as_view(), name="admin-user-list"),
    path("users/export/", views.ExportUsersCSVView.as_view(), name="admin-users-export"),
    path("users/<uuid:pk>/", views.AdminUserDetailView.as_view(), name="admin-user-detail"),
    path("recruiters/pending/", views.PendingRecruitersView.as_view(), name="admin-pending-recruiters"),
    path("recruiters/<uuid:pk>/approve/", views.ApproveRecruiterView.as_view(), name="admin-approve-recruiter"),
    path("recruiters/<uuid:pk>/reject/", views.RejectRecruiterView.as_view(), name="admin-reject-recruiter"),
    path("jobs/", views.AdminJobListView.as_view(), name="admin-job-list"),
    path("jobs/export/", views.ExportJobsCSVView.as_view(), name="admin-jobs-export"),
    path("jobs/<uuid:pk>/unpublish/", views.AdminJobModerateView.as_view(), name="admin-job-unpublish"),
    path("logs/", views.SystemLogsView.as_view(), name="admin-logs"),
]
