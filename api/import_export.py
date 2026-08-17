"""Bulk CSV Import & Export Studio Endpoints."""

from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database.connection import get_db
from services.import_export_service import (
    import_leads_csv,
    import_deals_csv,
    export_leads_csv,
    export_deals_csv,
    export_audit_logs_csv,
)

router = APIRouter()


class CsvImportRequest(BaseModel):
    csv_data: str = Field(..., description="Raw CSV string content with header row")
    column_mapping: Optional[Dict[str, str]] = Field(
        default=None,
        description="Optional column mapping, e.g. {'email': 'Work Email', 'first_name': 'Given Name'}",
    )


@router.post("/import/leads", response_model=Dict[str, Any])
async def bulk_import_leads(
    payload: CsvImportRequest,
    db: Session = Depends(get_db),
):
    """Bulk import leads/contacts into PostgreSQL from CSV data with column mapping."""
    if not payload.csv_data.strip():
        raise HTTPException(status_code=400, detail="CSV data cannot be empty")

    result = import_leads_csv(
        csv_text=payload.csv_data,
        db=db,
        column_mapping=payload.column_mapping,
    )
    return result


@router.post("/import/deals", response_model=Dict[str, Any])
async def bulk_import_deals(
    payload: CsvImportRequest,
    db: Session = Depends(get_db),
):
    """Bulk import deals into pipeline from CSV data."""
    if not payload.csv_data.strip():
        raise HTTPException(status_code=400, detail="CSV data cannot be empty")

    result = import_deals_csv(
        csv_text=payload.csv_data,
        db=db,
        column_mapping=payload.column_mapping,
    )
    return result


@router.get("/export/leads")
async def bulk_export_leads(db: Session = Depends(get_db)):
    """Export all leads as a downloadable CSV file."""
    csv_content = export_leads_csv(db)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=crm_leads_export.csv"},
    )


@router.get("/export/deals")
async def bulk_export_deals(db: Session = Depends(get_db)):
    """Export all deals as a downloadable CSV file."""
    csv_content = export_deals_csv(db)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=crm_deals_export.csv"},
    )


@router.get("/export/audit-logs")
async def bulk_export_audit_logs(db: Session = Depends(get_db)):
    """Export compliance audit trail as a downloadable CSV file."""
    csv_content = export_audit_logs_csv(db)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=compliance_audit_logs.csv"},
    )
