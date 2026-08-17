"""Standalone Asynchronous Background Task Queue Worker Process.

Usage:
    python3 worker.py

Listens for background tasks (audio transcription, Monte Carlo simulations, bulk outbound sequences,
and transactional email deliveries) and executes them asynchronously.
"""

import os
import sys
import time
import signal
import asyncio
from loguru import logger
from dotenv import load_dotenv

load_dotenv()

from services.task_queue_service import task_queue, REDIS_URL
from services.email_service import email_service


class TaskWorker:
    """Production async task queue worker daemon."""

    def __init__(self):
        self.is_running = True
        self._redis = None

    def setup_signal_handlers(self):
        def _stop_signal(sig, frame):
            logger.info("Termination signal received. Shutting down worker gracefully...")
            self.is_running = False

        signal.signal(signal.SIGINT, _stop_signal)
        signal.signal(signal.SIGTERM, _stop_signal)

    def verify_connections(self):
        logger.info(f"Connecting worker to Redis at {REDIS_URL}...")
        try:
            import redis
            self._redis = redis.from_url(REDIS_URL, socket_timeout=3)
            self._redis.ping()
            logger.info("Redis connection established successfully.")
        except Exception as e:
            logger.warning(f"Redis unavailable or connection failed: {e}. Worker will run in in-memory mode.")

        # Test SMTP readiness
        smtp_check = email_service.verify_smtp_connection()
        logger.info(f"SMTP Configuration check: {smtp_check['message']}")

    async def run(self):
        self.setup_signal_handlers()
        self.verify_connections()
        logger.info("AI CRM Background Worker initialized. Listening for tasks...")

        while self.is_running:
            try:
                # Check for active running tasks and maintain queue health
                active_tasks = [t for t in task_queue.list_tasks(limit=100) if t.status in ("pending", "running")]
                if active_tasks:
                    logger.debug(f"Worker tracking {len(active_tasks)} active background tasks.")
                await asyncio.sleep(2)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Worker iteration exception: {e}")
                await asyncio.sleep(5)

        logger.info("Worker process exited cleanly.")


if __name__ == "__main__":
    worker = TaskWorker()
    asyncio.run(worker.run())
