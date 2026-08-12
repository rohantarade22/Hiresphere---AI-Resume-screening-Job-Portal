from django.urls import path
from . import views

urlpatterns = [
    path("", views.ScheduleInterviewView.as_view(), name="schedule-interview"),
    path("mine-as-recruiter/", views.RecruiterInterviewListView.as_view(), name="recruiter-interviews"),
    path("mine-as-candidate/", views.CandidateInterviewListView.as_view(), name="candidate-interviews"),
    path("<uuid:pk>/", views.InterviewDetailView.as_view(), name="interview-detail"),
]
