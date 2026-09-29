from django.urls import path

from . import services_api as services_views
from . import views

urlpatterns = [
    # Theme (admin + public)
    path("theme/", views.ThemeView.as_view(), name="admin-theme"),
    path("public/theme/", views.PublicThemeView.as_view(), name="public-theme"),
    # Branding images
    path("branding/", views.BrandingView.as_view(), name="admin-branding"),
    path("public/branding/", views.PublicBrandingView.as_view(), name="public-branding"),
    # Media library
    path("media/", views.MediaLibraryView.as_view(), name="admin-media"),
    path("media/<uuid:pk>/", views.MediaAssetDetailView.as_view(), name="admin-media-detail"),
    # Editable content
    path("content/", views.ContentBlocksView.as_view(), name="admin-content"),
    path("content/<str:key>/", views.ContentBlockDetailView.as_view(), name="admin-content-detail"),
    path("public/content/", views.PublicContentView.as_view(), name="public-content"),
    # Managed services (/services page)
    path("services/", services_views.AdminServicesView.as_view(), name="admin-services"),
    path("services/<uuid:pk>/", services_views.AdminServiceDetailView.as_view(), name="admin-service-detail"),
    path("public/services/", services_views.PublicServicesView.as_view(), name="public-services"),
]
