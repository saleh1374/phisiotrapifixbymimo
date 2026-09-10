from django.contrib.auth.backends import ModelBackend
from django.db.models import Q

from .models import User


class PhoneOrUsernameBackend(ModelBackend):
    """Authenticate using username OR phone number (instead of only username)."""

    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None or password is None:
            return None
        try:
            user = User.objects.get(
                Q(username__iexact=username) | Q(phone_number=username)
            )
        except User.DoesNotExist:
            return None
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
