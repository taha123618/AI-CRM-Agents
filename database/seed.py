"""Database Seeding Script for AI CRM development"""

# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
import uuid

from database.models import (
    Company,
    Contact,
    Deal,
    Customer,
    Meeting,
    Email,
    Language,
    Translation,
)


def seed_database(db: Session):
    """Seed the database with sample data if empty"""
    # Always ensure languages and translations are seeded
    seed_languages_and_translations(db)

    # Check if companies already exist
    if db.query(Company).count() > 0:
        print("Database already has CRM business data. Skipping main seed.")
        return

    print("Seeding database with rich development mock records...")

    # 1. Create Companies
    acme = Company(
        id=uuid.uuid4(),
        name="Acme Corporation",
        domain="acme.com",
        industry="Technology",
        company_size="enterprise",
        revenue_range="$10M-$50M",
        location="San Francisco, CA",
        timezone="PST",
        enrichment_data={
            "description": "Acme Corp is a global leader in manufacturing and distribution.",
            "linkedin": "linkedin.com/company/acme",
        },
    )

    techstart = Company(
        id=uuid.uuid4(),
        name="TechStart Inc",
        domain="techstart.io",
        industry="SaaS",
        company_size="medium",
        revenue_range="$1M-$5M",
        location="Austin, TX",
        timezone="CST",
        enrichment_data={
            "description": "Next generation collaborative SaaS tools for software development.",
            "linkedin": "linkedin.com/company/techstart",
        },
    )

    globalcorp = Company(
        id=uuid.uuid4(),
        name="GlobalCorp Systems",
        domain="globalcorp.com",
        industry="Finance",
        company_size="enterprise",
        revenue_range="$100M+",
        location="New York, NY",
        timezone="EST",
        enrichment_data={
            "description": "Global financial services, brokerage, and risk advisory services.",
            "linkedin": "linkedin.com/company/globalcorp",
        },
    )

    db.add_all([acme, techstart, globalcorp])
    db.commit()

    # 2. Create Contacts
    john = Contact(
        id=uuid.uuid4(),
        company_id=acme.id,
        email="john.doe@acme.com",
        first_name="John",
        last_name="Doe",
        job_title="VP of Engineering",
        job_level="executive",
        phone="555-0199",
        linkedin_url="linkedin.com/in/johndoe",
        lead_score=85,
        lead_status="qualified",
        lead_source="Website Form",
        enrichment_data={
            "signals": ["SOC2 Inquiry", "Pricing Page Visit"],
            "buying_signals": ["SLA request", "High frequency usage"],
            "routing_team": "Enterprise East",
            "recommended_action": "Send customized security document pack",
        },
    )

    sarah = Contact(
        id=uuid.uuid4(),
        company_id=techstart.id,
        email="sarah.smith@techstart.io",
        first_name="Sarah",
        last_name="Smith",
        job_title="CTO",
        job_level="executive",
        phone="555-0244",
        linkedin_url="linkedin.com/in/sarahsmith",
        lead_score=92,
        lead_status="qualified",
        lead_source="Outbound Email",
        enrichment_data={
            "signals": ["API Documentation Read", "Integrations Checked"],
            "buying_signals": ["Self-serve signup", "Developer API key created"],
            "routing_team": "Developer Growth",
            "recommended_action": "Introduce customer support lead",
        },
    )

    bob = Contact(
        id=uuid.uuid4(),
        company_id=globalcorp.id,
        email="bob.jones@globalcorp.com",
        first_name="Bob",
        last_name="Jones",
        job_title="Director of Procurement",
        job_level="senior",
        phone="555-0377",
        lead_score=45,
        lead_status="new",
        lead_source="Cold Call",
        enrichment_data={
            "buying_signals": ["Budget constraint", "Competitor research"],
            "routing_team": "Finance Accounts",
            "recommended_action": "Follow up with standard product deck",
        },
    )

    alice = Contact(
        id=uuid.uuid4(),
        company_id=acme.id,
        email="alice.johnson@acme.com",
        first_name="Alice",
        last_name="Johnson",
        job_title="Product Manager",
        job_level="mid",
        phone="555-0122",
        lead_score=60,
        lead_status="contacted",
        lead_source="Referral",
    )

    db.add_all([john, sarah, bob, alice])
    db.commit()

    # 3. Create Customers
    acme_cust = Customer(
        id=uuid.uuid4(),
        company_id=acme.id,
        plan="Professional",
        mrr=4999.00,
        arr=59988.00,
        contract_start_date=date.today() - timedelta(days=180),
        contract_end_date=date.today() + timedelta(days=185),
        health_score=85,
        churn_risk="low",
        churn_probability=12,
        last_login_at=datetime.utcnow() - timedelta(hours=4),
        logins_per_week=45,
        features_used=8,
        total_features=10,
        license_usage_percent=90,
        daily_active_users=32,
        support_tickets_30d=1,
        critical_tickets_open=0,
        avg_resolution_hours=12,
        csat_score=4.8,
        nps_score=9,
        last_payment_at=datetime.utcnow() - timedelta(days=15),
        payment_delays=0,
        additional_metadata={
            "recommended_actions": [
                "Schedule annual executive business review (QBR)",
                "Propose seat expansion model to cover design team",
                "Introduce new enterprise analytics reporting dashboard",
            ]
        },
    )

    tech_cust = Customer(
        id=uuid.uuid4(),
        company_id=techstart.id,
        plan="Startup",
        mrr=999.00,
        arr=11988.00,
        contract_start_date=date.today() - timedelta(days=90),
        contract_end_date=date.today() + timedelta(days=275),
        health_score=42,
        churn_risk="high",
        churn_probability=68,
        last_login_at=datetime.utcnow() - timedelta(days=6),
        logins_per_week=4,
        features_used=2,
        total_features=10,
        license_usage_percent=30,
        daily_active_users=3,
        support_tickets_30d=5,
        critical_tickets_open=2,
        avg_resolution_hours=48,
        csat_score=2.1,
        nps_score=4,
        last_payment_at=datetime.utcnow() - timedelta(days=40),
        payment_delays=1,
        additional_metadata={
            "recommended_actions": [
                "Urgent reachout: Resolve outstanding open high-severity tickets",
                "Setup product training session for newly onboarded engineers",
                "Review payment delay issue with accounts receivable",
            ]
        },
    )

    db.add_all([acme_cust, tech_cust])
    db.commit()

    # 4. Create Deals
    acme_deal = Deal(
        id=uuid.uuid4(),
        company_id=acme.id,
        contact_id=john.id,
        name="Acme Enterprise SLA Upgrade",
        value=75000.00,
        stage="proposal",
        probability=70,
        health_score=80,
        is_stalled=False,
        risk_factors=[],
        expected_close_date=date.today() + timedelta(days=30),
        notes="SLA and SOC2 compliance documents requested and sent. Looking to close before fiscal end.",
        additional_metadata={
            "close_probability": 75,
            "next_actions": [
                "Confirm SLA review meeting with legal team",
                "Verify standard payment terms (net 30)",
            ],
        },
    )

    techstart_deal = Deal(
        id=uuid.uuid4(),
        company_id=techstart.id,
        contact_id=sarah.id,
        name="TechStart Add-on Seats Expansion",
        value=15000.00,
        stage="negotiation",
        probability=60,
        health_score=45,
        is_stalled=True,
        risk_factors=["Budget constraint", "Competitor offering free trial extension"],
        expected_close_date=date.today() + timedelta(days=15),
        notes="Stalled due to competitor pricing matching. Negotiating terms.",
        additional_metadata={
            "close_probability": 40,
            "forecast_close_date": "2026-10-31",
            "next_actions": [
                "Provide executive discount justification sheet",
                "Check custom integration possibilities",
            ],
        },
    )

    global_deal = Deal(
        id=uuid.uuid4(),
        company_id=globalcorp.id,
        contact_id=bob.id,
        name="GlobalCorp Core CRM License Pilot",
        value=120000.00,
        stage="qualification",
        probability=25,
        health_score=60,
        is_stalled=False,
        risk_factors=["Security clearance delay"],
        expected_close_date=date.today() + timedelta(days=60),
        notes="Initial calls done. Preparing customization estimates for their dev tools integration.",
        additional_metadata={
            "close_probability": 30,
            "forecast_close_date": "2026-12-15",
            "next_actions": [
                "Schedule pilot scope alignment call",
                "Send security questionnaire docs",
            ],
        },
    )

    db.add_all([acme_deal, techstart_deal, global_deal])
    db.commit()

    # 5. Create Meetings
    m1 = Meeting(
        id=uuid.uuid4(),
        deal_id=acme_deal.id,
        title="Executive SLA & SOC2 Review",
        meeting_type="Executive Demo",
        scheduled_at=datetime.utcnow() - timedelta(days=1),
        duration_minutes=45,
        location="https://meet.google.com/abc-defg-hij",
        attendees=["john.doe@acme.com", "seller@company.com"],
        agenda=[
            "1. SLA Expectations Review (15 mins)",
            "2. Security & SOC2 Review (20 mins)",
            "3. Net 30/Custom Billing (10 mins)",
        ],
        prep_materials={
            "security_packet": "Sent on Monday",
            "sla_terms_draft": "Draft version 1.4 attached",
        },
        notes="Customer accepted the standard SLA clauses but requested a minor review of the liability limit.",
        followup_tasks=[
            "Send updated liability limit clause",
            "Coordinate execution date",
        ],
        status="completed",
    )

    m2 = Meeting(
        id=uuid.uuid4(),
        deal_id=techstart_deal.id,
        title="Expansion Technical Integration Sync",
        meeting_type="Technical Deep-Dive",
        scheduled_at=datetime.utcnow() + timedelta(days=2, hours=3),
        duration_minutes=30,
        location="https://meet.google.com/xyz-qprs-tuv",
        attendees=["sarah.smith@techstart.io", "engineer@company.com"],
        agenda=[
            "1. Multi-tenant key configuration",
            "2. Data localization guidelines",
            "3. Support setup for engineers",
        ],
        prep_materials={"api_docs_link": "https://docs.company.com/api"},
        notes="Sync session to ensure the expansion seats can leverage API capabilities.",
        status="scheduled",
    )

    db.add_all([m1, m2])
    db.commit()

    # 6. Create Emails
    e1 = Email(
        id=uuid.uuid4(),
        contact_id=john.id,
        from_email="john.doe@acme.com",
        to_email="seller@company.com",
        subject="SLA and SOC2 compliance inquiry",
        body="Hi, We need enterprise SLA guarantees and custom data residency. We also require your SOC2 Type II report for our compliance review. Thank you, John.",
        direction="inbound",
        sentiment="positive",
        sentiment_score=8,
        emotion="happiness",
        category="Security & Compliance",
        priority="high",
        draft_response="Hi John, thank you for reaching out. We have sent our SLA guarantees and SOC2 Type II compliance reports. Let me know if you have any questions.",
        response_sent=True,
        received_at=datetime.utcnow() - timedelta(hours=6),
        follow_up_suggestions=[
            "Confirm receipt of SOC2 Type II report",
            "Ask if their legal team wants a direct discussion",
        ],
    )

    e2 = Email(
        id=uuid.uuid4(),
        contact_id=sarah.id,
        from_email="sarah.smith@techstart.io",
        to_email="seller@company.com",
        subject="Slightly delayed timeline & pricing query",
        body="Hello, We are seeing some budget constraints for the custom integrations. Is there any flexibility on the startup plan seats pricing? Otherwise we might need to delay.",
        direction="inbound",
        sentiment="neutral",
        sentiment_score=5,
        emotion="frustration",
        category="Pricing & Discounts",
        priority="medium",
        draft_response="Hi Sarah, I understand budget constraints. We can look at a 15% discount for a yearly upfront commitment.",
        response_sent=False,
        received_at=datetime.utcnow() - timedelta(hours=2),
        follow_up_suggestions=[
            "Offer annual commitment pricing",
            "Check if they can reduce the seat count initially",
        ],
    )

    db.add_all([e1, e2])
    db.commit()

    seed_languages_and_translations(db)
    seed_custom_agents(db)
    seed_voice_and_whatsapp(db)

    print(
        "Database seeding completed successfully! Added companies, contacts, deals, customers, languages, custom agents, voice calls, and WhatsApp chats."
    )


def seed_languages_and_translations(db: Session):
    """Seed multi-language support tables with 7 core languages and full dictionaries."""
    if db.query(Language).count() > 0:
        return

    print(
        "Seeding multi-language support (7 languages + comprehensive dictionaries)..."
    )

    # 1. Languages definition
    languages_data = [
        {
            "code": "en",
            "name": "English",
            "english_name": "English",
            "direction": "ltr",
            "is_default": True,
            "is_enabled": True,
            "flag_emoji": "🇺🇸",
        },
        {
            "code": "es",
            "name": "Español",
            "english_name": "Spanish",
            "direction": "ltr",
            "is_default": False,
            "is_enabled": True,
            "flag_emoji": "🇪🇸",
        },
        {
            "code": "fr",
            "name": "Français",
            "english_name": "French",
            "direction": "ltr",
            "is_default": False,
            "is_enabled": True,
            "flag_emoji": "🇫🇷",
        },
        {
            "code": "de",
            "name": "Deutsch",
            "english_name": "German",
            "direction": "ltr",
            "is_default": False,
            "is_enabled": True,
            "flag_emoji": "🇩🇪",
        },
        {
            "code": "ar",
            "name": "العربية",
            "english_name": "Arabic",
            "direction": "rtl",
            "is_default": False,
            "is_enabled": True,
            "flag_emoji": "🇸🇦",
        },
        {
            "code": "ja",
            "name": "日本語",
            "english_name": "Japanese",
            "direction": "ltr",
            "is_default": False,
            "is_enabled": True,
            "flag_emoji": "🇯🇵",
        },
        {
            "code": "zh",
            "name": "中文 (简体)",
            "english_name": "Chinese (Simplified)",
            "direction": "ltr",
            "is_default": False,
            "is_enabled": True,
            "flag_emoji": "🇨🇳",
        },
        {
            "code": "ur",
            "name": "اردو",
            "english_name": "Urdu",
            "direction": "rtl",
            "is_default": False,
            "is_enabled": True,
            "flag_emoji": "🇵🇰",
        },
    ]

    for lang in languages_data:
        db.add(Language(**lang))
    db.commit()

    # 2. Master translations map
    # Structure: { namespace: { key: { lang_code: value } } }
    master_translations = {
        "common": {
            "app_name": {
                "en": "AI-Powered CRM",
                "es": "CRM Potenciado por IA",
                "fr": "CRM Propulsé par l'IA",
                "de": "KI-gestütztes CRM",
                "ar": "نظام إدارة علاقات العملاء بالذكاء الاصطناعي",
                "ja": "AI駆動型CRM",
                "zh": "AI智能CRM",
            },
            "save": {
                "en": "Save Changes",
                "es": "Guardar Cambios",
                "fr": "Enregistrer les modifications",
                "de": "Änderungen speichern",
                "ar": "حفظ التغييرات",
                "ja": "変更を保存",
                "zh": "保存更改",
            },
            "cancel": {
                "en": "Cancel",
                "es": "Cancelar",
                "fr": "Annuler",
                "de": "Abbrechen",
                "ar": "إلغاء",
                "ja": "キャンセル",
                "zh": "取消",
            },
            "delete": {
                "en": "Delete",
                "es": "Eliminar",
                "fr": "Supprimer",
                "de": "Löschen",
                "ar": "حذف",
                "ja": "削除",
                "zh": "删除",
            },
            "edit": {
                "en": "Edit",
                "es": "Editar",
                "fr": "Modifier",
                "de": "Bearbeiten",
                "ar": "تعديل",
                "ja": "編集",
                "zh": "编辑",
            },
            "close": {
                "en": "Close",
                "es": "Cerrar",
                "fr": "Fermer",
                "de": "Schließen",
                "ar": "إغلاق",
                "ja": "閉じる",
                "zh": "关闭",
            },
            "search": {
                "en": "Search records...",
                "es": "Buscar registros...",
                "fr": "Rechercher des enregistrements...",
                "de": "Datensätze suchen...",
                "ar": "البحث في السجلات...",
                "ja": "レコードを検索...",
                "zh": "搜索记录...",
            },
            "loading": {
                "en": "Loading telemetry...",
                "es": "Cargando telemetría...",
                "fr": "Chargement de la télémétrie...",
                "de": "Telemetrie wird geladen...",
                "ar": "جاري تحميل القياس عن بعد...",
                "ja": "テレメトリを読み込み中...",
                "zh": "正在加载遥测数据...",
            },
            "all": {
                "en": "All",
                "es": "Todos",
                "fr": "Tous",
                "de": "Alle",
                "ar": "الكل",
                "ja": "すべて",
                "zh": "全部",
            },
            "status": {
                "en": "Status",
                "es": "Estado",
                "fr": "Statut",
                "de": "Status",
                "ar": "الحالة",
                "ja": "ステータス",
                "zh": "状态",
            },
            "actions": {
                "en": "Actions",
                "es": "Acciones",
                "fr": "Actions",
                "de": "Aktionen",
                "ar": "الإجراءات",
                "ja": "操作",
                "zh": "操作",
            },
            "export": {
                "en": "Export",
                "es": "Exportar",
                "fr": "Exporter",
                "de": "Exportieren",
                "ar": "تصدير",
                "ja": "エクスポート",
                "zh": "导出",
            },
            "import": {
                "en": "Import",
                "es": "Importar",
                "fr": "Importer",
                "de": "Importieren",
                "ar": "استيراد",
                "ja": "インポート",
                "zh": "导入",
            },
            "new_ai_generated": {
                "en": "NEW AI GENERATED",
                "es": "NUEVO GENERADO POR IA",
                "fr": "NOUVEAU GÉNÉRÉ PAR L'IA",
                "de": "NEU KI-GENERIERT",
                "ar": "جديد تم إنشاؤه بالذكاء الاصطناعي",
                "ja": "新規AI生成",
                "zh": "新AI生成",
            },
            "new_ai_data": {
                "en": "NEW AI DATA",
                "es": "NUEVOS DATOS IA",
                "fr": "NOUVELLES DONNÉES IA",
                "de": "NEUE KI-DATEN",
                "ar": "بيانات ذكاء اصطناعي جديدة",
                "ja": "新規AIデータ",
                "zh": "新AI数据",
            },
            "new_ai_qualified": {
                "en": "NEW AI QUALIFIED",
                "es": "CALIFICADO POR IA",
                "fr": "QUALIFIÉ PAR L'IA",
                "de": "KI-QUALIFIZIERT",
                "ar": "مؤهل بالذكاء الاصطناعي",
                "ja": "AI認定済み",
                "zh": "AI已合格",
            },
            "new_ai_analyzed": {
                "en": "NEW AI ANALYZED",
                "es": "ANALIZADO POR IA",
                "fr": "ANALYSÉ PAR L'IA",
                "de": "KI-ANALYSIERT",
                "ar": "محلل بالذكاء الاصطناعي",
                "ja": "AI分析済み",
                "zh": "AI已分析",
            },
        },
        "nav": {
            "dashboard": {
                "en": "Executive Dashboard",
                "es": "Panel Ejecutivo",
                "fr": "Tableau de Bord",
                "de": "Executive Dashboard",
                "ar": "لوحة التحكم التنفيذية",
                "ja": "エグゼクティブダッシュボード",
                "zh": "执行仪表板",
            },
            "leads": {
                "en": "Lead Qualification",
                "es": "Calificación de Leads",
                "fr": "Qualification des Prospects",
                "de": "Lead-Qualifizierung",
                "ar": "تأهيل العملاء المحتملين",
                "ja": "リード適格性評価",
                "zh": "线索评估",
            },
            "deals": {
                "en": "Deals Pipeline",
                "es": "Pipeline de Ventas",
                "fr": "Pipeline des Affaires",
                "de": "Deal-Pipeline",
                "ar": "مسار الصفقات",
                "ja": "取引パイプライン",
                "zh": "交易流水线",
            },
            "customers": {
                "en": "Customer Success",
                "es": "Éxito del Cliente",
                "fr": "Succès Client",
                "de": "Customer Success",
                "ar": "نجاح العملاء",
                "ja": "カスタマーサクセス",
                "zh": "客户成功",
            },
            "emails": {
                "en": "Smart Inbox",
                "es": "Bandeja Inteligente",
                "fr": "Boîte Intelligente",
                "de": "Intelligenter Posteingang",
                "ar": "صندوق الوارد الذكي",
                "ja": "スマートインボックス",
                "zh": "智能收件箱",
            },
            "meetings": {
                "en": "AI Calendar",
                "es": "Calendario IA",
                "fr": "Calendrier IA",
                "de": "KI-Kalender",
                "ar": "تقويم الذكاء الاصطناعي",
                "ja": "AIカレンダー",
                "zh": "AI日历",
            },
            "analytics": {
                "en": "Analytics & ARR",
                "es": "Analítica y ARR",
                "fr": "Analytique & ARR",
                "de": "Analytik & ARR",
                "ar": "التحليلات والإيرادات",
                "ja": "アナリティクス＆ARR",
                "zh": "分析与ARR",
            },
            "reports": {
                "en": "AI Forecasting Reports",
                "es": "Informes de Pronóstico IA",
                "fr": "Rapports Prédictifs IA",
                "de": "KI-Prognoseberichte",
                "ar": "تقارير التنبؤ بالذكاء الاصطناعي",
                "ja": "AI予測レポート",
                "zh": "AI预测报告",
            },
            "agents": {
                "en": "Agent Fleet Console",
                "es": "Consola de Agentes",
                "fr": "Flotte d'Agents IA",
                "de": "Agenten-Flottenkonsole",
                "ar": "وحدة تحكم أسطول الوكلاء",
                "ja": "エージェントコンソール",
                "zh": "智能体控制台",
            },
            "languages": {
                "en": "Languages & Localization",
                "es": "Idiomas y Localización",
                "fr": "Langues & Localisation",
                "de": "Sprachen & Lokalisierung",
                "ar": "اللغات والترجمة",
                "ja": "言語とローカリゼーション",
                "zh": "语言与本地化",
            },
        },
        "dashboard": {
            "title": {
                "en": "AI-Powered Executive CRM Dashboard",
                "es": "Panel Ejecutivo de CRM Potenciado por IA",
                "fr": "Tableau de Bord Exécutif CRM Propulsé par l'IA",
                "de": "KI-gestütztes Executive CRM Dashboard",
                "ar": "لوحة تحكم إدارة علاقات العملاء التنفيذية بالذكاء الاصطناعي",
                "ja": "AI駆動型エグゼクティブCRMダッシュボード",
                "zh": "AI智能执行CRM仪表板",
            },
            "subtitle": {
                "en": "Real-time pipeline intelligence, multi-agent telemetry, and revenue monitoring",
                "es": "Inteligencia de ventas en tiempo real, telemetría multiagente y monitoreo de ingresos",
                "fr": "Intelligence en temps réel du pipeline, télémétrie multi-agents et suivi des revenus",
                "de": "Echtzeit-Pipeline-Intelligenz, Multi-Agenten-Telemetrie und Umsatzüberwachung",
                "ar": "ذكاء مسار المبيعات الفوري، وقياس أداء الوكلاء المتعددين، ومراقبة الإيرادات",
                "ja": "リアルタイムのパイプラインインテリジェンス、マルチエージェントテレメトリ、収益モニタリング",
                "zh": "实时流水线智能、多智能体遥测和收入监控",
            },
            "total_leads": {
                "en": "Total Monitored Leads",
                "es": "Total de Prospectos",
                "fr": "Total des Prospects",
                "de": "Gesamtzahl der Leads",
                "ar": "إجمالي العملاء المحتملين",
                "ja": "監視対象リード総数",
                "zh": "监控线索总数",
            },
            "active_pipeline": {
                "en": "Active Pipeline Value",
                "es": "Valor del Pipeline Activo",
                "fr": "Valeur du Pipeline Actif",
                "de": "Aktiver Pipeline-Wert",
                "ar": "قيمة الصفقات النشطة",
                "ja": "アクティブパイプライン総額",
                "zh": "活跃流水线总值",
            },
            "active_customers": {
                "en": "Active Accounts",
                "es": "Cuentas Activas",
                "fr": "Comptes Actifs",
                "de": "Aktive Konten",
                "ar": "الحسابات النشطة",
                "ja": "アクティブ顧客アカウント",
                "zh": "活跃客户账户",
            },
            "monthly_revenue": {
                "en": "Monthly Recurring Revenue (MRR)",
                "es": "Ingresos Recurrentes Mensuales (MRR)",
                "fr": "Revenu Récurrent Mensuel (MRR)",
                "de": "Monatlich wiederkehrender Umsatz (MRR)",
                "ar": "الإيرادات الشهرية المتكررة (MRR)",
                "ja": "月間経常収益 (MRR)",
                "zh": "月度经常性收入 (MRR)",
            },
            "run_fleet_audit": {
                "en": "Run AI Fleet Full Audit",
                "es": "Ejecutar Auditoría Completa de IA",
                "fr": "Lancer l'audit complet de la flotte IA",
                "de": "Vollständiges KI-Audit ausführen",
                "ar": "تشغيل التدقيق الكامل لأسطول الذكاء الاصطناعي",
                "ja": "AIフリート完全監査を実行",
                "zh": "执行AI舰队全面审计",
            },
            "agent_telemetry": {
                "en": "Autonomous Multi-Agent Activity & Telemetry",
                "es": "Actividad y Telemetría Multiagente Autónoma",
                "fr": "Activité & Télémétrie Autonome Multi-Agents",
                "de": "Autonome Multi-Agenten-Aktivität & Telemetrie",
                "ar": "نشاط وقياس أداء الوكلاء المستقلين",
                "ja": "自律型マルチエージェントのアクティビティとテレメトリ",
                "zh": "自主多智能体活动与遥测",
            },
        },
        "leads": {
            "title": {
                "en": "Prospect Qualification & Lead Scoring",
                "es": "Calificación de Prospectos y Puntuación IA",
                "fr": "Qualification des Prospects et Notation IA",
                "de": "Interessenten-Qualifizierung & Lead-Scoring",
                "ar": "تأهيل العملاء المحتملين وتقييم الذكاء الاصطناعي",
                "ja": "見込み客の適格性評価とAIスコアリング",
                "zh": "潜在客户资质与AI评分",
            },
            "subtitle": {
                "en": "Enrich leads and calculate predictive qualification scores with LeadQualificationAgent",
                "es": "Enriquezca prospectos y calcule puntuaciones predictivas con LeadQualificationAgent",
                "fr": "Enrichissez les prospects et calculez les scores avec LeadQualificationAgent",
                "de": "Leads anreichern und prädiktive Scores mit LeadQualificationAgent berechnen",
                "ar": "إثراء العملاء المحتملين وحساب درجات التأهيل التنبؤية بواسطة LeadQualificationAgent",
                "ja": "LeadQualificationAgentで見込み客情報を強化し予測スコアを算出",
                "zh": "使用LeadQualificationAgent丰富客户信息并计算预测评分",
            },
            "qualify_btn": {
                "en": "Qualify Selected Lead",
                "es": "Calificar Prospecto Seleccionado",
                "fr": "Qualifier le Prospect Sélectionné",
                "de": "Ausgewählten Lead qualifizieren",
                "ar": "تأهيل العميل المحتمل المحدد",
                "ja": "選択したリードを評価",
                "zh": "评估选中的线索",
            },
            "run_fleet_qualification": {
                "en": "Run AI Fleet Qualification",
                "es": "Ejecutar Calificación de Flota IA",
                "fr": "Lancer la qualification de la flotte",
                "de": "Flotten-Qualifizierung starten",
                "ar": "تشغيل تأهيل أسطول الذكاء الاصطناعي",
                "ja": "AIフリート適格性評価を実行",
                "zh": "执行AI舰队线索评估",
            },
            "lead_score": {
                "en": "AI Lead Score",
                "es": "Puntuación de Lead IA",
                "fr": "Score du Prospect IA",
                "de": "KI-Lead-Score",
                "ar": "درجة تأهيل الذكاء الاصطناعي",
                "ja": "AIリードスコア",
                "zh": "AI线索评分",
            },
            "qualification_status": {
                "en": "Qualification Status",
                "es": "Estado de Calificación",
                "fr": "Statut de Qualification",
                "de": "Qualifizierungsstatus",
                "ar": "حالة التأهيل",
                "ja": "評価ステータス",
                "zh": "评估状态",
            },
            "buying_signals": {
                "en": "Buying Signals",
                "es": "Señales de Compra",
                "fr": "Signaux d'Achat",
                "de": "Kaufsignale",
                "ar": "إشارات الشراء",
                "ja": "購入シグナル",
                "zh": "购买信号",
            },
        },
        "deals": {
            "title": {
                "en": "Deal Opportunities & Pipeline Velocity",
                "es": "Oportunidades y Velocidad de Ventas",
                "fr": "Opportunités et Vélocité des Ventes",
                "de": "Verkaufschancen & Pipeline-Geschwindigkeit",
                "ar": "فرص الصفقات وسرعة تدفق المبيعات",
                "ja": "商談案件とパイプライン速度",
                "zh": "商机与流水线流速",
            },
            "subtitle": {
                "en": "Automated risk analysis, stalled deal detection, and velocity tracking",
                "es": "Análisis automático de riesgos, detección de tratos estancados y velocidad",
                "fr": "Analyse automatique des risques et détection des affaires bloquées",
                "de": "Automatische Risikoanalyse und Erkennung blockierter Deals",
                "ar": "تحليل المخاطر التلقائي، واكتشاف الصفقات المتعثرة، ومتابعة السرعة",
                "ja": "自動リスク分析、停滞商談の検出、速度追跡",
                "zh": "自动风险分析、停滞交易检测与流速追踪",
            },
            "run_pipeline_audit": {
                "en": "Run AI Pipeline Health Audit",
                "es": "Auditar Salud del Pipeline con IA",
                "fr": "Auditer la santé du pipeline avec l'IA",
                "de": "KI-Pipeline-Gesundheitsaudit starten",
                "ar": "تدقيق صحة مسار المبيعات بالذكاء الاصطناعي",
                "ja": "AIパイプライン健全性監査を実行",
                "zh": "执行AI流水线健康度审计",
            },
            "pipeline_value": {
                "en": "Pipeline Value",
                "es": "Valor del Pipeline",
                "fr": "Valeur du Pipeline",
                "de": "Pipeline-Wert",
                "ar": "قيمة المسار",
                "ja": "パイプライン総額",
                "zh": "流水线总值",
            },
            "health_score": {
                "en": "Health Score",
                "es": "Puntuación de Salud",
                "fr": "Score de Santé",
                "de": "Gesundheits-Score",
                "ar": "درجة الصحة",
                "ja": "健全性スコア",
                "zh": "健康度评分",
            },
        },
        "customers": {
            "title": {
                "en": "Account Health & Churn Risk Intelligence",
                "es": "Salud de Cuenta y Riesgo de Cancelación",
                "fr": "Santé des Comptes & Risque d'Attrition",
                "de": "Kontogesundheit & Churn-Risikoanalyse",
                "ar": "صحة الحسابات وذكاء مخاطر الإلغاء",
                "ja": "顧客アカウントの健全性と解約リスク分析",
                "zh": "账户健康度与客户流失风险智能",
            },
            "subtitle": {
                "en": "Customer retention telemetry, health scores, and automated intervention playbooks",
                "es": "Telemetría de retención, puntuaciones de salud y manuales de intervención",
                "fr": "Télémétrie de rétention, scores de santé et stratégies d'intervention",
                "de": "Kundenbindungs-Telemetrie, Gesundheitswerte und Interventions-Playbooks",
                "ar": "قياس الاحتفاظ بالعملاء، ودرجات الصحة، وخطط التدخل التلقائية",
                "ja": "顧客維持テレメトリ、健全性スコア、自動介入プレイブック",
                "zh": "客户留存遥测、健康度评分和自动干预手册",
            },
            "run_churn_audit": {
                "en": "Run AI Fleet Retention Audit",
                "es": "Auditar Retención con Flota IA",
                "fr": "Lancer l'audit de rétention IA",
                "de": "KI-Kundenbindungs-Audit starten",
                "ar": "تشغيل تدقيق الاحتفاظ بأسطول الذكاء الاصطناعي",
                "ja": "AIフリート顧客維持監査を実行",
                "zh": "执行AI舰队客户留存审计",
            },
            "churn_risk": {
                "en": "Churn Risk",
                "es": "Riesgo de Cancelación",
                "fr": "Risque d'Attrition",
                "de": "Abwanderungsrisiko",
                "ar": "خطر الإلغاء",
                "ja": "解約リスク",
                "zh": "流失风险",
            },
            "mrr": {
                "en": "Monthly Revenue",
                "es": "Ingresos Mensuales",
                "fr": "Revenu Mensuel",
                "de": "Monatlicher Umsatz",
                "ar": "الإيرادات الشهرية",
                "ja": "月間収益",
                "zh": "月收入",
            },
            "arr": {
                "en": "Annual Run Rate",
                "es": "Tasa de Ejecución Anual",
                "fr": "Taux Annuel Récurrent",
                "de": "Jährliche Run-Rate",
                "ar": "معدل الإيرادات السنوية",
                "ja": "年間経常レート",
                "zh": "年度经常率",
            },
        },
        "emails": {
            "title": {
                "en": "Autonomous Email Intelligence & Sentiment",
                "es": "Inteligencia de Correo y Detección de Sentimientos",
                "fr": "Intelligence Email & Analyse des Sentiments",
                "de": "Autonome E-Mail-Intelligenz & Sentimentanalyse",
                "ar": "ذكاء البريد الإلكتروني المستقل وتحليل المشاعر",
                "ja": "自律型メールインテリジェンスと感情分析",
                "zh": "自主电子邮件智能与情感分析",
            },
            "subtitle": {
                "en": "Inbound triage, emotion detection, and automated AI response drafting",
                "es": "Triaje de entrada, detección de emociones y borradores automáticos de IA",
                "fr": "Triage entrant, détection d'émotions et rédaction de réponses IA",
                "de": "Eingangstriage, Emotionserkennung und automatische KI-Antworten",
                "ar": "فرز البريد الوارد، واكتشاف المشاعر، والصياغة التلقائية لردود الذكاء الاصطناعي",
                "ja": "受信トリアージ、感情検出、自動AI応答作成",
                "zh": "入站分类、情绪检测和自动AI回复起草",
            },
            "analyze_btn": {
                "en": "Analyze Inbound Email",
                "es": "Analizar Correo Entrante",
                "fr": "Analyser l'Email Entrant",
                "de": "Eingehende E-Mail analysieren",
                "ar": "تحليل البريد الإلكتروني الوارد",
                "ja": "受信メールを分析",
                "zh": "分析收到的邮件",
            },
            "sentiment": {
                "en": "Sentiment",
                "es": "Sentimiento",
                "fr": "Sentiment",
                "de": "Stimmung",
                "ar": "الشعور العام",
                "ja": "感情トーン",
                "zh": "情感倾向",
            },
            "draft_response": {
                "en": "AI Generated Response Draft",
                "es": "Borrador de Respuesta Generado por IA",
                "fr": "Brouillon de Réponse Généré par l'IA",
                "de": "KI-generierter Antwortentwurf",
                "ar": "مسودة الرد المنشأة بالذكاء الاصطناعي",
                "ja": "AI生成の返信ドラフト",
                "zh": "AI生成的回复草稿",
            },
            "send_reply": {
                "en": "Dispatch Verified Reply",
                "es": "Enviar Respuesta Verificada",
                "fr": "Envoyer la Réponse Vérifiée",
                "de": "Geprüfte Antwort senden",
                "ar": "إرسال الرد المؤكد",
                "ja": "確認済み返信を送信",
                "zh": "发送已验证回复",
            },
        },
        "meetings": {
            "title": {
                "en": "Autonomous Meeting Scheduling & Briefings",
                "es": "Programación Autónoma de Reuniones y Preparación",
                "fr": "Planification Autonome de Réunions & Briefings",
                "de": "Autonome Meeting-Planung & Briefings",
                "ar": "جدولة الاجتماعات المستقلة وملفات الإحاطة",
                "ja": "自律型ミーティング日程調整とブリーフィング",
                "zh": "自主会议安排与简报生成",
            },
            "subtitle": {
                "en": "Automated agenda builder, participant briefing generation, and CRM synchronization",
                "es": "Generador automático de agendas, briefings para participantes y sincronización",
                "fr": "Création automatique d'agendas, briefings des participants et synchronisation",
                "de": "Automatische Agenda-Erstellung, Teilnehmer-Briefings und CRM-Synchronisation",
                "ar": "منشئ جدول الأعمال التلقائي، وإعداد إحاطات المشاركين، والمزامنة مع النظام",
                "ja": "自動アジェンダ作成、参加者向け事前ブリーフィング、CRM連携",
                "zh": "自动议程生成器、参会人员简报与CRM同步",
            },
            "schedule_btn": {
                "en": "Schedule AI Briefing",
                "es": "Programar Reunión con IA",
                "fr": "Planifier la Réunion IA",
                "de": "KI-Meeting ansetzen",
                "ar": "جدولة اجتماع بالذكاء الاصطناعي",
                "ja": "AIミーティングを予約",
                "zh": "预约AI简报会议",
            },
            "agenda": {
                "en": "Executive Agenda",
                "es": "Agenda Ejecutiva",
                "fr": "Ordre du Jour Exécutif",
                "de": "Executive Agenda",
                "ar": "جدول الأعمال التنفيذي",
                "ja": "エグゼクティブアジェンダ",
                "zh": "执行议程",
            },
            "prep_materials": {
                "en": "AI Prep Materials",
                "es": "Materiales de Preparación IA",
                "fr": "Documents de Préparation IA",
                "de": "KI-Vorbereitungsunterlagen",
                "ar": "مواد التحضير بالذكاء الاصطناعي",
                "ja": "AI準備資料",
                "zh": "AI准备材料",
            },
        },
        "analytics": {
            "title": {
                "en": "Executive ARR & Predictive Analytics",
                "es": "Analítica Predictiva y ARR Ejecutivo",
                "fr": "Analytique Prédictive & ARR Exécutif",
                "de": "Prädiktive Analytik & Executive ARR",
                "ar": "التحليلات التنبؤية والإيرادات السنوية التنفيذية",
                "ja": "エグゼクティブARRと予測分析",
                "zh": "执行ARR与预测分析",
            },
            "subtitle": {
                "en": "Live multi-agent strategic forecasting and pipeline trajectory",
                "es": "Pronósticos estratégicos multiagente en vivo y trayectoria de ventas",
                "fr": "Prévisions stratégiques multi-agents en direct et trajectoire du pipeline",
                "de": "Live-Multi-Agenten-Prognosen und Pipeline-Entwicklung",
                "ar": "التنبؤ الاستراتيجي المباشر للوكلاء المتعددين ومسار المبيعات",
                "ja": "マルチエージェントによる戦略的予測とパイプライン推移",
                "zh": "实时多智能体战略预测与流水线轨迹",
            },
            "quarterly_forecast": {
                "en": "Projected 90-Day Revenue",
                "es": "Ingresos Proyectados a 90 Días",
                "fr": "Revenus Projetés à 90 Jours",
                "de": "Prognostizierter 90-Tage-Umsatz",
                "ar": "الإيرادات المتوقعة لـ 90 يوماً",
                "ja": "90日間の予測収益",
                "zh": "90天预测收入",
            },
            "run_analytics": {
                "en": "Generate Live AI Forecast",
                "es": "Generar Pronóstico IA en Vivo",
                "fr": "Générer Prévision IA en Direct",
                "de": "Live-KI-Prognose generieren",
                "ar": "إنشاء تنبؤ الذكاء الاصطناعي المباشر",
                "ja": "リアルタイムAI予測を生成",
                "zh": "生成实时AI预测",
            },
        },
        "reports": {
            "title": {
                "en": "AI Forecasting & Strategic Reports",
                "es": "Informes Estratégicos y Pronósticos IA",
                "fr": "Rapports Stratégiques & Prévisions IA",
                "de": "Strategische Berichte & KI-Prognosen",
                "ar": "تقارير التنبؤ بالذكاء الاصطناعي والتقارير الاستراتيجية",
                "ja": "AI予測と戦略レポート",
                "zh": "AI预测与战略报告",
            },
            "subtitle": {
                "en": "Automated executive intelligence and predictive forecasting generated by AnalyticsAgent",
                "es": "Inteligencia ejecutiva automatizada y pronósticos generados por AnalyticsAgent",
                "fr": "Intelligence décisionnelle automatisée et prévisions générées par AnalyticsAgent",
                "de": "Automatisierte Management-Intelligence und Prognosen von AnalyticsAgent",
                "ar": "معلومات تنفيذية آلية وتوقعات تنبؤية تم إنشاؤها بواسطة AnalyticsAgent",
                "ja": "AnalyticsAgentによって生成される自動化された経営分析と予測",
                "zh": "由AnalyticsAgent生成的自动化决策情报与预测",
            },
            "generate_btn": {
                "en": "Generate Fresh AI Forecast",
                "es": "Generar Nuevo Pronóstico IA",
                "fr": "Générer une Nouvelle Prévision IA",
                "de": "Neue KI-Prognose erstellen",
                "ar": "توليد توقعات ذكاء اصطناعي جديدة",
                "ja": "最新のAI予測を生成",
                "zh": "生成最新AI预测",
            },
            "view_report": {
                "en": "View Full Report",
                "es": "Ver Informe Completo",
                "fr": "Voir le Rapport Complet",
                "de": "Vollständigen Bericht anzeigen",
                "ar": "عرض التقرير الكامل",
                "ja": "詳細レポートを表示",
                "zh": "查看完整报告",
            },
            "export_json": {
                "en": "Export Report JSON",
                "es": "Exportar Informe JSON",
                "fr": "Exporter le Rapport en JSON",
                "de": "Bericht als JSON exportieren",
                "ar": "تصدير التقرير بتنسيق JSON",
                "ja": "レポートJSONをエクスポート",
                "zh": "导出报告JSON",
            },
        },
        "agents": {
            "title": {
                "en": "Autonomous Agent Fleet Control Center",
                "es": "Centro de Control de la Flota de Agentes Autónomos",
                "fr": "Centre de Contrôle de la Flotte d'Agents Autonomes",
                "de": "Kontrollzentrum der autonomen Agentenflotte",
                "ar": "مركز التحكم بأسطول الوكلاء المستقلين",
                "ja": "自律型エージェントフリート管制センター",
                "zh": "自主智能体舰队控制中心",
            },
            "subtitle": {
                "en": "Manage, trigger, and inspect multi-agent AI execution logs and event bus telemetry",
                "es": "Administre, active e inspeccione registros de ejecución de IA y telemetría de eventos",
                "fr": "Gérez, déclenchez et inspectez les journaux d'exécution IA et la télémétrie",
                "de": "Verwalten, starten und inspizieren Sie KI-Ausführungsprotokolle und Telemetrie",
                "ar": "إدارة وتشغيل وفحص سجلات تنفيذ الذكاء الاصطناعي وقياس أداء ناقل الأحداث",
                "ja": "マルチエージェントAIの実行ログとイベントバステレメトリの管理・監視",
                "zh": "管理、触发和检查多智能体AI执行日志与事件总线遥测",
            },
            "trigger_run": {
                "en": "Trigger Run",
                "es": "Ejecutar Tarea",
                "fr": "Déclencher l'Exécution",
                "de": "Ausführung starten",
                "ar": "بدء التشغيل",
                "ja": "実行をトリガー",
                "zh": "触发运行",
            },
            "event_console": {
                "en": "Live Event Bus & Telemetry Console",
                "es": "Consola en Vivo del Bus de Eventos y Telemetría",
                "fr": "Console en Direct du Bus d'Événements et Télémétrie",
                "de": "Live-Event-Bus & Telemetrie-Konsole",
                "ar": "وحدة التحكم الحية لناقل الأحداث والقياس عن بعد",
                "ja": "ライブイベントバス＆テレメトリコンソール",
                "zh": "实时事件总线与遥测控制台",
            },
            "clear_events": {
                "en": "Clear Event Logs",
                "es": "Borrar Registros de Eventos",
                "fr": "Effacer les Journaux d'Événements",
                "de": "Ereignisprotokolle löschen",
                "ar": "مسح سجلات الأحداث",
                "ja": "イベントログをクリア",
                "zh": "清除事件日志",
            },
        },
        "languages": {
            "title": {
                "en": "Multi-Language & Localization Console",
                "es": "Consola de Idiomas y Localización",
                "fr": "Console Multi-Langues & Localisation",
                "de": "Mehrsprachigkeit & Lokalisierungskonsole",
                "ar": "لوحة تحكم تعدد اللغات والترجمة",
                "ja": "多言語＆ローカリゼーション管理",
                "zh": "多语言与本地化控制台",
            },
            "subtitle": {
                "en": "Manage supported languages, customize translation strings, and configure locale formats",
                "es": "Administre idiomas admitidos, personalice traducciones y configure formatos",
                "fr": "Gérez les langues supportées, personnalisez les traductions et configurez les formats",
                "de": "Unterstützte Sprachen verwalten, Übersetzungen anpassen und Formate konfigurieren",
                "ar": "إدارة اللغات المدعومة، وتخصيص نصوص الترجمة، وتكوين التنسيقات المحلية",
                "ja": "サポート言語の管理、翻訳テキストのカスタマイズ、ロケール形式の設定",
                "zh": "管理支持的语言、自定义翻译文本并配置区域格式",
            },
            "active_language": {
                "en": "Active Language",
                "es": "Idioma Activo",
                "fr": "Langue Active",
                "de": "Aktive Sprache",
                "ar": "اللغة النشطة",
                "ja": "現在の言語",
                "zh": "当前语言",
            },
            "direction": {
                "en": "Text Direction",
                "es": "Dirección del Texto",
                "fr": "Sens du Texte",
                "de": "Textrichtung",
                "ar": "اتجاه النص",
                "ja": "テキスト方向",
                "zh": "文本方向",
            },
            "set_default": {
                "en": "Set as Default",
                "es": "Establecer como Predeterminado",
                "fr": "Définir par Défaut",
                "de": "Als Standard festlegen",
                "ar": "تعيين كافتراضي",
                "ja": "デフォルトに設定",
                "zh": "设为默认",
            },
            "enable_language": {
                "en": "Enable",
                "es": "Habilitar",
                "fr": "Activer",
                "de": "Aktivieren",
                "ar": "تفعيل",
                "ja": "有効化",
                "zh": "启用",
            },
            "disable_language": {
                "en": "Disable",
                "es": "Deshabilitar",
                "fr": "Désactiver",
                "de": "Deaktivieren",
                "ar": "تعطيل",
                "ja": "無効化",
                "zh": "禁用",
            },
            "add_language": {
                "en": "Add Language",
                "es": "Añadir Idioma",
                "fr": "Ajouter une Langue",
                "de": "Sprache hinzufügen",
                "ar": "إضافة لغة",
                "ja": "言語を追加",
                "zh": "添加语言",
            },
            "edit_translations": {
                "en": "Edit Translations",
                "es": "Editar Traducciones",
                "fr": "Modifier les Traductions",
                "de": "Übersetzungen bearbeiten",
                "ar": "تعديل الترجمات",
                "ja": "翻訳を編集",
                "zh": "编辑翻译",
            },
            "import_translations": {
                "en": "Import JSON",
                "es": "Importar JSON",
                "fr": "Importer JSON",
                "de": "JSON importieren",
                "ar": "استيراد JSON",
                "ja": "JSONインポート",
                "zh": "导入JSON",
            },
            "export_translations": {
                "en": "Export JSON",
                "es": "Exportar JSON",
                "fr": "Exporter JSON",
                "de": "JSON exportieren",
                "ar": "تصدير JSON",
                "ja": "JSONエクスポート",
                "zh": "导出JSON",
            },
            "filter_namespace": {
                "en": "Filter by Namespace",
                "es": "Filtrar por Espacio de Nombres",
                "fr": "Filtrer par Espace de Noms",
                "de": "Nach Namespace filtern",
                "ar": "تصفية حسب نطاق الأسماء",
                "ja": "名前空間でフィルター",
                "zh": "按命名空间筛选",
            },
            "key": {
                "en": "Translation Key",
                "es": "Clave de Traducción",
                "fr": "Clé de Traduction",
                "de": "Übersetzungsschlüssel",
                "ar": "مفتاح الترجمة",
                "ja": "翻訳キー",
                "zh": "翻译键",
            },
            "value": {
                "en": "Translated Value",
                "es": "Valor Traducido",
                "fr": "Valeur Traduite",
                "de": "Übersetzter Wert",
                "ar": "القيمة المترجمة",
                "ja": "翻訳値",
                "zh": "翻译值",
            },
            "fallback_preview": {
                "en": "Fallback (Default English)",
                "es": "Respaldo (Inglés Predeterminado)",
                "fr": "Repli (Anglais par Défaut)",
                "de": "Fallback (Standard-Englisch)",
                "ar": "الاحتياطي (الإنجليزية الافتراضية)",
                "ja": "フォールバック (デフォルト英語)",
                "zh": "后备（默认英语）",
            },
        },
    }

    # 3. Insert translations in batch
    translation_objects = []
    for ns, keys_dict in master_translations.items():
        for k, lang_vals in keys_dict.items():
            for l_code, val in lang_vals.items():
                translation_objects.append(
                    Translation(
                        id=uuid.uuid4(),
                        language_code=l_code,
                        namespace=ns,
                        key=k,
                        value=val,
                        is_auto_translated=False,
                    )
                )

    db.bulk_save_objects(translation_objects)
    db.commit()
    print(
        f"Seeded {len(languages_data)} languages and {len(translation_objects)} localized dictionary keys successfully."
    )


def seed_custom_agents(db: Session):
    """Seed sample production-ready custom agents."""
    from database.models import CustomAgent

    if db.query(CustomAgent).count() > 0:
        return

    print("Seeding sample Custom Agents studio blueprints...")

    agents = [
        CustomAgent(
            id=uuid.uuid4(),
            name="VIP Customer Onboarding Concierge",
            description="Autonomous agent that prepares high-touch onboarding plans and welcome emails for Tier-1 Enterprise customers.",
            icon="Crown",
            trigger_type="event",
            trigger_config={"event_name": "customer.tier1_created"},
            model_provider="smart-fallback",
            model_name="smart-fallback",
            temperature=0.2,
            system_prompt="You are the VIP Onboarding Concierge. Your mission is to analyze enterprise customer requirements, synthesize key milestones, and draft white-glove onboarding briefings.\n\nContext:\nCustomer: {{customer.name}}\nMRR: ${{customer.mrr}}\nPlan: {{customer.plan}}",
            tools_enabled=["query_crm", "send_email", "schedule_meeting"],
            is_active=True,
            execution_count=12,
        ),
        CustomAgent(
            id=uuid.uuid4(),
            name="Contract Legal & Liability Sentinel",
            description="Scans deal notes and meeting transcripts to flag non-standard liability clauses, indemnification limits, and payment delays.",
            icon="ShieldAlert",
            trigger_type="event",
            trigger_config={"event_name": "deal.stage_changed"},
            model_provider="smart-fallback",
            model_name="smart-fallback",
            temperature=0.1,
            system_prompt="You are the Legal & Compliance Sentinel. Scan contract parameters for risk factors, liability caps, and custom billing terms.\n\nDeal: {{deal.name}}\nValue: ${{deal.value}}\nStage: {{deal.stage}}",
            tools_enabled=["query_crm", "generate_summary", "update_deal"],
            is_active=True,
            execution_count=28,
        ),
        CustomAgent(
            id=uuid.uuid4(),
            name="Competitor Price Match Intelligence",
            description="Detects competitor mentions in inbound prospect emails and calculates customized discount options within authorized margins.",
            icon="Zap",
            trigger_type="event",
            trigger_config={"event_name": "email.competitor_detected"},
            model_provider="smart-fallback",
            model_name="smart-fallback",
            temperature=0.3,
            system_prompt="You are the Competitive Intelligence Agent. Identify competitor pricing objections and provide targeted counter-positioning points.\n\nProspect Email: {{lead.email}}\nSubject: {{email.subject}}",
            tools_enabled=["query_crm", "send_email", "webhook_call"],
            is_active=True,
            execution_count=19,
        ),
    ]

    db.add_all(agents)
    db.commit()
    print("Seeded 3 Custom Agents studio blueprints successfully.")


def seed_voice_and_whatsapp(db: Session):
    """Seed sample voice calls and WhatsApp conversation threads."""
    from database.models import (
        VoiceCall,
        VoiceCallTranscript,
        WhatsAppConversation,
        WhatsAppMessage,
    )

    if db.query(VoiceCall).count() > 0:
        return

    print("Seeding Voice AI calls and WhatsApp conversations...")

    # 1. Voice Calls & Transcripts
    call1 = VoiceCall(
        id=uuid.uuid4(),
        contact_name="Marcus Vance",
        phone_number="+1 (415) 890-2144",
        direction="outbound",
        status="completed",
        duration_seconds=342,
        sentiment="positive",
        buyer_intent_score=88,
        summary="Marcus is interested in replacing their legacy Gong setup with our autonomous AI agent CRM. Primary concern was migration timeline and custom SLA terms.",
        action_items=[
            "Send SOC2 Type II compliance pack to Marcus",
            "Book technical deep-dive with Solutions Architect for Thursday",
        ],
        objections_handled=[
            "Data Security & Isolation",
            "Gong Replacement Feature Parity",
        ],
    )
    db.add(call1)
    db.commit()
    db.refresh(call1)

    t1 = VoiceCallTranscript(
        id=uuid.uuid4(),
        call_id=call1.id,
        speaker="rep",
        text="Hi Marcus, thanks for joining. I know you were exploring ways to automate your SDR lead qualification workflow.",
        timestamp_seconds=2.0,
        sentiment="neutral",
    )
    t2 = VoiceCallTranscript(
        id=uuid.uuid4(),
        call_id=call1.id,
        speaker="prospect",
        text="Yes, right now our reps spend 4 hours a day manually researching contacts. Is your platform compatible with Postgres databases?",
        timestamp_seconds=14.5,
        sentiment="neutral",
        coaching_tip="💡 Highlight native PostgreSQL ORM integration and zero data-copy architecture.",
    )
    t3 = VoiceCallTranscript(
        id=uuid.uuid4(),
        call_id=call1.id,
        speaker="prospect",
        text="That sounds really great. What kind of ROI have other SaaS companies seen in the first quarter?",
        timestamp_seconds=48.0,
        sentiment="positive",
        coaching_tip="💡 State benchmark: 3.4x faster pipeline velocity and 40% reduction in churn risk.",
    )
    db.add_all([t1, t2, t3])

    # 2. WhatsApp Conversations & Messages
    conv1 = WhatsAppConversation(
        id=uuid.uuid4(),
        contact_name="Elena Rostova",
        phone_number="+44 20 7946 0912",
        status="active",
        unread_count=1,
        ai_auto_pilot=True,
        tags=["enterprise", "inbound_web"],
    )
    db.add(conv1)
    db.commit()
    db.refresh(conv1)

    m1 = WhatsAppMessage(
        id=uuid.uuid4(),
        conversation_id=conv1.id,
        sender_type="prospect",
        text="Hi! We saw your autonomous multi-agent CRM demo on LinkedIn. How does the pricing work for a 25-rep sales team?",
        intent="pricing_inquiry",
        status="read",
    )
    m2 = WhatsAppMessage(
        id=uuid.uuid4(),
        conversation_id=conv1.id,
        sender_type="bot",
        text="Hi Elena! 👋 Thanks for reaching out. For a 25-rep team, our Enterprise Fleet tier is $49/seat/mo, which includes all 6 autonomous agents and custom workflow triggers. Would you like a 15-min live walkthrough?",
        intent="pricing_inquiry",
        status="delivered",
    )
    m3 = WhatsAppMessage(
        id=uuid.uuid4(),
        conversation_id=conv1.id,
        sender_type="prospect",
        text="Yes please! Does Thursday at 3:00 PM GMT work for your team?",
        intent="meeting_request",
        status="delivered",
    )
    db.add_all([m1, m2, m3])
    db.commit()
    print("Seeded Voice Calls and WhatsApp Conversations successfully.")
