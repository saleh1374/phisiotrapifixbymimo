"""Services CRUD API — public list + admin management."""
from rest_framework import parsers, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from admin_api.views import _deny, _is_admin
from siteconfig.api.serializers import ServiceSerializer
from siteconfig.services_models import Service

# Icon whitelist rendered by the frontend (lucide names).
ALLOWED_ICONS = {
    "Sparkles", "ScanLine", "Zap", "Activity", "Dumbbell", "Stethoscope",
    "HeartPulse", "Bone", "Brain", "Footprints", "Hand", "Waves",
    "ThermometerSun", "BatteryCharging", "PersonStanding", "Accessibility",
}


class PublicServicesView(APIView):
    """Active services ordered for display."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        services = Service.objects.filter(is_active=True)
        return Response(ServiceSerializer(services, many=True).data)


class AdminServicesView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get(self, request):
        if not _is_admin(request.user):
            return _deny()
        services = Service.objects.all()
        return Response(ServiceSerializer(services, many=True).data)

    def post(self, request):
        if not _is_admin(request.user):
            return _deny()
        serializer = ServiceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = serializer.save()
        return Response(ServiceSerializer(service).data, status=status.HTTP_201_CREATED)


class AdminServiceDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def patch(self, request, pk):
        if not _is_admin(request.user):
            return _deny()
        service = Service.objects.filter(pk=pk).first()
        if service is None:
            return Response({"detail": "خدمت یافت نشد"}, status=status.HTTP_404_NOT_FOUND)
        serializer = ServiceSerializer(service, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(ServiceSerializer(service).data)

    def delete(self, request, pk):
        if not _is_admin(request.user):
            return _deny()
        service = Service.objects.filter(pk=pk).first()
        if service is None:
            return Response({"detail": "خدمت یافت نشد"}, status=status.HTTP_404_NOT_FOUND)
        service.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
