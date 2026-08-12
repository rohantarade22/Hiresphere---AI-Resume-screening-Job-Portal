import logging

from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task
def parse_resume(resume_id):
    """AI resume-parsing pipeline entry point. Runs off the request/response
    cycle since PDF text extraction + scoring can take a moment on larger
    files. See apps.resumes.services for the actual extraction/scoring logic.
    """
    from .models import Resume
    from .services import parse_resume_file
    from apps.users.models import Skill
    from apps.notifications.models import Notification

    resume = Resume.objects.filter(id=resume_id).first()
    if not resume:
        return

    resume.parse_status = Resume.ParseStatus.PROCESSING
    resume.save(update_fields=["parse_status"])

    try:
        known_skill_names = list(Skill.objects.values_list("name", flat=True))
        with resume.file.open("rb") as f:
            result = parse_resume_file(f, known_skill_names)

        for field, value in result.items():
            setattr(resume, field, value)
        resume.parse_status = Resume.ParseStatus.COMPLETED
        resume.save()

        Notification.objects.create(
            recipient=resume.candidate,
            type=Notification.Type.SYSTEM,
            title="Resume analysis ready",
            message=f"Your resume scored {resume.resume_score}/100. See the full breakdown.",
            link="/candidate/profile",
        )

        # Auto-sync detected skills into the candidate's profile skill list
        # so job recommendations improve immediately after upload.
        profile = getattr(resume.candidate, "candidate_profile", None)
        if profile and resume.extracted_skills:
            matched_skills = Skill.objects.filter(name__in=resume.extracted_skills)
            profile.skills.add(*matched_skills)
            profile.recompute_completion()

    except Exception:
        logger.exception("Resume parsing failed for resume_id=%s", resume_id)
        resume.parse_status = Resume.ParseStatus.FAILED
        resume.ai_feedback = "We couldn't analyze this file — try re-uploading as a text-based (not scanned) PDF."
        resume.save(update_fields=["parse_status", "ai_feedback"])
