from django.urls import path
from . import views

urlpatterns = [
    path("apply/", views.ApplyToJobView.as_view(), name="apply-to-job"),
    path("mine/", views.MyApplicationsView.as_view(), name="my-applications"),
    path("job/<uuid:job_id>/", views.JobApplicantsView.as_view(), name="job-applicants"),
    path("job/<uuid:job_id>/export/", views.ExportJobApplicantsCSVView.as_view(), name="job-applicants-export"),
    path("<uuid:pk>/status/", views.UpdateApplicationStatusView.as_view(), name="update-application-status"),
    path("<uuid:pk>/withdraw/", views.WithdrawApplicationView.as_view(), name="withdraw-application"),
]
