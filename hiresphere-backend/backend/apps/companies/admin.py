from django.contrib import admin
from .models import Company, RecruiterProfile


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ["name", "industry", "size", "is_verified", "created_at"]
    list_filter = ["is_verified", "size"]
    search_fields = ["name", "industry"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(RecruiterProfile)
class RecruiterProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "company", "job_title"]
    search_fields = ["user__email", "company__name"]
