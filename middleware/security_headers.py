"""HTTP Security Headers Middleware for Enterprise Hardening."""

import os
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

# Security header configuration
IS_PRODUCTION = (
    os.getenv("APP_ENV", "").lower() == "production"
    or os.getenv("ENVIRONMENT", "").lower() == "production"
)

# Default Content Security Policy
CSP_POLICY = os.getenv(
    "CONTENT_SECURITY_POLICY",
    "default-src 'self'; "
    "img-src 'self' data: https:; "
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
    "style-src 'self' 'unsafe-inline'; "
    "connect-src 'self' ws: wss: https:; "
    "font-src 'self' data: https:; "
    "frame-ancestors 'none'; "
    "base-uri 'self'; "
    "form-action 'self';",
)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Starlette middleware that injects enterprise HTTP security headers into all responses."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)

        # Prevent MIME-sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # Prevent Clickjacking
        response.headers["X-Frame-Options"] = "DENY"

        # Enable XSS filtering in legacy browsers
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Referrer Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Permissions Policy (restrict sensitive browser APIs)
        response.headers[
            "Permissions-Policy"
        ] = "geolocation=(), camera=(), microphone=(), payment=(), usb=()"

        # Content Security Policy
        response.headers["Content-Security-Policy"] = CSP_POLICY

        # HTTP Strict Transport Security (HSTS) - Enforced in production or when explicitly configured
        if IS_PRODUCTION or os.getenv("FORCE_HSTS", "false").lower() in [
            "true",
            "1",
            "yes",
        ]:
            response.headers[
                "Strict-Transport-Security"
            ] = "max-age=31536000; includeSubDomains; preload"

        return response
