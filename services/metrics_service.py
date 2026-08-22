"""Prometheus Observability & Metrics Collection Service.

Collects and formats application metrics using standard Prometheus text exposition format (version 0.0.4).
"""

import time
from collections import defaultdict
from threading import Lock
from typing import Dict, Tuple

# Thread-safe metrics collector
_lock = Lock()

# Counters: (metric_name, labels_tuple) -> count
_counters: Dict[Tuple[str, Tuple[Tuple[str, str], ...]], float] = defaultdict(float)

# Summaries/Histograms: (metric_name, labels_tuple) -> (count, sum_val)
_summaries: Dict[
    Tuple[str, Tuple[Tuple[str, str], ...]], Tuple[int, float]
] = defaultdict(lambda: (0, 0.0))

# Gauges: (metric_name, labels_tuple) -> value
_gauges: Dict[Tuple[str, Tuple[Tuple[str, str], ...]], float] = defaultdict(float)


class MetricsService:
    """Thread-safe Prometheus metrics collector and formatter for CRM multi-agent architecture."""

    @classmethod
    def inc_counter(
        cls, name: str, value: float = 1.0, labels: Dict[str, str] = None
    ) -> None:
        """Increment a Prometheus counter."""
        label_tuple = tuple(sorted((labels or {}).items()))
        with _lock:
            _counters[(name, label_tuple)] += value

    @classmethod
    def set_gauge(cls, name: str, value: float, labels: Dict[str, str] = None) -> None:
        """Set a Prometheus gauge value."""
        label_tuple = tuple(sorted((labels or {}).items()))
        with _lock:
            _gauges[(name, label_tuple)] = value

    @classmethod
    def observe_summary(
        cls, name: str, value: float, labels: Dict[str, str] = None
    ) -> None:
        """Record an observation in a Prometheus summary."""
        label_tuple = tuple(sorted((labels or {}).items()))
        with _lock:
            count, total = _summaries[(name, label_tuple)]
            _summaries[(name, label_tuple)] = (count + 1, total + value)

    @classmethod
    def record_agent_execution(
        cls, agent: str, duration_seconds: float, status: str = "success"
    ) -> None:
        """Track AI agent run frequency, status, and execution latency."""
        cls.inc_counter(
            "crm_agent_executions_total", 1.0, {"agent": agent, "status": status}
        )
        cls.observe_summary(
            "crm_agent_execution_seconds", duration_seconds, {"agent": agent}
        )

    @classmethod
    def record_llm_tokens(
        cls, model: str, prompt_tokens: int, completion_tokens: int
    ) -> None:
        """Track LLM token consumption by model and token type."""
        if prompt_tokens > 0:
            cls.inc_counter(
                "crm_llm_tokens_consumed_total",
                float(prompt_tokens),
                {"model": model, "type": "prompt"},
            )
        if completion_tokens > 0:
            cls.inc_counter(
                "crm_llm_tokens_consumed_total",
                float(completion_tokens),
                {"model": model, "type": "completion"},
            )

    @classmethod
    def record_task_job(cls, job_type: str, status: str = "completed") -> None:
        """Track background queue job completions and failures."""
        cls.inc_counter(
            "crm_task_queue_jobs_total", 1.0, {"type": job_type, "status": status}
        )

    @classmethod
    def record_api_request(
        cls, method: str, endpoint: str, status_code: int, duration_seconds: float
    ) -> None:
        """Track HTTP request throughput and endpoint latency."""
        status_family = f"{status_code // 100}xx"
        cls.inc_counter(
            "crm_api_requests_total",
            1.0,
            {
                "method": method,
                "endpoint": endpoint,
                "status": str(status_code),
                "status_family": status_family,
            },
        )
        cls.observe_summary(
            "crm_api_request_duration_seconds", duration_seconds, {"endpoint": endpoint}
        )

    @classmethod
    def set_active_ws_connections(cls, count: int) -> None:
        """Track active WebSocket connections."""
        cls.set_gauge("crm_websocket_connections_active", float(count))

    @classmethod
    def format_labels(cls, labels_tuple: Tuple[Tuple[str, str], ...]) -> str:
        """Format label tuples into Prometheus metric format string."""
        if not labels_tuple:
            return ""
        items = [f'{k}="{v}"' for k, v in labels_tuple]
        return "{" + ",".join(items) + "}"

    @classmethod
    def get_prometheus_metrics_text(cls) -> str:
        """Render all collected metrics in standard Prometheus text format."""
        lines = []

        # System info header
        lines.append("# HELP crm_info System and build information")
        lines.append("# TYPE crm_info gauge")
        lines.append('crm_info{version="1.0.0",app="ai_powered_crm"} 1')

        with _lock:
            # Format Gauges
            gauge_types_seen = set()
            for (name, label_tuple), value in sorted(_gauges.items()):
                if name not in gauge_types_seen:
                    lines.append(f"# HELP {name} Gauge metric")
                    lines.append(f"# TYPE {name} gauge")
                    gauge_types_seen.add(name)
                lbl = cls.format_labels(label_tuple)
                lines.append(f"{name}{lbl} {value}")

            # Format Counters
            counter_types_seen = set()
            for (name, label_tuple), value in sorted(_counters.items()):
                if name not in counter_types_seen:
                    lines.append(f"# HELP {name} Total counter metric")
                    lines.append(f"# TYPE {name} counter")
                    counter_types_seen.add(name)
                lbl = cls.format_labels(label_tuple)
                lines.append(f"{name}{lbl} {value}")

            # Format Summaries
            summary_types_seen = set()
            for (name, label_tuple), (count, total) in sorted(_summaries.items()):
                if name not in summary_types_seen:
                    lines.append(f"# HELP {name} Summary observation metric")
                    lines.append(f"# TYPE {name} summary")
                    summary_types_seen.add(name)
                lbl = cls.format_labels(label_tuple)
                lines.append(f"{name}_count{lbl} {count}")
                lines.append(f"{name}_sum{lbl} {total:.6f}")

        # Prometheus metrics end with newline
        return "\n".join(lines) + "\n"
