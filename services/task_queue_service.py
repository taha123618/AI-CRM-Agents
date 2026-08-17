"""Persistent Async Background Task Queue and Job Execution Subsystem."""

import os
import asyncio
import json
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, Callable, Awaitable, List
from pydantic import BaseModel, ConfigDict
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
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class AsyncTaskQueue:
    """Resilient in-memory and Redis-backed asynchronous background task queue."""

    def __init__(self):
        self.tasks: Dict[str, TaskJob] = {}
        self._async_tasks: Dict[str, asyncio.Task] = {}
        self._redis_client = None

    def _sync_to_redis(self, job: TaskJob) -> None:
        """Cache task state to Redis if available."""
        try:
            if not self._redis_client:
                import redis
                self._redis_client = redis.from_url(REDIS_URL, socket_timeout=1)
            self._redis_client.setex(
                f"crm:task:{job.task_id}",
                86400,  # 24 hours TTL
                job.model_dump_json(),
            )
        except Exception:
            # Fall back transparently to in-process memory store
            pass

    def create_task(self, task_type: str) -> TaskJob:
        """Register a new task in pending state."""
        task_id = str(uuid.uuid4())
        job = TaskJob(
            task_id=task_id,
            task_type=task_type,
            status="pending",
            progress=0,
            # pyrefly: ignore [deprecated]
            created_at=datetime.utcnow().isoformat(),
        )
        self.tasks[task_id] = job
        self._sync_to_redis(job)
        return job

    def get_task(self, task_id: str) -> Optional[TaskJob]:
        """Retrieve task details by ID with Redis fallback."""
        if task_id in self.tasks:
            return self.tasks[task_id]

        try:
            if not self._redis_client:
                import redis
                self._redis_client = redis.from_url(REDIS_URL, socket_timeout=1)
            raw = self._redis_client.get(f"crm:task:{task_id}")
            if raw:
                job_dict = json.loads(raw.decode("utf-8") if isinstance(raw, bytes) else raw)
                job = TaskJob(**job_dict)
                self.tasks[task_id] = job
                return job
        except Exception:
            pass

        return None

    def list_tasks(self, limit: int = 50) -> List[TaskJob]:
        """List recently submitted background tasks."""
        return list(sorted(self.tasks.values(), key=lambda t: t.created_at, reverse=True))[:limit]

    def cancel_task(self, task_id: str) -> Optional[TaskJob]:
        """Cancel a running or pending task."""
        job = self.get_task(task_id)
        if not job:
            return None

        if job.status in ("pending", "running"):
            if task_id in self._async_tasks:
                self._async_tasks[task_id].cancel()
            job.status = "cancelled"
            job.completed_at = datetime.utcnow().isoformat()
            job.error = "Cancelled by user"
            self._sync_to_redis(job)

        return job

    def clear_completed(self) -> int:
        """Remove completed, failed, or cancelled tasks from memory."""
        to_delete = [
            tid for tid, task in self.tasks.items()
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
    ) -> TaskJob:
        """Enqueue and start background execution of an async job."""
        job = self.create_task(task_type)

        async def _runner():
            job.status = "running"
            job.started_at = datetime.utcnow().isoformat()
            job.progress = 10
            self._sync_to_redis(job)
            try:
                result = await coro_func(job)
                job.status = "completed"
                job.progress = 100
                job.result = result
                job.completed_at = datetime.utcnow().isoformat()
            except asyncio.CancelledError:
                job.status = "cancelled"
                job.error = "Execution cancelled"
                job.completed_at = datetime.utcnow().isoformat()
            except Exception as e:
                logger.error(f"Task {job.task_id} failed: {e}")
                job.status = "failed"
                job.error = str(e)
                job.completed_at = datetime.utcnow().isoformat()
            finally:
                self._async_tasks.pop(job.task_id, None)
                self._sync_to_redis(job)

        t = asyncio.create_task(_runner())
        self._async_tasks[job.task_id] = t
        return job


task_queue = AsyncTaskQueue()
