---
name: backend-development
description: Guide for developing FastAPI routers, endpoints, dependencies, and Pydantic schemas.
---

# Backend Development Skill

Use this skill when you are modifying or creating FastAPI API routers, endpoints, request/response models, or FastAPI dependencies.

## 🚀 Guidelines

1. **Endpoint Routing**:
   - Create route modules under `api/` (e.g. `api/leads.py`, `api/voice_calls.py`, `api/whatsapp.py`, `api/forecasting.py`, `api/custom_agents.py`, `api/i18n.py`).
   - Use `router = APIRouter()` to define endpoints.
   - Include the new router in `main.py` using `app.include_router(new_router, prefix="/api/...", tags=["..."])`.

2. **Validation & Schemas (Pydantic V2)**:
   - Define all request payloads and response bodies as Pydantic V2 models.
   - Match the project's validation style (`model_config = ConfigDict(from_attributes=True)` or `class Config: from_attributes = True`).
   - Use `Annotated[List[T], Field(min_length=N)]` for list length constraints instead of deprecated `min_items`.
   - Ensure all response models are typed explicitly with `response_model=...`.

3. **Database Integration & Session Lifecycles**:
   - Always inject database sessions into endpoints using FastAPI dependency injection:
     ```python
     db: Session = Depends(get_db)
     ```
   - **CRITICAL**: Do NOT pass request-scoped `db: Session` to `BackgroundTasks.add_task(...)` if the task requires writing to PostgreSQL after response delivery, because FastAPI closes the request session as soon as the response returns. Instead, await the orchestrator workflow synchronously in the endpoint or instantiate `SessionLocal()` inside background task runners.
   - Support both string and UUID primary keys when querying models (e.g. attempting `uuid.UUID(id_str)` before falling back to string match).
   - Coerce SQLAlchemy column attributes to Python primitives (`str()`, `int()`, `float()`) when using them as dictionary keys, in `round()`, or in `dict.get()`.
   - Run `db.commit()` for writes and `db.refresh(db_obj)` when returning updated models.

4. **Error Handling**:
   - Avoid catching and silencing database or logic errors directly.
   - Raise `HTTPException` for user errors or state conflicts (e.g., `raise HTTPException(status_code=404, detail="Item not found")`).

## 📋 Example Endpoint Pattern

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import get_db
from database.models import Contact
from pydantic import BaseModel

router = APIRouter()

class LeadResponse(BaseModel):
    id: str
    email: str
    lead_score: int

    class Config:
        from_attributes = True

@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(lead_id: str, db: Session = Depends(get_db)):
    lead = db.query(Contact).filter(Contact.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead
```
