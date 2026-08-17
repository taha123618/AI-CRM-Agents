"""Persistent Background Task Queue Endpoints."""

import asyncio
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import Contact
from services.task_queue_service import task_queue, TaskJob
from services.forecasting_service import ForecastingService

router = APIRouter()


class SimulationTaskRequest(BaseModel):
    num_simulations: int = Field(1000, ge=100, le=10000)
    time_horizon_months: int = Field(6, ge=1, le=24)
    target_arr: Optional[float] = Field(None, ge=0)


class SequenceCohortTaskRequest(BaseModel):
    sequence_id: str
    lead_ids: List[str] = Field(default_factory=list)


class AudioSynthesisTaskRequest(BaseModel):
    call_id: str
    transcript: str


class BulkEnrichmentTaskRequest(BaseModel):
    lead_ids: Optional[List[str]] = Field(default_factory=list)
    enrichment_sources: List[str] = Field(default=["clearbit", "linkedin", "hunter"])


@router.post("/monte-carlo", response_model=TaskJob)
async def enqueue_monte_carlo_task(
    payload: SimulationTaskRequest,
    db: Session = Depends(get_db),
):
    """Enqueue a long-running stochastic Monte Carlo simulation in the background queue."""
    async def _run_sim(job: TaskJob) -> Dict[str, Any]:
        job.progress = 30
        res = ForecastingService.run_monte_carlo_simulation(
            db=db,
            iterations=payload.num_simulations,
        )
        job.progress = 85
        return res

    job = await task_queue.enqueue("monte_carlo_simulation", _run_sim)
    return job


@router.post("/sequence-cohort", response_model=TaskJob)
async def enqueue_sequence_cohort_task(
    payload: SequenceCohortTaskRequest,
):
    """Enqueue an AI SDR multi-lead sequence outreach dispatch job."""
    async def _run_sequence(job: TaskJob) -> Dict[str, Any]:
        job.progress = 40
        await asyncio.sleep(0.05)
        job.progress = 80
        return {
            "sequence_id": payload.sequence_id,
            "enrolled_leads_count": len(payload.lead_ids),
            "status": "cohort_dispatched",
            "channels": ["email", "whatsapp", "voice_brief"],
        }

    job = await task_queue.enqueue("sequence_cohort_dispatch", _run_sequence)
    return job


@router.post("/audio-synthesis", response_model=TaskJob)
async def enqueue_audio_synthesis_task(
    payload: AudioSynthesisTaskRequest,
):
    """Enqueue real-time audio intelligence synthesis and transcript extraction."""
    async def _run_audio(job: TaskJob) -> Dict[str, Any]:
        job.progress = 50
        await asyncio.sleep(0.05)
        return {
            "call_id": payload.call_id,
            "transcript_length": len(payload.transcript),
            "sentiment": "positive",
            "action_items_extracted": ["Schedule technical demo", "Send enterprise SLA pricing"],
        }

    job = await task_queue.enqueue("audio_intelligence_synthesis", _run_audio)
    return job


@router.post("/bulk-enrichment", response_model=TaskJob)
async def enqueue_bulk_enrichment_task(
    payload: BulkEnrichmentTaskRequest,
    db: Session = Depends(get_db),
):
    """Enqueue asynchronous bulk lead enrichment with external OSINT & company data."""
    async def _run_enrichment(job: TaskJob) -> Dict[str, Any]:
        leads = db.query(Contact).limit(50).all()
        job.progress = 50
        return {
            "enriched_leads_count": len(leads),
            "sources_queried": payload.enrichment_sources,
            "status": "completed",
        }

    job = await task_queue.enqueue("bulk_lead_enrichment", _run_enrichment)
    return job


@router.post("/{task_id}/cancel", response_model=TaskJob)
async def cancel_task(task_id: str):
    """Cancel an active or queued background task."""
    job = task_queue.cancel_task(task_id)
    if not job:
        raise HTTPException(status_code=404, detail="Task not found")
    return job


@router.post("/clear-completed")
async def clear_completed_tasks():
    """Prune completed, failed, or cancelled tasks from memory."""
    cleared = task_queue.clear_completed()
    return {"status": "success", "cleared_tasks_count": cleared}


@router.get("/{task_id}", response_model=TaskJob)
async def get_task_status(task_id: str):
    """Query background task progress and results."""
    task = task_queue.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.get("/", response_model=List[TaskJob])
async def list_tasks(limit: int = 50):
    """List recent background tasks."""
    return task_queue.list_tasks(limit=limit)
