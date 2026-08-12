from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsCandidate(BasePermission):
    message = "Only candidates can perform this action."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "candidate")


class IsRecruiter(BasePermission):
    message = "Only recruiters can perform this action."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "recruiter")


class IsAdminRole(BasePermission):
    message = "Only administrators can perform this action."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "admin")


class IsOwnerOrReadOnly(BasePermission):
    """Object-level permission: only the owning user may write; anyone
    with model-level read access may view (used e.g. on public job posts
    edited only by the recruiter who created them)."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        owner = getattr(obj, "user", None) or getattr(obj, "recruiter", None) or getattr(obj, "candidate", None)
        return owner == request.user


class IsRecruiterOwnerOfCompany(BasePermission):
    """Recruiter may only manage jobs/applicants belonging to their own company."""

    def has_object_permission(self, request, view, obj):
        company = getattr(obj, "company", None) or getattr(getattr(obj, "job", None), "company", None)
        recruiter_profile = getattr(request.user, "recruiter_profile", None)
        return bool(company and recruiter_profile and company_id_matches(company, recruiter_profile))


def company_id_matches(company, recruiter_profile):
    return company_id(company) == company_id(recruiter_profile.company)


def company_id(company):
    return getattr(company, "id", company)
