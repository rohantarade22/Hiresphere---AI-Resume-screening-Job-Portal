from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import (
    User, CandidateProfile, Education, Experience, Certification, Project, Skill,
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ["-date_joined"]
    list_display = ["email", "full_name", "role", "is_verified", "is_approved", "is_active", "date_joined"]
    list_filter = ["role", "is_verified", "is_approved", "is_active"]
    search_fields = ["email", "full_name"]
    readonly_fields = ["id", "date_joined", "last_login"]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("full_name", "phone", "avatar_url")}),
        ("Role & status", {"fields": ("role", "is_verified", "is_approved", "is_active", "is_staff", "is_superuser")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "full_name", "role", "password1", "password2")}),
    )


@admin.register(CandidateProfile)
class CandidateProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "headline", "profile_completion", "years_of_experience"]
    search_fields = ["user__email", "user__full_name", "headline"]


admin.site.register(Education)
admin.site.register(Experience)
admin.site.register(Certification)
admin.site.register(Project)
admin.site.register(Skill)
