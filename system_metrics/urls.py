from django.urls import path
from .views import (
    SystemMetricsView,
    ProcessListView,
    GPUMetricsView,
    DiskDetailsView,
    NetworkInterfacesView,
)

urlpatterns = [
    path('metrics/', SystemMetricsView.as_view(), name='system_metrics'),
    path('metrics/processes/', ProcessListView.as_view(), name='process_list'),
    path('metrics/gpu/', GPUMetricsView.as_view(), name='gpu_metrics'),
    path('metrics/disk/', DiskDetailsView.as_view(), name='disk_details'),
    path('metrics/network/', NetworkInterfacesView.as_view(), name='network_interfaces'),
]