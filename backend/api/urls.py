from django.urls import path
from .views import scan_api

urlpatterns = [
    path("scan/", scan_api),
]