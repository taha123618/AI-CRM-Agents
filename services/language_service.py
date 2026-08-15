from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import distinct
import uuid

from database.models import Language, Translation, TranslationAudit, UserPreference

# In-memory translation cache for high-throughput zero-latency reads
# Structure: { language_code: { namespace: { key: value } } }
_TRANSLATION_CACHE: Dict[str, Dict[str, Dict[str, str]]] = {}


def invalidate_translation_cache(language_code: Optional[str] = None):
    """Invalidate local translation cache."""
    global _TRANSLATION_CACHE
    if language_code:
        _TRANSLATION_CACHE.pop(language_code, None)
    else:
        _TRANSLATION_CACHE.clear()


KNOWN_LANGUAGE_PRESETS: Dict[str, Dict[str, Dict[str, str]]] = {
    "ur": {
        "common": {
            "app_name": "اے آئی پر مبنی سی آر ایم",
            "save": "تبدیلیاں محفوظ کریں",
            "cancel": "منسوخ کریں",
            "delete": "حذف کریں",
            "edit": "ترمیم کریں",
            "close": "بند کریں",
            "search": "ریکارڈز تلاش کریں...",
            "loading": "ڈیٹا لوڈ ہو رہا ہے...",
            "all": "سب",
            "status": "حیثیت",
            "actions": "اقدامات",
            "export": "برآمد کریں",
            "import": "درآمد کریں",
            "contact": "رابطہ",
            "email": "ای میل",
            "company": "کمپنی",
            "value": "قیمت",
            "date": "تاریخ",
            "priority": "ترجیح",
            "notes": "نوٹس",
            "new_ai_generated": "نیا اے آئی تیار کردہ",
            "new_ai_data": "نیا اے آئی ڈیٹا",
            "new_ai_qualified": "نیا اے آئی اہل",
            "new_ai_analyzed": "نیا اے آئی تجزیہ",
        },
        "nav": {
            "dashboard": "ڈیش بورڈ",
            "leads": "لیڈز کی اہلیت",
            "deals": "ڈیلز پائپ لائن",
            "customers": "کسٹمر کامیابی",
            "emails": "سمارٹ ان باکس",
            "meetings": "اے آئی کیلنڈر",
            "analytics": "تجزیات و پیشگوئی",
            "reports": "اے آئی رپورٹس",
            "agents": "ایجنٹ کنٹرول سینٹر",
            "languages": "زبانیں اور لوکلائزیشن",
        },
        "dashboard": {
            "title": "اے آئی ایگزیکٹو سی آر ایم ڈیش بورڈ",
            "subtitle": "حقیقی وقت میں پائپ لائن کی معلومات اور آمدنی کی نگرانی",
            "total_leads": "کل مانیٹر کردہ لیڈز",
            "active_pipeline": "فعال پائپ لائن کی مالیت",
            "active_customers": "فعال اکاؤنٹس",
            "monthly_revenue": "ماہانہ آمدنی (MRR)",
            "run_fleet_audit": "اے آئی فلیٹ کا مکمل آڈٹ چلائیں",
            "agent_telemetry": "خود مختار ایجنٹ سرگرمیاں",
        },
        "leads": {
            "title": "لیڈز اہلیت کنسول",
            "subtitle": "لیڈ کوالیفکیشن ایجنٹ کے ذریعے خودکار اسکورنگ اور تجزیہ",
            "all_prospects": "تمام ممکنہ گاہک",
            "qualify_btn": "لیڈ کی اہلیت جانچیں",
            "run_fleet_qualification": "اے آئی فلیٹ اہلیت چلائیں",
            "add_lead": "نیا لیڈ شامل کریں",
            "edit_lead": "پروفائل میں ترمیم کریں",
            "lead_score": "اے آئی اسکور",
            "qualification_status": "اہلیت کی حیثیت",
            "buying_signals": "خریداری کے اشارے",
            "routing": "روٹنگ",
            "next_action": "اگلا قدم",
            "first_name": "پہلا نام",
            "last_name": "آخری نام",
            "job_title": "عہدہ",
        },
        "deals": {
            "title": "سیلز پائپ لائن اور کانبان بورڈ",
            "subtitle": "ڈیلز کو مراحل کے درمیان منتقل کریں اور اے آئی صحت کا جائزہ لیں",
            "run_pipeline_audit": "پائپ لائن کا اے آئی آڈٹ چلائیں",
            "add_deal": "نئی ڈیل",
            "edit_deal": "ڈیل میں ترمیم کریں",
            "deal_name": "ڈیل کا نام",
            "pipeline_value": "پائپ لائن کی قیمت",
            "health_score": "صحت کا اسکور",
            "probability": "جیت کا امکان",
            "stage_discovery": "دریافت",
            "stage_proposal": "تجویز ارسال",
            "stage_negotiation": "مذاکرات",
            "stage_closed_won": "کامیاب اختتام",
            "stage_closed_lost": "ناکام اختتام",
        },
        "customers": {
            "title": "اکاؤنٹ کی صحت اور کسٹمر کامیابی",
            "subtitle": "کسٹمر ریٹینشن اور رسک مانیٹرنگ سسٹم",
            "run_churn_audit": "اے آئی ریٹینشن آڈٹ چلائیں",
            "all_accounts": "کسٹمر اکاؤنٹس",
            "churn_risk": "چھوڑنے کا خطرہ",
            "mrr": "ماہانہ آمدنی",
            "arr": "سالانہ آمدنی",
            "health_distribution": "صحت اسکور کی تقسیم",
            "telemetry_usage": "مصنوعات کا استعمال",
        },
        "emails": {
            "title": "خودکار ای میل انٹیلی جنس اور جذبات",
            "subtitle": "جذبات کا تجزیہ اور اے آئی کے ذریعے خودکار جوابات",
            "analyze_btn": "ای میل کا تجزیہ کریں",
            "sentiment": "جذبات",
            "draft_response": "اے آئی تیار کردہ جواب",
            "send_reply": "جواب ارسال کریں",
            "inbox": "سمارٹ ترجیحی ان باکس",
        },
        "meetings": {
            "title": "خودکار میٹنگ شیڈولنگ اور بریفنگز",
            "subtitle": "خودکار ایجنڈا بلڈر اور شرکاء کی تیاری",
            "schedule_btn": "اے آئی میٹنگ شیڈول کریں",
            "agenda": "ایگزیکٹو ایجنڈا",
            "prep_materials": "اے آئی تیاری کا مواد",
            "upcoming_meetings": "آنے والی میٹنگز",
        },
        "analytics": {
            "title": "ایگزیکٹو تجزیات اور آمدنی کی پیشگوئی",
            "subtitle": "حقیقی وقت میں آمدنی اور پائپ لائن کے رجحانات",
            "quarterly_forecast": "90 دن کی متوقع آمدنی",
            "run_analytics": "اے آئی پیشگوئی تیار کریں",
            "revenue_chart": "آمدنی کی نمو",
        },
        "reports": {
            "title": "اے آئی پیشگوئی اور اسٹریٹجک رپورٹس",
            "subtitle": "خودکار انٹیلی جنس رپورٹس جو اینالیٹکس ایجنٹ نے تیار کیں",
            "generate_btn": "نئی رپورٹ تیار کریں",
            "view_report": "مکمل رپورٹ دیکھیں",
            "export_json": "جے ایس او این برآمد کریں",
            "key_findings": "اہم نتائج اور میٹرکس",
        },
        "agents": {
            "title": "خود مختار ایجنٹ فلیٹ کنٹرول سینٹر",
            "subtitle": "اے آئی ایجنٹس کی کارروائی اور ٹیلی میٹری لاگز کا معائنہ کریں",
            "trigger_run": "ایجنٹ چلائیں",
            "event_console": "لائیو ایونٹ کنسول",
            "clear_events": "لاگز صاف کریں",
            "ready": "کام کے لیے تیار",
        },
        "languages": {
            "title": "زبانیں اور لوکلائزیشن کنسول",
            "subtitle": "نظام کی زبانیں اور ترجمے کا انتظام کریں",
            "active_language": "فعال زبان",
            "direction": "متن کی سمت",
            "set_default": "ڈیفالٹ مقرر کریں",
            "enable_language": "فعال کریں",
            "disable_language": "غیر فعال کریں",
            "add_language": "نئی زبان شامل کریں",
            "edit_translations": "ترجمہ میں ترمیم کریں",
            "import_translations": "جے ایس او این درآمد کریں",
            "export_translations": "جے ایس او این برآمد کریں",
            "filter_namespace": "نیم اسپیس کے لحاظ سے فلٹر کریں",
            "key": "ترجمہ کی کلید",
            "value": "ترجمہ شدہ قیمت",
            "fallback_preview": "ڈیفالٹ انگریزی متبادل",
        },
    }
}


class LanguageService:
    """Service handling Language CRUD, Translation CRUD, Fallback resolution, and caching."""

    @staticmethod
    def list_languages(db: Session, enabled_only: bool = False) -> List[Language]:
        """List all configured languages, optionally filtering by enabled status."""
        query = db.query(Language)
        if enabled_only:
            query = query.filter(Language.is_enabled.is_(True))
        return query.order_by(Language.is_default.desc(), Language.name.asc()).all()

    @staticmethod
    def get_language(db: Session, code: str) -> Optional[Language]:
        """Fetch language by ISO code."""
        return db.query(Language).filter(Language.code == code).first()

    @staticmethod
    def get_default_language(db: Session) -> Language:
        """Get current default fallback language (defaults to 'en')."""
        default_lang = db.query(Language).filter(Language.is_default.is_(True)).first()
        if not default_lang:
            default_lang = db.query(Language).filter(Language.code == "en").first()
        if not default_lang:
            # Fallback creation if empty
            default_lang = Language(
                code="en",
                name="English",
                english_name="English",
                direction="ltr",
                is_default=True,
                is_enabled=True,
                flag_emoji="🇺🇸",
            )
            db.add(default_lang)
            db.commit()
            db.refresh(default_lang)
        return default_lang

    @staticmethod
    def create_language(db: Session, data: Dict[str, Any]) -> Language:
        """Create a new language and auto-seed its initial translations."""
        code = data.get("code", "").lower().strip()
        existing = db.query(Language).filter(Language.code == code).first()
        if existing:
            raise ValueError(f"Language with code '{code}' already exists.")

        is_default = data.get("is_default", False)
        if is_default:
            # Reset other languages default flag
            db.query(Language).update({Language.is_default: False})

        # Direction auto-detection for RTL languages if not explicitly set
        direction = data.get("direction", "").lower()
        if not direction:
            direction = "rtl" if code in ["ar", "ur", "fa", "he", "ps", "sd"] else "ltr"

        name = data.get("name", "").strip()
        if not name and code == "ur":
            name = "اردو"

        english_name = data.get("english_name", data.get("name", "")).strip()
        if not english_name and code == "ur":
            english_name = "Urdu"

        flag_emoji = data.get("flag_emoji", "").strip()
        if not flag_emoji:
            flag_emoji = "🇵🇰" if code == "ur" else "🌐"

        new_lang = Language(
            code=code,
            name=name or code.upper(),
            english_name=english_name or code.upper(),
            direction=direction,
            is_default=is_default,
            is_enabled=data.get("is_enabled", True),
            flag_emoji=flag_emoji,
        )
        db.add(new_lang)
        db.commit()
        db.refresh(new_lang)

        # Automatically populate initial translations from presets or default language template
        if code in KNOWN_LANGUAGE_PRESETS:
            preset_dict = KNOWN_LANGUAGE_PRESETS[code]
            for ns, keys in preset_dict.items():
                for key_name, val_str in keys.items():
                    trans = Translation(
                        id=uuid.uuid4(),
                        language_code=code,
                        namespace=ns,
                        key=key_name,
                        value=val_str,
                        is_auto_translated=False,
                    )
                    db.add(trans)
            db.commit()
        else:
            # Clone default English keys as editable template rows for the new language
            default_lang = LanguageService.get_default_language(db)
            default_trans = (
                db.query(Translation)
                .filter(Translation.language_code == default_lang.code)
                .all()
            )
            for t in default_trans:
                cloned = Translation(
                    id=uuid.uuid4(),
                    language_code=code,
                    namespace=t.namespace,
                    key=t.key,
                    value=t.value,
                    is_auto_translated=True,
                )
                db.add(cloned)
            db.commit()

        invalidate_translation_cache(code)
        return new_lang

    @staticmethod
    def update_language(
        db: Session, code: str, data: Dict[str, Any]
    ) -> Optional[Language]:
        """Update existing language metadata and default status."""
        lang = db.query(Language).filter(Language.code == code).first()
        if not lang:
            return None

        if "is_default" in data and data["is_default"] and not lang.is_default:
            # Set this language as default, remove default from others
            db.query(Language).filter(Language.code != code).update(
                {Language.is_default: False}
            )
            lang.is_default = True
            lang.is_enabled = True  # Default must be enabled

        if "name" in data:
            lang.name = data["name"]
        if "english_name" in data:
            lang.english_name = data["english_name"]
        if "direction" in data and data["direction"] in ["ltr", "rtl"]:
            lang.direction = data["direction"]
        if "is_enabled" in data:
            if lang.is_default and not data["is_enabled"]:
                raise ValueError("Cannot disable the default application language.")
            lang.is_enabled = data["is_enabled"]
        if "flag_emoji" in data:
            lang.flag_emoji = data["flag_emoji"]

        db.commit()
        db.refresh(lang)
        invalidate_translation_cache(code)
        return lang

    @staticmethod
    def delete_language(db: Session, code: str) -> bool:
        """Delete language and its associated translations."""
        lang = db.query(Language).filter(Language.code == code).first()
        if not lang:
            return False
        if lang.is_default:
            raise ValueError("Cannot delete the default application language.")

        db.delete(lang)
        db.commit()
        invalidate_translation_cache(code)
        return True

    @staticmethod
    def get_translations_bundle(
        db: Session,
        language_code: str,
        namespace: Optional[str] = None,
        with_fallback: bool = True,
    ) -> Dict[str, Dict[str, str]]:
        """
        Fetch translations for a language organized by namespace.
        If with_fallback is True, missing keys in language_code fall back to the default language.
        """
        global _TRANSLATION_CACHE

        # 1. Fetch default language translations if fallback enabled
        default_lang = LanguageService.get_default_language(db)
        default_dict: Dict[str, Dict[str, str]] = {}

        if with_fallback and language_code != default_lang.code:
            default_query = db.query(Translation).filter(
                Translation.language_code == default_lang.code
            )
            if namespace:
                default_query = default_query.filter(Translation.namespace == namespace)
            for t in default_query.all():
                ns_str = str(t.namespace)
                key_str = str(t.key)
                val_str = str(t.value)
                if ns_str not in default_dict:
                    default_dict[ns_str] = {}
                default_dict[ns_str][key_str] = val_str

        # 2. Fetch requested language translations (and backfill preset if empty)
        lang_count = (
            db.query(Translation)
            .filter(Translation.language_code == language_code)
            .count()
        )

        if lang_count == 0 and language_code in KNOWN_LANGUAGE_PRESETS:
            preset_dict = KNOWN_LANGUAGE_PRESETS[language_code]
            for ns, keys in preset_dict.items():
                for key_name, val_str in keys.items():
                    trans = Translation(
                        id=uuid.uuid4(),
                        language_code=language_code,
                        namespace=ns,
                        key=key_name,
                        value=val_str,
                        is_auto_translated=False,
                    )
                    db.add(trans)
            db.commit()

        lang_query = db.query(Translation).filter(
            Translation.language_code == language_code
        )
        if namespace:
            lang_query = lang_query.filter(Translation.namespace == namespace)

        result_dict: Dict[str, Dict[str, str]] = {}

        # Pre-fill with fallback defaults if applicable
        for ns, keys in default_dict.items():
            result_dict[ns] = dict(keys)

        # Overwrite with language-specific translations
        for t in lang_query.all():
            ns_str = str(t.namespace)
            key_str = str(t.key)
            val_str = str(t.value)
            if ns_str not in result_dict:
                result_dict[ns_str] = {}
            result_dict[ns_str][key_str] = val_str

        _TRANSLATION_CACHE[language_code] = result_dict
        return result_dict

    @staticmethod
    def upsert_single_translation(
        db: Session,
        language_code: str,
        namespace: str,
        key: str,
        value: str,
        is_auto: bool = False,
    ) -> Translation:
        """Upsert a single translation key/value."""
        # Ensure language exists
        lang = db.query(Language).filter(Language.code == language_code).first()
        if not lang:
            raise ValueError(f"Language '{language_code}' does not exist.")

        translation = (
            db.query(Translation)
            .filter(
                Translation.language_code == language_code,
                Translation.namespace == namespace,
                Translation.key == key,
            )
            .first()
        )

        old_val = None
        if translation:
            old_val = translation.value
            translation.value = value
            translation.is_auto_translated = is_auto
        else:
            translation = Translation(
                id=uuid.uuid4(),
                language_code=language_code,
                namespace=namespace,
                key=key,
                value=value,
                is_auto_translated=is_auto,
            )
            db.add(translation)

        # Audit log entry
        db.add(
            TranslationAudit(
                id=uuid.uuid4(),
                language_code=language_code,
                namespace=namespace,
                key=key,
                old_value=old_val,
                new_value=value,
                changed_by="admin",
                action="update" if old_val is not None else "create",
            )
        )

        db.commit()
        db.refresh(translation)
        invalidate_translation_cache(language_code)
        return translation

    @staticmethod
    def delete_translation(
        db: Session,
        language_code: str,
        namespace: str,
        key: str,
    ) -> bool:
        """Delete a single translation key and record audit log."""
        translation = (
            db.query(Translation)
            .filter(
                Translation.language_code == language_code,
                Translation.namespace == namespace,
                Translation.key == key,
            )
            .first()
        )
        if not translation:
            return False

        db.add(
            TranslationAudit(
                id=uuid.uuid4(),
                language_code=language_code,
                namespace=namespace,
                key=key,
                old_value=translation.value,
                new_value=None,
                changed_by="admin",
                action="delete",
            )
        )
        db.delete(translation)
        db.commit()
        invalidate_translation_cache(language_code)
        return True

    @staticmethod
    def bulk_upsert_translations(
        db: Session,
        language_code: str,
        translations_data: Dict[str, Dict[str, str]],
    ) -> int:
        """
        Bulk upsert nested translations dictionary: { namespace: { key: value } }.
        Returns the count of updated/created records.
        """
        lang = db.query(Language).filter(Language.code == language_code).first()
        if not lang:
            raise ValueError(f"Language '{language_code}' does not exist.")

        count = 0
        for ns, keys in translations_data.items():
            for k, val in keys.items():
                existing = (
                    db.query(Translation)
                    .filter(
                        Translation.language_code == language_code,
                        Translation.namespace == ns,
                        Translation.key == k,
                    )
                    .first()
                )
                if existing:
                    existing.value = val
                else:
                    db.add(
                        Translation(
                            id=uuid.uuid4(),
                            language_code=language_code,
                            namespace=ns,
                            key=k,
                            value=val,
                            is_auto_translated=False,
                        )
                    )
                count += 1

        db.add(
            TranslationAudit(
                id=uuid.uuid4(),
                language_code=language_code,
                namespace="bulk",
                key=f"{count}_keys",
                old_value=None,
                new_value=f"Imported/updated {count} keys",
                changed_by="admin",
                action="import",
            )
        )

        db.commit()
        invalidate_translation_cache(language_code)
        return count

    @staticmethod
    def list_namespaces(db: Session) -> List[str]:
        """List distinct translation namespaces present in the CRM."""
        namespaces = db.query(distinct(Translation.namespace)).all()
        ns_list = [ns[0] for ns in namespaces if ns[0]]
        # Always include default core namespaces
        core_ns = [
            "common",
            "nav",
            "dashboard",
            "leads",
            "deals",
            "customers",
            "emails",
            "meetings",
            "analytics",
            "reports",
            "agents",
            "languages",
        ]
        return sorted(list(set(ns_list + core_ns)))

    @staticmethod
    def list_audits(
        db: Session,
        language_code: Optional[str] = None,
        limit: int = 50,
    ) -> List[TranslationAudit]:
        """Fetch audit log records for administrative changes."""
        query = db.query(TranslationAudit)
        if language_code:
            query = query.filter(TranslationAudit.language_code == language_code)
        return query.order_by(TranslationAudit.created_at.desc()).limit(limit).all()

    @staticmethod
    def get_user_preference(
        db: Session, user_id: str = "default_user"
    ) -> UserPreference:
        """Fetch or initialize user localization preferences."""
        pref = (
            db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
        )
        if not pref:
            pref = UserPreference(
                id=uuid.uuid4(),
                user_id=user_id,
                preferred_language_code="en",
                theme="dark",
                date_format="YYYY-MM-DD",
                timezone="UTC",
            )
            db.add(pref)
            db.commit()
            db.refresh(pref)
        return pref

    @staticmethod
    def set_user_preference(
        db: Session,
        user_id: str,
        data: Dict[str, Any],
    ) -> UserPreference:
        """Update user localization and locale format preferences."""
        pref = LanguageService.get_user_preference(db, user_id=user_id)
        if "preferred_language_code" in data and data["preferred_language_code"]:
            pref.preferred_language_code = data["preferred_language_code"]
        if "theme" in data:
            pref.theme = data["theme"]
        if "date_format" in data:
            pref.date_format = data["date_format"]
        if "timezone" in data:
            pref.timezone = data["timezone"]

        db.commit()
        db.refresh(pref)
        return pref

    @staticmethod
    def export_language_json(db: Session, language_code: str) -> Dict[str, Any]:
        """Export all translations for a language as a structured JSON object."""
        lang = db.query(Language).filter(Language.code == language_code).first()
        if not lang:
            raise ValueError(f"Language '{language_code}' not found.")

        translations = LanguageService.get_translations_bundle(
            db, language_code=language_code, with_fallback=False
        )

        return {
            "meta": {
                "language_code": lang.code,
                "name": lang.name,
                "english_name": lang.english_name,
                "direction": lang.direction,
                "flag_emoji": lang.flag_emoji,
                "exported_at": str(lang.updated_at or lang.created_at),
            },
            "translations": translations,
        }

    @staticmethod
    def import_language_json(
        db: Session, language_code: str, payload: Dict[str, Any]
    ) -> int:
        """Import structured JSON dictionary into database."""
        translations_dict = payload.get("translations", payload)
        if not isinstance(translations_dict, dict):
            raise ValueError("Invalid payload: 'translations' must be a dictionary.")

        return LanguageService.bulk_upsert_translations(
            db, language_code=language_code, translations_data=translations_dict
        )
