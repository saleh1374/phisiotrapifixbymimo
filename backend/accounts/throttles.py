from rest_framework.throttling import AnonRateThrottle, ScopedRateThrottle, UserRateThrottle


class OTPThrottle(ScopedRateThrottle):
    """Limits OTP requests per minute (brute-force protection)."""

    scope = "otp"


class LoginThrottle(ScopedRateThrottle):
    """Limits password login attempts per minute."""

    scope = "login"


class BurstThrottle(UserRateThrottle):
    """General burst rate limit for all authenticated endpoints."""

    scope = "burst"


class SustainedThrottle(UserRateThrottle):
    """Sustained rate limit for authenticated endpoints."""

    scope = "sustained"


class AdminThrottle(UserRateThrottle):
    """Stricter rate limit for admin endpoints."""

    rate = "60/min"