from django.urls import path
from . import views

urlpatterns = [
    path("", views.JobListCreateView.as_view(), name="job-list-create"),
    path("mine/", views.MyJobsView.as_view(), name="my-jobs"),
    path("recommended/", views.RecommendedJobsView.as_view(), name="recommended-jobs"),
    path("saved/", views.SavedJobListCreateView.as_view(), name="saved-jobs"),
    path("saved/<uuid:job_id>/", views.SavedJobDeleteView.as_view(), name="unsave-job"),
    path("analytics/", views.RecruiterAnalyticsView.as_view(), name="recruiter-analytics"),
    path("<slug:slug>/", views.JobDetailView.as_view(), name="job-detail"),
    path("<slug:slug>/publish/", views.PublishJobView.as_view(), name="job-publish"),
]
