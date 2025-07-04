# src/system_metrics/models.py
from django.db import models

class SystemSnapshot(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    cpu_usage = models.FloatField()
    ram_usage = models.FloatField()
    disk_usage = models.FloatField()
    network_sent = models.FloatField()
    network_recv = models.FloatField()

    def __str__(self):
        return f"Snapshot at {self.timestamp}"

class ProcessSnapshot(models.Model):
    snapshot = models.ForeignKey(SystemSnapshot, on_delete=models.CASCADE, related_name='processes')
    pid = models.IntegerField()
    name = models.CharField(max_length=255)
    cpu_percent = models.FloatField()
    memory_percent = models.FloatField()

    def __str__(self):
        return f"{self.name} (PID {self.pid})"

class Metric(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    cpu_percent = models.FloatField()
    ram_percent = models.FloatField()
    battery_percent = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.timestamp}: CPU={self.cpu_percent}, RAM={self.ram_percent}, Battery={self.battery_percent}"
