"""Bulk CSV Import and Export Business Service."""

import csv
import io
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from database.models import Contact, Deal, AuditLog
from services.audit_service import record_audit_log


def _get_col_val(row: Dict[str, Any], *candidates: str) -> Optional[str]:
    """Retrieve column value with case-insensitive and normalized fallback."""
    for k in candidates:
        if k in row and row[k] is not None and str(row[k]).strip():
            return str(row[k]).strip()
    lower_row = {k.lower().strip(): v for k, v in row.items() if k}
    for k in candidates:
        kl = k.lower().strip()
        if kl in lower_row and lower_row[kl] is not None and str(lower_row[kl]).strip():
            return str(lower_row[kl]).strip()
    return None


def import_leads_csv(
    csv_text: str,
    db: Session,
    column_mapping: Optional[Dict[str, str]] = None,
) -> Dict[str, Any]:
    """Bulk import leads/contacts from CSV with dynamic column mapping."""
    reader = csv.DictReader(io.StringIO(csv_text.strip()))
    mapping = column_mapping or {}

    created_count = 0
    updated_count = 0
    errors = []

    for row_idx, row in enumerate(reader, start=1):
        email_key = mapping.get("email", "email")
        email = _get_col_val(row, email_key, "email", "Email", "email_address", "Work Email")
        if not email or "@" not in email:
            errors.append(f"Row {row_idx}: Missing or invalid email address.")
            continue

        fn_key = mapping.get("first_name", "first_name")
        first_name = _get_col_val(row, fn_key, "first_name", "First Name", "given_name", "FirstName")

        ln_key = mapping.get("last_name", "last_name")
        last_name = _get_col_val(row, ln_key, "last_name", "Last Name", "family_name", "LastName")

        jt_key = mapping.get("job_title", "job_title")
        job_title = _get_col_val(row, jt_key, "job_title", "Job Title", "title", "Role")

        ls_key = mapping.get("lead_source", "lead_source")
        lead_source = _get_col_val(row, ls_key, "lead_source", "Lead Source", "source") or "csv_import"

        sc_key = mapping.get("lead_score", "lead_score")
        score_val = _get_col_val(row, sc_key, "lead_score", "Lead Score", "score") or "50"

        try:
            lead_score = int(score_val)
        except Exception:
            lead_score = 50

        existing = db.query(Contact).filter(Contact.email == email).first()
        if existing:
            if first_name:
                existing.first_name = first_name
            if last_name:
                existing.last_name = last_name
            if job_title:
                existing.job_title = job_title
            existing.lead_score = lead_score
            updated_count += 1
        else:
            new_contact = Contact(
                email=email,
                first_name=first_name,
                last_name=last_name,
                job_title=job_title,
                lead_source=lead_source,
                lead_score=lead_score,
                lead_status="new",
            )
            db.add(new_contact)
            created_count += 1

    db.commit()
    record_audit_log(
        db=db,
        entity_type="lead",
        entity_id="bulk_import",
        action="csv_import",
        actor="system",
        details={"created": created_count, "updated": updated_count, "errors_count": len(errors)},
    )

    return {
        "success": True,
        "created_count": created_count,
        "updated_count": updated_count,
        "total_processed": created_count + updated_count,
        "errors": errors,
    }


def import_deals_csv(
    csv_text: str,
    db: Session,
    column_mapping: Optional[Dict[str, str]] = None,
) -> Dict[str, Any]:
    """Bulk import deals from CSV."""
    reader = csv.DictReader(io.StringIO(csv_text.strip()))
    mapping = column_mapping or {}

    created_count = 0
    errors = []

    for row_idx, row in enumerate(reader, start=1):
        name = row.get(mapping.get("name", "name")) or row.get("Deal Name") or row.get("deal_name")
        if not name:
            errors.append(f"Row {row_idx}: Missing deal name.")
            continue

        val_str = row.get(mapping.get("value", "value")) or row.get("Amount") or row.get("value") or "0"
        try:
            val = float(val_str.replace("$", "").replace(",", "").strip())
        except Exception:
            val = 0.0

        stage = row.get(mapping.get("stage", "stage")) or row.get("Stage") or "qualification"
        health_str = row.get(mapping.get("health_score", "health_score")) or row.get("Health Score") or "60"
        try:
            health = int(health_str)
        except Exception:
            health = 60

        new_deal = Deal(
            name=name,
            value=val,
            stage=stage.lower(),
            health_score=health,
        )
        db.add(new_deal)
        created_count += 1

    db.commit()
    return {
        "success": True,
        "created_count": created_count,
        "errors": errors,
    }


def export_leads_csv(db: Session) -> str:
    """Generate CSV string of all contacts/leads."""
    contacts = db.query(Contact).order_by(Contact.created_at.desc()).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Email", "First Name", "Last Name", "Job Title", "Lead Score", "Lead Status", "Lead Source", "Created At"])
    for c in contacts:
        writer.writerow([
            str(c.id),
            c.email,
            c.first_name or "",
            c.last_name or "",
            c.job_title or "",
            c.lead_score or 0,
            c.lead_status or "new",
            c.lead_source or "",
            c.created_at.isoformat() if c.created_at else "",
        ])
    return output.getvalue()


def export_deals_csv(db: Session) -> str:
    """Generate CSV string of all pipeline deals."""
    deals = db.query(Deal).order_by(Deal.created_at.desc()).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Deal Name", "Value", "Stage", "Health Score", "Close Probability", "Is Stalled", "Created At"])
    for d in deals:
        writer.writerow([
            str(d.id),
            d.name,
            d.value or 0.0,
            d.stage,
            d.health_score or 50,
            d.probability or 0,
            "Yes" if d.is_stalled else "No",
            d.created_at.isoformat() if d.created_at else "",
        ])
    return output.getvalue()


def export_audit_logs_csv(db: Session) -> str:
    """Generate CSV string of all compliance audit logs."""
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(1000).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Entity Type", "Entity ID", "Action", "Actor", "IP Address", "Timestamp"])
    for l in logs:
        writer.writerow([
            str(l.id),
            l.entity_type,
            l.entity_id,
            l.action,
            l.actor,
            l.ip_address or "",
            l.created_at.isoformat() if l.created_at else "",
        ])
    return output.getvalue()
