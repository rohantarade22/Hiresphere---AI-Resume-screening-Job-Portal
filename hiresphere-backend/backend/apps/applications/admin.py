from django.contrib import admin
from .models import Application, ApplicationStatusHistory


class StatusHistoryInline(admin.TabularInline):
    model = ApplicationStatusHistory
    extra = 0
    readonly_fields = ["status", "changed_by", "note", "created_at"]


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ["candidate", "job", "status", "match_score", "applied_at"]
    list_filter = ["status"]
    search_fields = ["candidate__email", "job__title"]
    inlines = [StatusHistoryInline]
