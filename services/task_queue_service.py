"""Persistent Async Background Task Queue and Job Execution Subsystem."""

import os
import asyncio
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Callable, Awaitable, List
from pydantic import BaseModel, ConfigDict, Field
from loguru import logger

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")


class TaskJob(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    task_id: str
    task_type: str
    status: str  # "pending", "running", "completed", "failed", "cancelled"
    progress: int = 0  # 0 to 100
    created_at: str
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    attempts: int = 0
    max_attempts: int = 3
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class AsyncTaskQueue:
    """Resilient in-memory and Redis-backed asynchronous background task queue."""

    def __init__(self):
        self.tasks: Dict[str, TaskJob] = {}
        self._async_tasks: Dict[str, asyncio.Task] = {}
        self._redis_client = None

    def _get_redis(self):
        if not self._redis_client:
            try:
                import redis

                self._redis_client = redis.from_url(REDIS_URL, socket_timeout=1)
            except Exception:
                self._redis_client = None
        return self._redis_client

    def _sync_to_redis(self, job: TaskJob) -> None:
        """Cache task state to Redis if available."""
        try:
            r = self._get_redis()
            if r:
                r.setex(
                    f"crm:task:{job.task_id}",
                    86400,  # 24 hours TTL
                    job.model_dump_json(),
                )
        except Exception:
            # Fall back transparently to in-process memory store
            pass

    def create_task(
        self,
        task_type: str,
        max_attempts: int = 3,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> TaskJob:
        """Register a new task in pending state."""
        task_id = str(uuid.uuid4())
        job = TaskJob(
            task_id=task_id,
            task_type=task_type,
            status="pending",
            progress=0,
            created_at=datetime.now(timezone.utc).isoformat(),
            attempts=0,
            max_attempts=max_attempts,
            metadata=metadata or {},
        )
        self.tasks[task_id] = job
        self._sync_to_redis(job)
        return job

    def get_task(self, task_id: str) -> Optional[TaskJob]:
        """Retrieve task details by ID with Redis fallback."""
        if task_id in self.tasks:
            return self.tasks[task_id]

        try:
            r = self._get_redis()
            if r:
                raw = r.get(f"crm:task:{task_id}")
                if raw:
                    job_dict = json.loads(
                        raw.decode("utf-8") if isinstance(raw, bytes) else raw
                    )
                    job = TaskJob(**job_dict)
                    self.tasks[task_id] = job
                    return job
        except Exception:
            pass

        return None

    def list_tasks(self, limit: int = 50) -> List[TaskJob]:
        """List recently submitted background tasks."""
        return list(
            sorted(self.tasks.values(), key=lambda t: t.created_at, reverse=True)
        )[:limit]

    def cancel_task(self, task_id: str) -> Optional[TaskJob]:
        """Cancel a running or pending task."""
        job = self.get_task(task_id)
        if not job:
            return None

        if job.status in ("pending", "running"):
            if task_id in self._async_tasks:
                self._async_tasks[task_id].cancel()
            job.status = "cancelled"
            job.completed_at = datetime.now(timezone.utc).isoformat()
            job.error = "Cancelled by user"
            self._sync_to_redis(job)

        return job

    def clear_completed(self) -> int:
        """Remove completed, failed, or cancelled tasks from memory."""
        to_delete = [
            tid
            for tid, task in self.tasks.items()
            if task.status in ("completed", "failed", "cancelled")
        ]
        for tid in to_delete:
            del self.tasks[tid]
            self._async_tasks.pop(tid, None)
        return len(to_delete)

    async def enqueue(
        self,
        task_type: str,
        coro_func: Callable[[TaskJob], Awaitable[Dict[str, Any]]],
        max_attempts: int = 3,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> TaskJob:
        """Enqueue and start background execution of an async job with retry support."""
        job = self.create_task(task_type, max_attempts=max_attempts, metadata=metadata)

        async def _runner():
            job.status = "running"
            job.started_at = datetime.now(timezone.utc).isoformat()
            job.progress = 10
            self._sync_to_redis(job)

            for attempt in range(1, job.max_attempts + 1):
                job.attempts = attempt
                try:
                    logger.info(
                        f"Executing task {job.task_id} ({job.task_type}) - attempt {attempt}/{job.max_attempts}"
                    )
                    result = await coro_func(job)
                    job.status = "completed"
                    job.progress = 100
                    job.result = result
                    job.completed_at = datetime.now(timezone.utc).isoformat()
                    self._sync_to_redis(job)
                    logger.info(f"Task {job.task_id} completed successfully.")
                    return
                except asyncio.CancelledError:
                    job.status = "cancelled"
                    job.error = "Execution cancelled"
                    job.completed_at = datetime.now(timezone.utc).isoformat()
                    self._sync_to_redis(job)
                    return
                except Exception as e:
                    job.error = str(e)
                    logger.warning(f"Task {job.task_id} attempt {attempt} failed: {e}")
                    if attempt < job.max_attempts:
                        # Exponential backoff: 1s, 2s, 4s...
                        backoff = 2 ** (attempt - 1)
                        logger.info(f"Retrying task {job.task_id} in {backoff}s...")
                        await asyncio.sleep(backoff)
                    else:
                        job.status = "failed"
                        job.completed_at = datetime.now(timezone.utc).isoformat()
                        logger.error(
                            f"Task {job.task_id} failed after {job.max_attempts} attempts: {e}"
                        )
                finally:
                    self._sync_to_redis(job)

            self._async_tasks.pop(job.task_id, None)

        t = asyncio.create_task(_runner())
        self._async_tasks[job.task_id] = t
        return job

    async def enqueue_password_reset_email(
        self,
        to_email: str,
        recipient_name: str,
        reset_token: str,
        expires_in_minutes: int = 60,
    ) -> TaskJob:
        """Enqueue password reset email delivery task into background queue."""
        from services.email_service import email_service

        domain = to_email.split("@")[-1] if "@" in to_email else "unknown"

        async def _send_task(job: TaskJob) -> Dict[str, Any]:
            job.progress = 30
            res = await email_service.send_password_reset_email(
                to_email=to_email,
                recipient_name=recipient_name,
                reset_token=reset_token,
                expires_in_minutes=expires_in_minutes,
            )
            job.progress = 90
            return {
                "delivered": res.get("delivered", True),
                "status": res.get("status", "delivered"),
                "recipient_domain": domain,
                "email_type": "password_reset",
            }

        return await self.enqueue(
            task_type="send_password_reset_email",
            coro_func=_send_task,
            max_attempts=3,
            metadata={"email_type": "password_reset", "recipient_domain": domain},
        )

    async def enqueue_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        recipient_name: Optional[str] = None,
        html_body: Optional[str] = None,
        text_body: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> TaskJob:
        """Enqueue general CRM / outbound email delivery task into background queue."""
        from services.email_service import email_service

        domain = to_email.split("@")[-1] if "@" in to_email else "unknown"
        meta = metadata or {}
        meta.update({"recipient_domain": domain, "subject": subject})

        async def _send_task(job: TaskJob) -> Dict[str, Any]:
            job.progress = 30
            res = await email_service.send_crm_email(
                to_email=to_email,
                subject=subject,
                body=body,
                recipient_name=recipient_name,
                html_body=html_body,
                text_body=text_body,
                correlation_id=job.task_id,
            )
            job.progress = 90
            return {
                "delivered": res.get("delivered", True),
                "status": res.get("status", "delivered"),
                "recipient_domain": domain,
                "subject": subject,
                "email_type": meta.get("email_type", "crm_outbound"),
            }

        return await self.enqueue(
            task_type="send_crm_email",
            coro_func=_send_task,
            max_attempts=3,
            metadata=meta,
        )


task_queue = AsyncTaskQueue()
