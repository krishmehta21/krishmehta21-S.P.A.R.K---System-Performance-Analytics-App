# src/system_metrics/views.py
import psutil
import platform
import socket
import datetime
from django.utils.timezone import now, make_aware
from rest_framework.views import APIView
from rest_framework.response import Response
import GPUtil
import psutil
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils.timezone import make_aware
import datetime
from .models import Metric

PER_CORE_HISTORY = []

class SystemMetricsView(APIView):
    def get(self, request):
        # CPU
        cpu_percent_total = psutil.cpu_percent(interval=0.5)
        cpu_percent_per_core = psutil.cpu_percent(percpu=True)
        # Update history
        global PER_CORE_HISTORY
        timestamp = now().isoformat()
        if not PER_CORE_HISTORY or len(PER_CORE_HISTORY) != len(cpu_percent_per_core):
            PER_CORE_HISTORY = [[] for _ in cpu_percent_per_core]
        for i, val in enumerate(cpu_percent_per_core):
            PER_CORE_HISTORY[i].append({'time': timestamp, 'usage': val})
            if len(PER_CORE_HISTORY[i]) > 20:
                PER_CORE_HISTORY[i] = PER_CORE_HISTORY[i][-20:]
        cpu_cores = psutil.cpu_count(logical=False)
        cpu_threads = psutil.cpu_count()

        # RAM
        virtual_mem = psutil.virtual_memory()
        ram_total = round(virtual_mem.total / (1024 ** 3), 2)  # GB
        ram_used = round(virtual_mem.used / (1024 ** 3), 2)
        ram_percent = virtual_mem.percent

        # Disk - handle platform specific root path
        root_path = '/'
        if platform.system() == 'Windows':
            root_path = 'C:\\'

        try:
            disk = psutil.disk_usage(root_path)
            disk_io = psutil.disk_io_counters()
            disk_read = disk_io.read_bytes / (1024 ** 2)  # MB
            disk_write = disk_io.write_bytes / (1024 ** 2)  # MB
            disk_total = round(disk.total / (1024 ** 3), 2)
            disk_used = round(disk.used / (1024 ** 3), 2)
            disk_percent = disk.percent
        except Exception:
            disk_total = disk_used = disk_percent = disk_read = disk_write = None

        # Network
        net_io = psutil.net_io_counters()
        net_sent = round(net_io.bytes_sent / (1024 ** 2), 2)  # MB
        net_recv = round(net_io.bytes_recv / (1024 ** 2), 2)  # MB

        # Battery (if present)
        battery_info = {}
        try:
            if hasattr(psutil, "sensors_battery"):
                battery = psutil.sensors_battery()
                if battery:
                    battery_info = {
                        "percent": battery.percent,
                        "plugged_in": battery.power_plugged,
                        "secs_left": battery.secsleft,
                    }
        except Exception:
            battery_info = {}

        # Save metrics to database
        Metric.objects.create(
            cpu_percent=cpu_percent_total,
            ram_percent=ram_percent,
            battery_percent=battery_info.get("percent")
        )

        # Uptime
        boot_time = datetime.datetime.fromtimestamp(psutil.boot_time())
        try:
            boot_time = make_aware(boot_time)
        except Exception:
            pass
        uptime = now() - boot_time

        # System Info
        system_info = {
            "hostname": socket.gethostname(),
            "os": platform.system(),
            "os_version": platform.version(),
            "platform": platform.platform(),
            "architecture": platform.machine(),
            "processor": platform.processor(),
            "user": psutil.users()[0].name if psutil.users() else None,
        }

        return Response({
            "timestamp": now().isoformat(),
            "cpu": {
                "total_percent": cpu_percent_total,
                "per_core_percent": cpu_percent_per_core,
                "per_core_history": PER_CORE_HISTORY,
                "cores": cpu_cores,
                "threads": cpu_threads,
            },
            "ram": {
                "total_gb": ram_total,
                "used_gb": ram_used,
                "percent": ram_percent,
            },
            "disk": {
                "total_gb": disk_total,
                "used_gb": disk_used,
                "percent": disk_percent,
                "read_mb": round(disk_read, 2) if disk_read is not None else None,
                "write_mb": round(disk_write, 2) if disk_write is not None else None,
            },
            "network": {
                "sent_mb": net_sent,
                "recv_mb": net_recv,
            },
            "battery": battery_info,
            "uptime": {
                "start_time": boot_time.isoformat() if boot_time else None,
                "uptime_str": str(uptime).split('.')[0],  # HH:MM:SS
            },
            "system": system_info
        })

class ProcessListView(APIView):
    def get(self, request):
        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent', 'status', 'create_time']):
            try:
                pinfo = proc.info
                pinfo['started'] = None
                if pinfo.get('create_time'):
                    dt = datetime.datetime.fromtimestamp(pinfo['create_time'])
                    pinfo['started'] = make_aware(dt).isoformat()
                processes.append({
                    "pid": pinfo.get('pid'),
                    "name": pinfo.get('name'),
                    "cpu_percent": pinfo.get('cpu_percent'),
                    "memory_percent": round(pinfo.get('memory_percent', 0), 2),
                    "status": pinfo.get('status'),
                    "started": pinfo.get('started'),
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        # Optionally, sort by CPU percent descending and limit to top N
        processes = sorted(processes, key=lambda x: x['cpu_percent'], reverse=True)[:50]
        return Response(processes)



class GPUMetricsView(APIView):
    def get(self, request):
        gpus = []
        try:
            gpu_list = GPUtil.getGPUs()
            for gpu in gpu_list:
                gpus.append({
                    "id": gpu.id,
                    "name": gpu.name,
                    "load": round(gpu.load * 100, 2),
                    "memory_total_mb": gpu.memoryTotal,
                    "memory_used_mb": gpu.memoryUsed,
                    "memory_free_mb": gpu.memoryFree,
                    "temperature_c": gpu.temperature,
                    "fan_speed": gpu.fanSpeed,  # might be None
                })
        except Exception:
            # No GPUs or error
            gpus = []
        return Response(gpus)


class DiskDetailsView(APIView):
    def get(self, request):
        partitions = []
        for partition in psutil.disk_partitions(all=False):
            try:
                usage = psutil.disk_usage(partition.mountpoint)
                partitions.append({
                    "device": partition.device,
                    "mountpoint": partition.mountpoint,
                    "fstype": partition.fstype,
                    "opts": partition.opts,
                    "total_gb": round(usage.total / (1024 ** 3), 2),
                    "used_gb": round(usage.used / (1024 ** 3), 2),
                    "free_gb": round(usage.free / (1024 ** 3), 2),
                    "percent": usage.percent,
                })
            except PermissionError:
                pass
        return Response(partitions)


class NetworkInterfacesView(APIView):
    def get(self, request):
        net_io_counters = psutil.net_io_counters(pernic=True)
        interfaces = []
        for iface, stats in net_io_counters.items():
            interfaces.append({
                "interface": iface,
                "bytes_sent_mb": round(stats.bytes_sent / (1024 ** 2), 2),
                "bytes_recv_mb": round(stats.bytes_recv / (1024 ** 2), 2),
                "packets_sent": stats.packets_sent,
                "packets_recv": stats.packets_recv,
                "errin": stats.errin,
                "errout": stats.errout,
                "dropin": stats.dropin,
                "dropout": stats.dropout,
            })
        return Response(interfaces)
