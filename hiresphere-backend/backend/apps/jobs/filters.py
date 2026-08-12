import django_filters as filters
from .models import Job


class JobFilter(filters.FilterSet):
    """Backs the 'Advanced Filters' job search UI."""
    location = filters.CharFilter(field_name="location", lookup_expr="icontains")
    company = filters.CharFilter(field_name="company__name", lookup_expr="icontains")
    salary_min = filters.NumberFilter(field_name="salary_min", lookup_expr="gte")
    salary_max = filters.NumberFilter(field_name="salary_max", lookup_expr="lte")
    skills = filters.CharFilter(method="filter_skills")

    class Meta:
        model = Job
        fields = ["job_type", "work_mode", "experience_level", "category", "location", "company"]

    def filter_skills(self, queryset, name, value):
        skill_names = [s.strip() for s in value.split(",") if s.strip()]
        return queryset.filter(skills_required__name__in=skill_names).distinct()
