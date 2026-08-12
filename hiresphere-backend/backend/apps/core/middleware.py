class ActivityLogMiddleware:
    """Attaches request metadata (IP, user agent) to the request object so
    views can cheaply write ActivityLog entries without re-parsing headers.

    Actual ActivityLog.objects.create(...) calls happen inside the views/
    serializers that represent a meaningful business event (login, job
    created, application submitted, etc.) — this middleware only prepares
    the common context and stays deliberately free of business logic.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.client_ip = self._get_client_ip(request)
        request.client_user_agent = request.META.get("HTTP_USER_AGENT", "")[:255]
        return self.get_response(request)

    @staticmethod
    def _get_client_ip(request):
        forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR")
