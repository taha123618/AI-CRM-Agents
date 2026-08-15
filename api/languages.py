"""FastAPI Router for Languages and Translation Management."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from database.connection import get_db
from services.language_service import LanguageService

router = APIRouter()


# ============================================================================
# PYDANTIC SCHEMAS
# ============================================================================


class LanguageCreateSchema(BaseModel):
    code: str = Field(
        ...,
        min_length=2,
        max_length=10,
        description="ISO language code, e.g. 'en', 'es'",
    )
    name: str = Field(
        ..., min_length=1, max_length=100, description="Native language name"
    )
    english_name: Optional[str] = Field(
        None, max_length=100, description="English name"
    )
    direction: str = Field(
        "ltr", pattern="^(ltr|rtl)$", description="Text direction (ltr or rtl)"
    )
    is_default: bool = Field(
        False, description="Whether this is the default application language"
    )
    is_enabled: bool = Field(
        True, description="Whether this language is enabled for selection"
    )
    flag_emoji: str = Field("🌐", max_length=20, description="Emoji flag or icon")


class LanguageUpdateSchema(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    english_name: Optional[str] = Field(None, max_length=100)
    direction: Optional[str] = Field(None, pattern="^(ltr|rtl)$")
    is_default: Optional[bool] = None
    is_enabled: Optional[bool] = None
    flag_emoji: Optional[str] = Field(None, max_length=20)


class SingleTranslationUpdateSchema(BaseModel):
    value: str = Field(..., description="Translated string text")
    is_auto_translated: bool = Field(False, description="Whether translated by AI")


class BulkTranslationsSchema(BaseModel):
    translations: Dict[str, Dict[str, str]] = Field(
        ..., description="Nested dictionary of { namespace: { key: value } }"
    )


# ============================================================================
# ENDPOINTS
# ============================================================================


@router.get("", response_model=List[Dict[str, Any]])
def list_languages(
    enabled_only: bool = Query(False, description="Filter only enabled languages"),
    db: Session = Depends(get_db),
):
    """List all configured languages in the CRM."""
    languages = LanguageService.list_languages(db, enabled_only=enabled_only)
    return [
        {
            "code": lang.code,
            "name": lang.name,
            "english_name": lang.english_name,
            "direction": lang.direction,
            "is_default": lang.is_default,
            "is_enabled": lang.is_enabled,
            "flag_emoji": lang.flag_emoji,
            "created_at": lang.created_at.isoformat() if lang.created_at else None,
            "updated_at": lang.updated_at.isoformat() if lang.updated_at else None,
        }
        for lang in languages
    ]


@router.post("", response_model=Dict[str, Any], status_code=201)
def create_language(
    payload: LanguageCreateSchema,
    db: Session = Depends(get_db),
):
    """Create a new language."""
    try:
        lang = LanguageService.create_language(db, payload.model_dump())
        return {
            "status": "success",
            "message": f"Language '{lang.name}' ({lang.code}) created successfully",
            "language": {
                "code": lang.code,
                "name": lang.name,
                "english_name": lang.english_name,
                "direction": lang.direction,
                "is_default": lang.is_default,
                "is_enabled": lang.is_enabled,
                "flag_emoji": lang.flag_emoji,
            },
        }
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))


@router.get("/namespaces", response_model=List[str])
def list_namespaces(db: Session = Depends(get_db)):
    """List all available translation namespaces in the CRM."""
    return LanguageService.list_namespaces(db)


@router.get("/audits", response_model=List[Dict[str, Any]])
def list_audits(
    code: Optional[str] = Query(None, description="Filter audit log by language code"),
    limit: int = Query(50, ge=1, le=200, description="Max records to return"),
    db: Session = Depends(get_db),
):
    """Retrieve audit history log for administrative translation changes."""
    audits = LanguageService.list_audits(db, language_code=code, limit=limit)
    return [
        {
            "id": str(a.id),
            "language_code": a.language_code,
            "namespace": a.namespace,
            "key": a.key,
            "old_value": a.old_value,
            "new_value": a.new_value,
            "changed_by": a.changed_by,
            "action": a.action,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in audits
    ]


@router.get("/preferences/me", response_model=Dict[str, Any])
def get_user_preference(
    user_id: str = Query("default_user", description="User identifier"),
    db: Session = Depends(get_db),
):
    """Retrieve user localization and formatting preferences."""
    pref = LanguageService.get_user_preference(db, user_id=user_id)
    return {
        "user_id": pref.user_id,
        "preferred_language_code": pref.preferred_language_code,
        "theme": pref.theme,
        "date_format": pref.date_format,
        "timezone": pref.timezone,
        "updated_at": pref.updated_at.isoformat() if pref.updated_at else None,
    }


@router.put("/preferences/me", response_model=Dict[str, Any])
def set_user_preference(
    payload: Dict[str, Any],
    user_id: str = Query("default_user", description="User identifier"),
    db: Session = Depends(get_db),
):
    """Update user localization preference."""
    pref = LanguageService.set_user_preference(db, user_id=user_id, data=payload)
    return {
        "status": "success",
        "preferences": {
            "user_id": pref.user_id,
            "preferred_language_code": pref.preferred_language_code,
            "theme": pref.theme,
            "date_format": pref.date_format,
            "timezone": pref.timezone,
        },
    }


@router.get("/{code}", response_model=Dict[str, Any])
def get_language(code: str, db: Session = Depends(get_db)):
    """Get metadata for a single language by code."""
    lang = LanguageService.get_language(db, code.lower())
    if not lang:
        raise HTTPException(status_code=404, detail=f"Language '{code}' not found.")
    return {
        "code": lang.code,
        "name": lang.name,
        "english_name": lang.english_name,
        "direction": lang.direction,
        "is_default": lang.is_default,
        "is_enabled": lang.is_enabled,
        "flag_emoji": lang.flag_emoji,
        "created_at": lang.created_at.isoformat() if lang.created_at else None,
        "updated_at": lang.updated_at.isoformat() if lang.updated_at else None,
    }


@router.put("/{code}", response_model=Dict[str, Any])
def update_language(
    code: str,
    payload: LanguageUpdateSchema,
    db: Session = Depends(get_db),
):
    """Update language configuration (direction, name, is_enabled, is_default)."""
    try:
        lang = LanguageService.update_language(
            db, code.lower(), payload.model_dump(exclude_unset=True)
        )
        if not lang:
            raise HTTPException(status_code=404, detail=f"Language '{code}' not found.")
        return {
            "status": "success",
            "message": f"Language '{lang.code}' updated successfully",
            "language": {
                "code": lang.code,
                "name": lang.name,
                "english_name": lang.english_name,
                "direction": lang.direction,
                "is_default": lang.is_default,
                "is_enabled": lang.is_enabled,
                "flag_emoji": lang.flag_emoji,
            },
        }
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))


@router.delete("/{code}")
def delete_language(code: str, db: Session = Depends(get_db)):
    """Delete a language and its translations."""
    try:
        deleted = LanguageService.delete_language(db, code.lower())
        if not deleted:
            raise HTTPException(status_code=404, detail=f"Language '{code}' not found.")
        return {
            "status": "success",
            "message": f"Language '{code}' deleted successfully",
        }
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))


@router.get("/{code}/translations", response_model=Dict[str, Any])
def get_translations(
    code: str,
    namespace: Optional[str] = Query(None, description="Optional namespace filter"),
    fallback: bool = Query(
        True,
        description="Whether to include fallback default translations for missing keys",
    ),
    db: Session = Depends(get_db),
):
    """
    Fetch all translations for a language organized by namespace.
    Supports fallback inheritance from default language for missing keys.
    """
    lang = LanguageService.get_language(db, code.lower())
    if not lang:
        raise HTTPException(status_code=404, detail=f"Language '{code}' not found.")

    translations = LanguageService.get_translations_bundle(
        db, language_code=code.lower(), namespace=namespace, with_fallback=fallback
    )

    return {
        "language_code": lang.code,
        "direction": lang.direction,
        "is_default": lang.is_default,
        "namespace": namespace or "all",
        "fallback_applied": fallback,
        "translations": translations,
    }


@router.post("/{code}/translations", response_model=Dict[str, Any])
def bulk_upsert_translations(
    code: str,
    payload: BulkTranslationsSchema,
    db: Session = Depends(get_db),
):
    """Bulk update or create translations for a given language."""
    try:
        count = LanguageService.bulk_upsert_translations(
            db, language_code=code.lower(), translations_data=payload.translations
        )
        return {
            "status": "success",
            "message": f"Updated {count} translation keys for language '{code}'",
            "count": count,
        }
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))


@router.put("/{code}/translations/{namespace}/{key}", response_model=Dict[str, Any])
def update_single_translation(
    code: str,
    namespace: str,
    key: str,
    payload: SingleTranslationUpdateSchema,
    db: Session = Depends(get_db),
):
    """Update or create a single translation key in a specific namespace."""
    try:
        translation = LanguageService.upsert_single_translation(
            db,
            language_code=code.lower(),
            namespace=namespace,
            key=key,
            value=payload.value,
            is_auto=payload.is_auto_translated,
        )
        return {
            "status": "success",
            "translation": {
                "id": str(translation.id),
                "language_code": translation.language_code,
                "namespace": translation.namespace,
                "key": translation.key,
                "value": translation.value,
                "is_auto_translated": translation.is_auto_translated,
                "updated_at": translation.updated_at.isoformat()
                if translation.updated_at
                else None,
            },
        }
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))


@router.delete("/{code}/translations/{namespace}/{key}", response_model=Dict[str, Any])
def delete_single_translation(
    code: str,
    namespace: str,
    key: str,
    db: Session = Depends(get_db),
):
    """Delete a specific translation key."""
    deleted = LanguageService.delete_translation(
        db, language_code=code.lower(), namespace=namespace, key=key
    )
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail=f"Translation '{key}' in namespace '{namespace}' not found.",
        )
    return {
        "status": "success",
        "message": f"Deleted translation '{key}' from '{namespace}' in '{code}'",
    }


@router.get("/{code}/export", response_model=Dict[str, Any])
def export_translations(code: str, db: Session = Depends(get_db)):
    """Export complete language dictionary as JSON."""
    try:
        return LanguageService.export_language_json(db, code.lower())
    except ValueError as err:
        raise HTTPException(status_code=404, detail=str(err))


@router.post("/{code}/import", response_model=Dict[str, Any])
def import_translations(
    code: str,
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
):
    """Import language dictionary from JSON payload."""
    try:
        count = LanguageService.import_language_json(db, code.lower(), payload)
        return {
            "status": "success",
            "message": f"Successfully imported {count} translations for language '{code}'",
            "count": count,
        }
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))
