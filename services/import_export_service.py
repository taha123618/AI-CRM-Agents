"""Bulk CSV Import and Export Business Service with Formula Injection Protection."""

import csv
import io
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from database.models import Contact, Deal, AuditLog
from services.audit_service import record_audit_log

# Defensive CSV limits to prevent resource exhaustion / CSV bombs
MAX_CSV_PAYLOAD_BYTES = 5 * 1024 * 1024  # 5 MB
MAX_CSV_ROWS = 5000
DANGEROUS_FORMULA_PREFIXES = ("=", "+", "-", "@", "\t", "\r")


def sanitize_csv_cell(val: Any) -> Any:
    """Sanitize CSV cell content to prevent CSV/Formula Injection attacks.

    If a string begins with dangerous spreadsheet execution prefixes (=, +, -, @, \\t, \\r),
    it is prepended with a single quote (') to force spreadsheet processors (Excel, LibreOffice,
    Google Sheets) to treat it as safe text rather than an executable formula or DDE command.
    """
    if val is None:
        return ""
    val_str = str(val)
    if val_str and val_str.startswith(DANGEROUS_FORMULA_PREFIXES):
        return f"'{val_str}"
    return val_str


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
    """Bulk import leads/contacts from CSV with dynamic column mapping and payload validation."""
    if len(csv_text.encode("utf-8")) > MAX_CSV_PAYLOAD_BYTES:
        return {
            "success": False,
            "created_count": 0,
            "updated_count": 0,
            "total_processed": 0,
            "errors": [
                f"CSV payload exceeds maximum allowed size of {MAX_CSV_PAYLOAD_BYTES // (1024*1024)}MB."
            ],
        }

    reader = csv.DictReader(io.StringIO(csv_text.strip()))
    mapping = column_mapping or {}

    created_count = 0
    updated_count = 0
    errors = []

    for row_idx, row in enumerate(reader, start=1):
        if row_idx > MAX_CSV_ROWS:
            errors.append(
                f"Reached maximum row processing limit of {MAX_CSV_ROWS}. Remaining rows were skipped."
            )
            break
        email_key = mapping.get("email", "email")
        email = _get_col_val(
            row, email_key, "email", "Email", "email_address", "Work Email"
        )
        if not email or "@" not in email:
            errors.append(f"Row {row_idx}: Missing or invalid email address.")
            continue

        fn_key = mapping.get("first_name", "first_name")
        first_name = _get_col_val(
            row, fn_key, "first_name", "First Name", "given_name", "FirstName"
        )

        ln_key = mapping.get("last_name", "last_name")
        last_name = _get_col_val(
            row, ln_key, "last_name", "Last Name", "family_name", "LastName"
        )

        jt_key = mapping.get("job_title", "job_title")
        job_title = _get_col_val(row, jt_key, "job_title", "Job Title", "title", "Role")

        ls_key = mapping.get("lead_source", "lead_source")
        lead_source = (
            _get_col_val(row, ls_key, "lead_source", "Lead Source", "source")
            or "csv_import"
        )

        sc_key = mapping.get("lead_score", "lead_score")
        score_val = (
            _get_col_val(row, sc_key, "lead_score", "Lead Score", "score") or "50"
        )

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
        details={
            "created": created_count,
            "updated": updated_count,
            "errors_count": len(errors),
        },
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
    """Bulk import deals from CSV with payload limit and formula sanitization."""
    if len(csv_text.encode("utf-8")) > MAX_CSV_PAYLOAD_BYTES:
        return {
            "success": False,
            "created_count": 0,
            "errors": [
                f"CSV payload exceeds maximum allowed size of {MAX_CSV_PAYLOAD_BYTES // (1024*1024)}MB."
            ],
        }

    reader = csv.DictReader(io.StringIO(csv_text.strip()))
    mapping = column_mapping or {}

    created_count = 0
    errors = []

    for row_idx, row in enumerate(reader, start=1):
        if row_idx > MAX_CSV_ROWS:
            errors.append(
                f"Reached maximum row processing limit of {MAX_CSV_ROWS}. Remaining rows were skipped."
            )
            break

        name = (
            row.get(mapping.get("name", "name"))
            or row.get("Deal Name")
            or row.get("deal_name")
        )
        if not name:
            errors.append(f"Row {row_idx}: Missing deal name.")
            continue

        val_str = (
            row.get(mapping.get("value", "value"))
            or row.get("Amount")
            or row.get("value")
            or "0"
        )
        try:
            val = float(str(val_str).replace("$", "").replace(",", "").strip())
        except Exception:
            val = 0.0

        stage = (
            row.get(mapping.get("stage", "stage"))
            or row.get("Stage")
            or "qualification"
        )
        health_str = (
            row.get(mapping.get("health_score", "health_score"))
            or row.get("Health Score")
            or "60"
        )
        try:
            health = int(health_str)
        except Exception:
            health = 60

        new_deal = Deal(
            name=str(name),
            value=val,
            stage=str(stage).lower(),
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
    """Generate CSV string of all contacts/leads with formula injection protection."""
    contacts = db.query(Contact).order_by(Contact.created_at.desc()).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "ID",
            "Email",
            "First Name",
            "Last Name",
            "Job Title",
            "Lead Score",
            "Lead Status",
            "Lead Source",
            "Created At",
        ]
    )
    for c in contacts:
        writer.writerow(
            [
                sanitize_csv_cell(str(c.id)),
                sanitize_csv_cell(c.email),
                sanitize_csv_cell(c.first_name or ""),
                sanitize_csv_cell(c.last_name or ""),
                sanitize_csv_cell(c.job_title or ""),
                sanitize_csv_cell(c.lead_score or 0),
                sanitize_csv_cell(c.lead_status or "new"),
                sanitize_csv_cell(c.lead_source or ""),
                sanitize_csv_cell(c.created_at.isoformat() if c.created_at else ""),
            ]
        )
    return output.getvalue()


def export_deals_csv(db: Session) -> str:
    """Generate CSV string of all pipeline deals with formula injection protection."""
    deals = db.query(Deal).order_by(Deal.created_at.desc()).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "ID",
            "Deal Name",
            "Value",
            "Stage",
            "Health Score",
            "Close Probability",
            "Is Stalled",
            "Created At",
        ]
    )
    for d in deals:
        writer.writerow(
            [
                sanitize_csv_cell(str(d.id)),
                sanitize_csv_cell(d.name),
                sanitize_csv_cell(d.value or 0.0),
                sanitize_csv_cell(d.stage),
                sanitize_csv_cell(d.health_score or 50),
                sanitize_csv_cell(d.probability or 0),
                sanitize_csv_cell("Yes" if d.is_stalled else "No"),
                sanitize_csv_cell(d.created_at.isoformat() if d.created_at else ""),
            ]
        )
    return output.getvalue()


def export_audit_logs_csv(db: Session) -> str:
    """Generate CSV string of all compliance audit logs with formula injection protection."""
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(1000).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        ["ID", "Entity Type", "Entity ID", "Action", "Actor", "IP Address", "Timestamp"]
    )
    for l in logs:
        writer.writerow(
            [
                sanitize_csv_cell(str(l.id)),
                sanitize_csv_cell(l.entity_type),
                sanitize_csv_cell(l.entity_id),
                sanitize_csv_cell(l.action),
                sanitize_csv_cell(l.actor),
                sanitize_csv_cell(l.ip_address or ""),
                sanitize_csv_cell(l.created_at.isoformat() if l.created_at else ""),
            ]
        )
    return output.getvalue()
