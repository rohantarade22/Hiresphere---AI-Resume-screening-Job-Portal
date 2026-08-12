from django.urls import path
from . import views

urlpatterns = [
    path("", views.CompanyListView.as_view(), name="company-list"),
    path("me/", views.MyCompanyView.as_view(), name="my-company"),
    path("<slug:slug>/", views.CompanyDetailView.as_view(), name="company-detail"),
]
