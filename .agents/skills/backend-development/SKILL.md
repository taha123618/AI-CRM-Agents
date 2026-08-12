---
name: backend-development
description: Guide for developing FastAPI routers, endpoints, dependencies, and Pydantic schemas.
---

# Backend Development Skill

Use this skill when you are modifying or creating FastAPI API routers, endpoints, request/response models, or FastAPI dependencies.

## 🚀 Guidelines

1. **Endpoint Routing**:
   - Create route modules under `api/` (e.g. `api/leads.py`).
   - Use `router = APIRouter()` to define endpoints.
   - Include the new router in `main.py` using `app.include_router(new_router, prefix="/api/...", tags=["..."])`.

2. **Validation & Schemas**:
   - Define all request payloads and response bodies as Pydantic models.
   - Match the project's validation style (using `from_attributes = True` inside the nested `class Config` block for ORM serialization).
   - Ensure all response models are typed explicitly.

3. **Database Integration**:
   - Always inject database sessions into endpoints using FastAPI dependency injection:
     ```python
     db: Session = Depends(get_db)
     ```
   - Perform read/write operations within `try`/`finally` blocks or using standard SQLAlchemy session transactions.
   - Run `db.commit()` for writes and `db.refresh(db_obj)` if you need access to automatically populated database fields.

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
