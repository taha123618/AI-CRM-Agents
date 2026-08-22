"""Tests for Multi-Language and Translation APIs."""

import pytest
from fastapi.testclient import TestClient

from main import app
from tests.conftest import get_authenticated_client
from database.connection import SessionLocal
from database.seed import seed_languages_and_translations

client = get_authenticated_client()


@pytest.fixture(autouse=True)
def ensure_languages_seeded():
    """Ensure database has seeded languages before tests."""
    db = SessionLocal()
    try:
        seed_languages_and_translations(db)
    finally:
        db.close()


def test_list_languages():
    """Test GET /api/languages returns configured languages."""
    response = client.get("/api/languages")
    assert response.status_code == 200
    languages = response.json()
    assert len(languages) >= 7

    codes = [lang["code"] for lang in languages]
    assert "en" in codes
    assert "es" in codes
    assert "ar" in codes

    # English should be default
    en_lang = next(lang for lang in languages if lang["code"] == "en")
    assert en_lang["is_default"] is True
    assert en_lang["direction"] == "ltr"

    # Arabic should be RTL
    ar_lang = next(lang for lang in languages if lang["code"] == "ar")
    assert ar_lang["direction"] == "rtl"


def test_create_and_update_language():
    """Test creating a new language and updating its configuration."""
    # 1. Create Italian language
    payload = {
        "code": "it",
        "name": "Italiano",
        "english_name": "Italian",
        "direction": "ltr",
        "is_default": False,
        "is_enabled": True,
        "flag_emoji": "🇮🇹",
    }
    create_res = client.post("/api/languages", json=payload)
    assert create_res.status_code == 201
    assert create_res.json()["language"]["code"] == "it"

    # 2. Get language by code
    get_res = client.get("/api/languages/it")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Italiano"

    # 3. Update language
    update_res = client.put(
        "/api/languages/it",
        json={"name": "Italiano Standard", "is_enabled": False},
    )
    assert update_res.status_code == 200
    assert update_res.json()["language"]["name"] == "Italiano Standard"
    assert update_res.json()["language"]["is_enabled"] is False

    # 4. Cleanup/Delete
    del_res = client.delete("/api/languages/it")
    assert del_res.status_code == 200


def test_default_language_protection():
    """Test that default language cannot be deleted or disabled."""
    # Attempt to delete English (default)
    del_res = client.delete("/api/languages/en")
    assert del_res.status_code == 400
    assert "Cannot delete the default" in del_res.json()["detail"]

    # Attempt to disable English
    disable_res = client.put("/api/languages/en", json={"is_enabled": False})
    assert disable_res.status_code == 400
    assert "Cannot disable the default" in disable_res.json()["detail"]


def test_translations_fetch_with_fallback():
    """Test fetching translations with fallback resolution."""
    # Fetch Spanish translations
    res = client.get("/api/languages/es/translations?namespace=common")
    assert res.status_code == 200
    data = res.json()
    assert data["language_code"] == "es"
    assert "common" in data["translations"]
    assert data["translations"]["common"]["save"] == "Guardar Cambios"


def test_translations_single_key_update_and_bulk():
    """Test updating a single translation key and bulk upserting."""
    # 1. Update single key in French
    update_res = client.put(
        "/api/languages/fr/translations/common/custom_test_key",
        json={"value": "Valeur de test personnalisée", "is_auto_translated": False},
    )
    assert update_res.status_code == 200
    assert update_res.json()["translation"]["value"] == "Valeur de test personnalisée"

    # Verify key is returned
    get_res = client.get("/api/languages/fr/translations?namespace=common")
    assert (
        get_res.json()["translations"]["common"]["custom_test_key"]
        == "Valeur de test personnalisée"
    )

    # 2. Bulk upsert in German
    bulk_payload = {
        "translations": {
            "dashboard": {
                "custom_metric": "Benutzerdefinierte Metrik",
            }
        }
    }
    bulk_res = client.post("/api/languages/de/translations", json=bulk_payload)
    assert bulk_res.status_code == 200
    assert bulk_res.json()["count"] >= 1


def test_export_and_import_translations():
    """Test exporting and importing translation bundles."""
    # 1. Export Spanish JSON
    export_res = client.get("/api/languages/es/export")
    assert export_res.status_code == 200
    export_data = export_res.json()
    assert export_data["meta"]["language_code"] == "es"
    assert "common" in export_data["translations"]

    # 2. Import into Spanish
    export_data["translations"]["common"][
        "import_test_key"
    ] = "Clave de prueba importada"
    import_res = client.post("/api/languages/es/import", json=export_data)
    assert import_res.status_code == 200
    assert import_res.json()["status"] == "success"

    # Verify imported key exists
    verify_res = client.get("/api/languages/es/translations?namespace=common")
    assert (
        verify_res.json()["translations"]["common"]["import_test_key"]
        == "Clave de prueba importada"
    )


def test_create_urdu_language_and_auto_translations():
    """Test creating Urdu language (RTL) and auto-populating Urdu translations."""
    # Delete if exists from previous run
    client.delete("/api/languages/ur")

    payload = {
        "code": "ur",
        "name": "اردو",
        "english_name": "Urdu",
        "direction": "rtl",
        "is_default": False,
        "is_enabled": True,
        "flag_emoji": "🇵🇰",
    }
    create_res = client.post("/api/languages", json=payload)
    assert create_res.status_code == 201
    assert create_res.json()["language"]["direction"] == "rtl"

    # Fetch translations for Urdu
    ur_trans_res = client.get("/api/languages/ur/translations?namespace=common")
    assert ur_trans_res.status_code == 200
    ur_common = ur_trans_res.json()["translations"]["common"]
    assert ur_common["app_name"] == "اے آئی پر مبنی سی آر ایم"
    assert ur_common["save"] == "تبدیلیاں محفوظ کریں"
    assert ur_common["search"] == "ریکارڈز تلاش کریں..."

    # Cleanup
    client.delete("/api/languages/ur")


def test_namespaces_and_audits():
    """Test retrieving namespaces and audit logs."""
    # 1. Namespaces
    ns_res = client.get("/api/languages/namespaces")
    assert ns_res.status_code == 200
    namespaces = ns_res.json()
    assert "common" in namespaces
    assert "leads" in namespaces
    assert "deals" in namespaces

    # 2. Audits
    audit_res = client.get("/api/languages/audits?limit=10")
    assert audit_res.status_code == 200
    audits = audit_res.json()
    assert isinstance(audits, list)


def test_user_preferences():
    """Test getting and updating user localization preferences."""
    import uuid

    unique_user = f"user_{uuid.uuid4().hex[:8]}"

    # 1. Get default
    get_res = client.get(f"/api/languages/preferences/me?user_id={unique_user}")
    assert get_res.status_code == 200
    data = get_res.json()
    assert data["preferred_language_code"] == "en"

    # 2. Update preference to Spanish
    put_res = client.put(
        f"/api/languages/preferences/me?user_id={unique_user}",
        json={
            "preferred_language_code": "es",
            "theme": "system",
            "timezone": "Europe/Madrid",
        },
    )
    assert put_res.status_code == 200
    updated = put_res.json()["preferences"]
    assert updated["preferred_language_code"] == "es"
    assert updated["theme"] == "system"


def test_delete_translation_and_runtime_endpoint():
    """Test deleting translation key and verifying runtime i18n endpoint."""
    # 1. Insert temporary key
    client.put(
        "/api/languages/es/translations/common/temp_delete_key",
        json={"value": "Temp string to delete", "is_auto_translated": False},
    )

    # 2. Runtime endpoint
    rt_res = client.get("/api/i18n/es/common")
    assert rt_res.status_code == 200
    assert rt_res.json()["translations"]["temp_delete_key"] == "Temp string to delete"

    # 3. Delete key
    del_res = client.delete("/api/languages/es/translations/common/temp_delete_key")
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "success"
