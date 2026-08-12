import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """Wraps DRF's default handler to return a consistent error envelope:

        {
          "success": false,
          "message": "Human readable summary",
          "errors": { "field": ["reason"] }   # or null
        }

    This keeps the frontend's Axios error interceptor simple — one shape
    to parse regardless of whether it's a validation error, auth failure,
    throttle, or 500.
    """
    response = exception_handler(exc, context)

    if response is not None:
        errors = response.data if isinstance(response.data, dict) else {"detail": response.data}
        message = errors.get("detail") if isinstance(errors, dict) and "detail" in errors else "Request failed."
        response.data = {
            "success": False,
            "message": str(message),
            "errors": errors,
        }
        return response

    # Unhandled exception — don't leak internals, but do log them.
    logger.exception("Unhandled exception", exc_info=exc)
    return Response(
        {
            "success": False,
            "message": "An unexpected error occurred. Please try again.",
            "errors": None,
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
