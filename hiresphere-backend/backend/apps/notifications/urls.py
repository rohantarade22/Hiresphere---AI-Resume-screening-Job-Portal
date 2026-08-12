from django.urls import path
from . import views

urlpatterns = [
    path("", views.NotificationListView.as_view(), name="notification-list"),
    path("read-all/", views.MarkAllNotificationsReadView.as_view(), name="notifications-read-all"),
    path("<uuid:pk>/read/", views.MarkNotificationReadView.as_view(), name="notification-read"),
]
