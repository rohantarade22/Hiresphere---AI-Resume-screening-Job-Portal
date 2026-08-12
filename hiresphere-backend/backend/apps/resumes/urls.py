from django.urls import path
from . import views

urlpatterns = [
    path("", views.ResumeUploadListView.as_view(), name="resume-list-create"),
    path("<uuid:pk>/", views.ResumeDetailView.as_view(), name="resume-detail"),
]
