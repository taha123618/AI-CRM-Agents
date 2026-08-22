"""Prometheus Metrics Exporter Endpoint."""

from fastapi import APIRouter, Response
from services.metrics_service import MetricsService

router = APIRouter()

PROMETHEUS_CONTENT_TYPE = "text/plain; version=0.0.4; charset=utf-8"


@router.get("", response_class=Response)
@router.get("/", response_class=Response)
async def get_metrics():
    """Expose application and multi-agent metrics in Prometheus text exposition format."""
    metrics_text = MetricsService.get_prometheus_metrics_text()
    return Response(content=metrics_text, media_type=PROMETHEUS_CONTENT_TYPE)
