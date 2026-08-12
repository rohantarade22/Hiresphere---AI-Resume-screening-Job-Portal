from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail


@shared_task
def send_verification_email(user_id, token_id):
    from .models import User

    user = User.objects.filter(id=user_id).first()
    if not user:
        return
    link = f"{settings.FRONTEND_URL}/verify-email?token={token_id}"
    send_mail(
        subject="Verify your HireSphere AI account",
        message=f"Hi {user.full_name},\n\nVerify your email: {link}\n\nThis link expires in 48 hours.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )


@shared_task
def send_password_reset_email(user_id, token_id):
    from .models import User

    user = User.objects.filter(id=user_id).first()
    if not user:
        return
    link = f"{settings.FRONTEND_URL}/reset-password?token={token_id}"
    send_mail(
        subject="Reset your HireSphere AI password",
        message=f"Hi {user.full_name},\n\nReset your password: {link}\n\nThis link expires in 1 hour.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )
