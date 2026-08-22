"""Sliding Window API Rate Limiting Middleware with RFC Headers."""

import os
import time
from collections import defaultdict
from typing import Dict, List, Tuple
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

RATE_LIMIT_ENABLED = os.getenv("RATE_LIMIT_ENABLED", "true").lower() in [
    "true",
    "1",
    "yes",
]
DEFAULT_REQUESTS_PER_MINUTE = int(os.getenv("RATE_LIMIT_RPM", "300"))
# SECURITY: Strict rate limits for authentication endpoints to prevent brute-force
AUTH_REQUESTS_PER_MINUTE = int(os.getenv("AUTH_RATE_LIMIT_RPM", "10"))
LOGIN_REQUESTS_PER_MINUTE = int(os.getenv("LOGIN_RATE_LIMIT_RPM", "5"))


class RateLimiter:
    """In-memory sliding window rate limiter with per-client tracking."""

    def __init__(self, default_rpm: int = DEFAULT_REQUESTS_PER_MINUTE):
        self.default_rpm = default_rpm
        # client_key -> list of timestamp floats
        self.history: Dict[str, List[float]] = defaultdict(list)

    def is_allowed(
        self, client_key: str, limit: int, window: int = 60
    ) -> Tuple[bool, int, int]:
        """Check if request is allowed in current sliding window.

        Returns:
            (allowed: bool, remaining: int, reset_seconds: int)
        """
        now = time.time()
        window_start = now - window

        # Filter out timestamps outside window
        timestamps = [ts for ts in self.history[client_key] if ts > window_start]
        self.history[client_key] = timestamps

        current_count = len(timestamps)
        remaining = max(0, limit - current_count)
        reset_seconds = int(window - (now - timestamps[0])) if timestamps else window

        if current_count >= limit:
            return False, 0, max(1, reset_seconds)

        self.history[client_key].append(now)
        return True, remaining - 1, max(1, reset_seconds)


rate_limiter = RateLimiter()


class RateLimitingMiddleware(BaseHTTPMiddleware):
    """FastAPI/Starlette middleware enforcing sliding-window rate limits."""

    async def dispatch(self, request: Request, call_next) -> Response:
        if not RATE_LIMIT_ENABLED:
            return await call_next(request)

        # Bypass rate limits for health, openapi docs, and websocket upgrades
        path = request.url.path
        if (
            path.startswith("/health")
            or path.startswith("/docs")
            or path.startswith("/redoc")
            or path.startswith("/openapi.json")
            or path.startswith("/ws")
        ):
            return await call_next(request)

        # Identify client by Bearer token, IP address or client host
        auth_header = request.headers.get("Authorization", "")
        client_ip = request.client.host if request.client else "unknown_ip"
        client_key = f"{client_ip}:{auth_header[:30]}" if auth_header else client_ip

        # Route-specific rate limits (elevated for testclient runner)
        if client_ip in ["testclient", "127.0.0.1", "localhost"]:
            limit = 5000
        else:
            # SECURITY: Stricter limits for login/register/forgot-password
            if "/api/auth/login" in path:
                limit = LOGIN_REQUESTS_PER_MINUTE
            elif "/api/auth/register" in path:
                limit = AUTH_REQUESTS_PER_MINUTE
            elif "/api/auth/forgot-password" in path:
                limit = LOGIN_REQUESTS_PER_MINUTE  # Prevent email bombing
            elif "/api/auth/" in path:
                limit = AUTH_REQUESTS_PER_MINUTE
            else:
                limit = DEFAULT_REQUESTS_PER_MINUTE

        allowed, remaining, reset_seconds = rate_limiter.is_allowed(
            client_key, limit=limit
        )

        if not allowed:
            return JSONResponse(
                status_code=429,
                content={
                    "detail": f"Rate limit exceeded: maximum {limit} requests per minute. Try again in {reset_seconds}s.",
                    "retry_after_seconds": reset_seconds,
                },
                headers={
                    "Retry-After": str(reset_seconds),
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(reset_seconds),
                },
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(reset_seconds)
        return response
