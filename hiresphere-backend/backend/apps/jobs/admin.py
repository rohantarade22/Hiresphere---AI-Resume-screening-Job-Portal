from django.contrib import admin
from .models import Job, SavedJob


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ["title", "company", "status", "work_mode", "experience_level", "applicants_count", "published_at"]
    list_filter = ["status", "work_mode", "job_type", "experience_level"]
    search_fields = ["title", "company__name", "location"]
    prepopulated_fields = {"slug": ("title",)}


admin.site.register(SavedJob)
