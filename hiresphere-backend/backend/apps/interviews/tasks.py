from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail


@shared_task
def send_interview_reminder(interview_id):
    """Fires at the interview's scheduled_at (via Celery ETA) to send a
    reminder email — also the hook point for the 'Interview Reminder'
    notification bonus feature."""
    from .models import Interview
    from apps.notifications.models import Notification

    interview = Interview.objects.select_related("application__candidate", "application__job").filter(
        id=interview_id, status=Interview.Status.SCHEDULED,
    ).first()
    if not interview:
        return

    candidate = interview.application.candidate
    job_title = interview.application.job.title

    Notification.objects.create(
        recipient=candidate,
        type=Notification.Type.INTERVIEW_REMINDER,
        title="Interview reminder",
        message=f"Your interview for {job_title} is starting soon.",
        link="/interviews",
    )
    send_mail(
        subject=f"Reminder: your interview for {job_title}",
        message=f"This is a reminder that your interview for {job_title} is scheduled now.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[candidate.email],
        fail_silently=True,
    )
