import logging

from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """Centralized DRF exception handler with structured logging."""
    response = exception_handler(exc, context)

    if response is not None:
        logger.warning(
            "API error: %s %s → %s: %s",
            context.get("request", {}).method if hasattr(context.get("request", {}), "method") else "?",
            context.get("request", {}).path if hasattr(context.get("request", {}), "path") else "?",
            response.status_code,
            response.data,
        )
    else:
        logger.exception("Unhandled exception in %s", context.get("view", ""))

    return response
