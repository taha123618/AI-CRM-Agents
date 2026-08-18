"""SQLAlchemy ORM Models for AI CRM"""

from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    Date,
    Text,
    ForeignKey,
    CheckConstraint,
    UniqueConstraint,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func
import uuid

Base = declarative_base()


class Organization(Base):
    """Multi-tenant Workspace Organization."""
    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    domain = Column(String(255), nullable=True)
    plan_tier = Column(String(50), default="enterprise")  # 'starter', 'growth', 'enterprise'
    is_active = Column(Boolean, default=True)
    settings = Column(JSONB, default=dict)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Company(Base):
    __tablename__ = "companies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    domain = Column(String(255), unique=True)
    industry = Column(String(100))
    company_size = Column(String(50))
    revenue_range = Column(String(50))
    location = Column(String(255))
    timezone = Column(String(100))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    enrichment_data = Column(JSONB)
    additional_metadata = Column("metadata", JSONB)

    # Relationships
    contacts = relationship("Contact", back_populates="company")
    deals = relationship("Deal", back_populates="company")
    customers = relationship("Customer", back_populates="company")


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"))
    email = Column(String(255), unique=True, nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    job_title = Column(String(255))
    job_level = Column(String(50))
    phone = Column(String(50))
    linkedin_url = Column(String(500))

    # Lead Qualification
    lead_score = Column(Integer, default=0)
    lead_status = Column(String(50), default="new")
    lead_source = Column(String(100))

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    last_contact_at = Column(DateTime)

    # Enrichment
    enrichment_data = Column(JSONB)
    additional_metadata = Column("metadata", JSONB)

    # Relationships
    company = relationship("Company", back_populates="contacts")
    deals = relationship("Deal", back_populates="contact")
    emails = relationship("Email", back_populates="contact")
    activities = relationship("Activity", back_populates="contact")

    __table_args__ = (
        CheckConstraint(
            "lead_score >= 0 AND lead_score <= 100", name="check_lead_score"
        ),
    )


class Deal(Base):
    __tablename__ = "deals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"))
    contact_id = Column(UUID(as_uuid=True), ForeignKey("contacts.id"))

    # Deal Information
    name = Column(String(255), nullable=False)
    value = Column(Float, default=0)
    stage = Column(String(50), nullable=False)
    probability = Column(Integer, default=50)

    # Health & Risk
    health_score = Column(Integer, default=50)
    is_stalled = Column(Boolean, default=False)
    risk_factors = Column(JSONB)

    # Dates
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    stage_changed_at = Column(DateTime, server_default=func.now())
    expected_close_date = Column(Date)
    actual_close_date = Column(Date)

    # Assignment
    owner_id = Column(UUID(as_uuid=True))

    # Additional
    notes = Column(Text)
    additional_metadata = Column("metadata", JSONB)

    # Relationships
    company = relationship("Company", back_populates="deals")
    contact = relationship("Contact", back_populates="deals")
    meetings = relationship("Meeting", back_populates="deal")
    activities = relationship("Activity", back_populates="deal")

    __table_args__ = (
        CheckConstraint(
            "probability >= 0 AND probability <= 100", name="check_probability"
        ),
        CheckConstraint(
            "health_score >= 0 AND health_score <= 100", name="check_health_score"
        ),
    )


class Customer(Base):
    __tablename__ = "customers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"))

    # Subscription
    plan = Column(String(100))
    mrr = Column(Float, default=0)
    arr = Column(Float, default=0)
    contract_start_date = Column(Date)
    contract_end_date = Column(Date)

    # Health Metrics
    health_score = Column(Integer, default=50)
    churn_risk = Column(String(50), default="low")
    churn_probability = Column(Integer, default=0)

    # Engagement
    last_login_at = Column(DateTime)
    logins_per_week = Column(Integer, default=0)
    features_used = Column(Integer, default=0)
    total_features = Column(Integer, default=10)
    license_usage_percent = Column(Integer, default=0)
    daily_active_users = Column(Integer, default=0)

    # Support
    support_tickets_30d = Column(Integer, default=0)
    critical_tickets_open = Column(Integer, default=0)
    avg_resolution_hours = Column(Integer, default=24)
    csat_score = Column(Float, default=0)
    nps_score = Column(Integer, default=0)

    # Payments
    last_payment_at = Column(DateTime)
    payment_delays = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    additional_metadata = Column("metadata", JSONB)

    # Relationships
    company = relationship("Company", back_populates="customers")
    interventions = relationship(
        "CustomerIntervention",
        back_populates="customer",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        CheckConstraint(
            "health_score >= 0 AND health_score <= 100",
            name="check_customer_health_score",
        ),
    )


class Email(Base):
    __tablename__ = "emails"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contact_id = Column(UUID(as_uuid=True), ForeignKey("contacts.id"))

    # Email Data
    from_email = Column(String(255))
    to_email = Column(String(255))
    subject = Column(Text)
    body = Column(Text)
    direction = Column(String(20))

    # AI Analysis
    sentiment = Column(String(50))
    sentiment_score = Column(Integer)
    emotion = Column(String(50))
    category = Column(String(100))
    priority = Column(String(20))

    # Response
    draft_response = Column(Text)
    response_sent = Column(Boolean, default=False)

    # Timestamps
    received_at = Column(DateTime)
    sent_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())

    additional_metadata = Column("metadata", JSONB)

    # Relationships
    contact = relationship("Contact", back_populates="emails")


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    deal_id = Column(UUID(as_uuid=True), ForeignKey("deals.id"))

    # Meeting Info
    title = Column(String(255), nullable=False)
    meeting_type = Column(String(50))
    scheduled_at = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=30)
    location = Column(String(500))

    # Attendees
    attendees = Column(JSONB)

    # Preparation
    agenda = Column(JSONB)
    prep_materials = Column(JSONB)
    context = Column(JSONB)

    # Follow-up
    notes = Column(Text)
    followup_tasks = Column(JSONB)
    recording_url = Column(String(500))

    # Status
    status = Column(String(50), default="scheduled")

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    additional_metadata = Column("metadata", JSONB)

    # Relationships
    deal = relationship("Deal", back_populates="meetings")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contact_id = Column(UUID(as_uuid=True), ForeignKey("contacts.id"))
    deal_id = Column(UUID(as_uuid=True), ForeignKey("deals.id"))

    # Activity Info
    activity_type = Column(String(100))
    subject = Column(String(255))
    description = Column(Text)
    outcome = Column(String(100))

    # Assignment
    assigned_to = Column(UUID(as_uuid=True))
    completed = Column(Boolean, default=False)

    # Dates
    due_date = Column(DateTime)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())

    additional_metadata = Column("metadata", JSONB)

    # Relationships
    contact = relationship("Contact", back_populates="activities")
    deal = relationship("Deal", back_populates="activities")


class AgentLog(Base):
    __tablename__ = "agent_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_name = Column(String(100), nullable=False)
    activity_type = Column(String(100))
    details = Column(JSONB)
    created_at = Column(DateTime, server_default=func.now())


class AgentEvent(Base):
    __tablename__ = "agent_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = Column(String(100), nullable=False)
    source_agent = Column(String(100))
    target_agent = Column(String(100))
    payload = Column(JSONB)
    processed = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())


class MetricsDaily(Base):
    __tablename__ = "metrics_daily"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    metric_date = Column(Date, nullable=False, unique=True)

    # Sales Metrics
    leads_total = Column(Integer, default=0)
    leads_qualified = Column(Integer, default=0)
    deals_created = Column(Integer, default=0)
    deals_won = Column(Integer, default=0)
    deals_lost = Column(Integer, default=0)
    revenue_won = Column(Float, default=0)

    # Customer Metrics
    customers_total = Column(Integer, default=0)
    customers_churned = Column(Integer, default=0)
    mrr_total = Column(Float, default=0)
    arr_total = Column(Float, default=0)

    # Pipeline Metrics
    pipeline_value = Column(Float, default=0)
    avg_deal_size = Column(Float, default=0)
    avg_sales_cycle_days = Column(Integer, default=0)

    # Success Metrics
    avg_health_score = Column(Integer, default=0)
    avg_nps_score = Column(Integer, default=0)
    avg_csat_score = Column(Float, default=0)

    created_at = Column(DateTime, server_default=func.now())


class Language(Base):
    __tablename__ = "languages"

    code = Column(
        String(10), primary_key=True
    )  # e.g., 'en', 'es', 'fr', 'de', 'ar', 'ja', 'zh'
    name = Column(
        String(100), nullable=False
    )  # Native name, e.g., 'Español', 'العربية'
    english_name = Column(
        String(100), nullable=False
    )  # English name, e.g., 'Spanish', 'Arabic'
    direction = Column(String(10), default="ltr", nullable=False)  # 'ltr' or 'rtl'
    is_default = Column(Boolean, default=False, nullable=False)
    is_enabled = Column(Boolean, default=True, nullable=False)
    flag_emoji = Column(String(20), default="🌐")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    translations = relationship(
        "Translation",
        back_populates="language",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        CheckConstraint("direction IN ('ltr', 'rtl')", name="check_language_direction"),
    )


class Translation(Base):
    __tablename__ = "translations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    language_code = Column(
        String(10),
        ForeignKey("languages.code", ondelete="CASCADE"),
        nullable=False,
    )
    namespace = Column(String(50), nullable=False, default="common")
    key = Column(String(150), nullable=False)
    value = Column(Text, nullable=False)
    is_auto_translated = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    language = relationship("Language", back_populates="translations")

    __table_args__ = (
        UniqueConstraint(
            "language_code", "namespace", "key", name="uq_lang_namespace_key"
        ),
        Index("idx_translations_lang_ns", "language_code", "namespace"),
        Index("idx_translations_key", "key"),
    )


class TranslationAudit(Base):
    __tablename__ = "translation_audits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    language_code = Column(String(10), nullable=False)
    namespace = Column(String(50), nullable=False)
    key = Column(String(150), nullable=False)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    changed_by = Column(String(100), default="system")
    action = Column(
        String(20), nullable=False
    )  # 'create', 'update', 'delete', 'import'
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (
        Index("idx_audit_lang_ns", "language_code", "namespace"),
        Index("idx_audit_created_at", "created_at"),
    )


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(100), unique=True, nullable=False, index=True)
    preferred_language_code = Column(String(10), default="en", nullable=False)
    theme = Column(String(20), default="dark")
    date_format = Column(String(30), default="YYYY-MM-DD")
    timezone = Column(String(50), default="UTC")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class CustomAgent(Base):
    __tablename__ = "custom_agents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(50), default="Bot")
    trigger_type = Column(
        String(50), default="manual", nullable=False
    )  # 'manual', 'event', 'webhook', 'schedule'
    trigger_config = Column(
        JSONB, default=dict
    )  # e.g. {"event_name": "lead.created"} or {"cron": "0 9 * * *"}
    model_provider = Column(String(50), default="smart-fallback")
    model_name = Column(String(100), default="smart-fallback")
    temperature = Column(Float, default=0.3)
    system_prompt = Column(Text, nullable=False)
    tools_enabled = Column(
        JSONB, default=list
    )  # list of tool keys, e.g. ["query_crm", "update_deal", "send_email", "schedule_meeting"]
    is_active = Column(Boolean, default=True)
    execution_count = Column(Integer, default=0)
    last_run_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    executions = relationship(
        "CustomAgentExecution",
        back_populates="agent",
        cascade="all, delete-orphan",
        order_by="desc(CustomAgentExecution.created_at)",
    )


class CustomAgentExecution(Base):
    __tablename__ = "custom_agent_executions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_id = Column(
        UUID(as_uuid=True),
        ForeignKey("custom_agents.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status = Column(String(50), default="success")  # 'success', 'failed', 'running'
    trigger_event = Column(String(100), default="manual")
    input_payload = Column(JSONB, default=dict)
    output_payload = Column(JSONB, default=dict)
    thought_trace = Column(JSONB, default=list)
    tool_calls = Column(JSONB, default=list)
    duration_ms = Column(Integer, default=0)
    tokens_used = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now(), index=True)

    # Relationships
    agent = relationship("CustomAgent", back_populates="executions")


class VoiceCall(Base):
    __tablename__ = "voice_calls"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contact_name = Column(String(150), nullable=False)
    phone_number = Column(String(50), nullable=False)
    direction = Column(String(20), default="outbound")  # outbound, inbound
    status = Column(
        String(50), default="completed"
    )  # queued, in-progress, completed, missed
    duration_seconds = Column(Integer, default=0)
    sentiment = Column(String(20), default="positive")  # positive, neutral, negative
    buyer_intent_score = Column(Integer, default=75)  # 0 to 100
    summary = Column(Text, nullable=True)
    recording_url = Column(String(255), nullable=True)
    action_items = Column(JSONB, default=list)  # list of strings
    objections_handled = Column(JSONB, default=list)  # battle-cards triggered
    metadata_info = Column(JSONB, default=dict)
    created_at = Column(DateTime, server_default=func.now(), index=True)

    # Relationships
    transcripts = relationship(
        "VoiceCallTranscript",
        back_populates="call",
        cascade="all, delete-orphan",
        order_by="VoiceCallTranscript.timestamp_seconds",
    )


class VoiceCallTranscript(Base):
    __tablename__ = "voice_call_transcripts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    call_id = Column(
        UUID(as_uuid=True),
        ForeignKey("voice_calls.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    speaker = Column(String(50), nullable=False)  # 'rep', 'prospect', 'ai_assistant'
    text = Column(Text, nullable=False)
    timestamp_seconds = Column(Float, default=0.0)
    sentiment = Column(String(20), default="neutral")
    coaching_tip = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    call = relationship("VoiceCall", back_populates="transcripts")


class WhatsAppConversation(Base):
    __tablename__ = "whatsapp_conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contact_name = Column(String(150), nullable=False)
    phone_number = Column(String(50), unique=True, nullable=False, index=True)
    status = Column(String(50), default="active")  # active, archived, handed_off
    unread_count = Column(Integer, default=0)
    ai_auto_pilot = Column(Boolean, default=True)  # whether agent auto-replies
    lead_id = Column(UUID(as_uuid=True), nullable=True)
    tags = Column(JSONB, default=list)
    last_message_at = Column(DateTime, server_default=func.now(), index=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    messages = relationship(
        "WhatsAppMessage",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="WhatsAppMessage.created_at",
    )


class WhatsAppMessage(Base):
    __tablename__ = "whatsapp_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(
        UUID(as_uuid=True),
        ForeignKey("whatsapp_conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    sender_type = Column(String(20), default="prospect")  # 'prospect', 'agent', 'bot'
    text = Column(Text, nullable=False)
    media_url = Column(String(255), nullable=True)
    media_type = Column(String(50), nullable=True)  # image, document, audio
    status = Column(String(20), default="delivered")  # sent, delivered, read
    intent = Column(String(50), nullable=True)  # pricing_query, meeting_request
    confidence = Column(Float, default=0.9)
    created_at = Column(DateTime, server_default=func.now(), index=True)

    # Relationships
    conversation = relationship("WhatsAppConversation", back_populates="messages")


class ForecastSimulation(Base):
    __tablename__ = "forecast_simulations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(150), nullable=False)
    target_quarter = Column(String(20), default="Q3 2026")
    pipeline_total_value = Column(Float, default=0.0)
    simulated_iterations = Column(Integer, default=1000)
    p10_conservative = Column(Float, default=0.0)
    p50_expected = Column(Float, default=0.0)
    p90_optimistic = Column(Float, default=0.0)
    stage_probabilities = Column(JSONB, default=dict)
    deal_slippage_rate = Column(Float, default=0.15)
    simulation_results = Column(
        JSONB, default=dict
    )  # distribution curve points, histogram
    created_at = Column(DateTime, server_default=func.now(), index=True)


class CustomerIntervention(Base):
    __tablename__ = "customer_interventions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(
        UUID(as_uuid=True),
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    customer_name = Column(String(200), nullable=True)
    intervention_type = Column(String(100), nullable=False)
    status = Column(String(50), default="active")  # active, completed, cancelled
    target_agent = Column(String(100), default="customer_success_agent")
    triggered_reason = Column(Text, nullable=True)
    action_summary = Column(Text, nullable=True)
    ai_playbook = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), index=True)

    # Relationships
    customer = relationship("Customer", back_populates="interventions")


class OutreachSequence(Base):
    __tablename__ = "outreach_sequences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    status = Column(String(50), default="active")  # active, paused, draft
    channel = Column(String(50), default="multichannel")
    target_persona = Column(String(200), nullable=False)
    enrolled_count = Column(Integer, default=0)
    replied_count = Column(Integer, default=0)
    conversion_rate_pct = Column(Float, default=0.0)
    steps = Column(JSONB, default=list)
    created_at = Column(DateTime, server_default=func.now(), index=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    enrollments = relationship(
        "SequenceEnrollment",
        back_populates="sequence",
        cascade="all, delete-orphan",
    )


class SequenceEnrollment(Base):
    __tablename__ = "sequence_enrollments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sequence_id = Column(
        UUID(as_uuid=True),
        ForeignKey("outreach_sequences.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    contact_id = Column(
        UUID(as_uuid=True),
        ForeignKey("contacts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status = Column(String(50), default="active")  # active, completed, paused
    current_step = Column(Integer, default=1)
    enrolled_at = Column(DateTime, server_default=func.now(), index=True)

    # Relationships
    sequence = relationship("OutreachSequence", back_populates="enrollments")
    contact = relationship("Contact")


class AutomationRule(Base):
    __tablename__ = "automation_rules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    trigger_event = Column(String(100), nullable=False)
    trigger_threshold = Column(String(100), nullable=False)
    action_agent = Column(String(100), nullable=False)
    action_type = Column(String(100), nullable=False)
    status = Column(String(50), default="active")  # active, paused
    executions_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now(), index=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entity_type = Column(String(100), nullable=False, index=True)
    entity_id = Column(String(100), nullable=False, index=True)
    action = Column(String(100), nullable=False, index=True)
    actor = Column(String(100), default="system", index=True)
    user_id = Column(String(100), nullable=True, index=True)
    details = Column(JSONB, default=dict)
    payload_diff = Column(JSONB, default=dict)  # {"before": {...}, "after": {...}, "changes": [...]}
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), index=True)


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=False)
    role = Column(String(50), default="sales", nullable=False, index=True)  # 'admin', 'sales', 'support', 'auditor'
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)
    login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime, nullable=True)
    oauth_provider = Column(String(50), nullable=True)  # 'google', 'microsoft', or None
    oauth_id = Column(String(255), nullable=True)
    permissions = Column(JSONB, default=list)  # list of permission strings e.g. ["leads:read", "deals:write"]
    last_login_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), index=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    organization = relationship("Organization")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = Column(String(255), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime, nullable=False, index=True)
    revoked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), index=True)


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = Column(String(255), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime, nullable=False, index=True)
    used = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), index=True)


class EmailVerificationToken(Base):
    __tablename__ = "email_verification_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = Column(String(255), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime, nullable=False, index=True)
    used = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), index=True)


class LoginAttempt(Base):
    __tablename__ = "login_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), nullable=False, index=True)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    successful = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), index=True)


class WebhookEndpoint(Base):
    __tablename__ = "webhook_endpoints"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    url = Column(String(500), nullable=False)
    description = Column(String(255), nullable=True)
    secret = Column(String(255), nullable=False)
    events = Column(JSONB, default=list)  # list of event strings, e.g. ["lead.created", "deal.won"]
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), index=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class WebhookDelivery(Base):
    __tablename__ = "webhook_deliveries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    webhook_id = Column(UUID(as_uuid=True), ForeignKey("webhook_endpoints.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(100), nullable=False, index=True)
    payload = Column(JSONB, default=dict)
    response_status = Column(Integer, nullable=True)
    response_body = Column(Text, nullable=True)
    success = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), index=True)


class CustomFieldDefinition(Base):
    """Dynamic User-Defined Metadata Field for CRM entities."""
    __tablename__ = "custom_field_definitions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True, index=True)
    entity_type = Column(String(50), nullable=False, index=True)  # 'contact', 'deal', 'customer', 'company'
    name = Column(String(100), nullable=False)
    field_key = Column(String(100), nullable=False, index=True)
    field_type = Column(String(50), default="text", nullable=False)  # 'text', 'number', 'select', 'boolean', 'date', 'currency'
    options = Column(JSONB, default=list)  # for select dropdown options e.g. ["Tier 1", "Tier 2"]
    is_required = Column(Boolean, default=False)
    default_value = Column(JSONB, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class LLMEvaluationRun(Base):
    """Benchmark and Evaluation Run for Custom Prompts and Models."""
    __tablename__ = "llm_evaluation_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_name = Column(String(100), nullable=False)
    prompt_variant_a = Column(Text, nullable=False)
    prompt_variant_b = Column(Text, nullable=False)
    dataset_size = Column(Integer, default=10)
    score_a = Column(Float, default=0.0)
    score_b = Column(Float, default=0.0)
    latency_ms_a = Column(Integer, default=0)
    latency_ms_b = Column(Integer, default=0)
    tokens_used_a = Column(Integer, default=0)
    tokens_used_b = Column(Integer, default=0)
    metrics_breakdown = Column(JSONB, default=dict)
    winner = Column(String(10), default="A")
    created_at = Column(DateTime, server_default=func.now(), index=True)


class WorkflowDefinition(Base):
    """Visual Multi-Agent Workflow Automation Pipeline."""
    __tablename__ = "workflow_definitions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    trigger_type = Column(String(50), default="event")  # 'event', 'manual', 'schedule', 'webhook'
    trigger_config = Column(JSONB, default=dict)
    nodes = Column(JSONB, default=list)  # Visual workflow nodes
    edges = Column(JSONB, default=list)  # Node connections
    is_active = Column(Boolean, default=True)
    execution_count = Column(Integer, default=0)
    last_executed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class EmailSyncAccount(Base):
    """Connected Mailbox Account for 2-Way IMAP/OAuth Sync (Google Workspace, Microsoft Graph, IMAP)."""
    __tablename__ = "email_sync_accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    provider = Column(String(50), nullable=False)  # 'gmail', 'outlook_365', 'imap'
    email_address = Column(String(255), nullable=False, index=True)
    display_name = Column(String(150), nullable=True)
    sync_status = Column(String(50), default="active")  # 'active', 'paused', 'error'
    last_synced_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    settings = Column(JSONB, default=dict)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class EmailThread(Base):
    """Aggregated Email Conversation Thread with Chronological Message History."""
    __tablename__ = "email_threads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_id = Column(UUID(as_uuid=True), ForeignKey("email_sync_accounts.id", ondelete="CASCADE"), nullable=True, index=True)
    thread_key = Column(String(255), nullable=False, index=True)
    subject = Column(String(255), nullable=False)
    participant_emails = Column(JSONB, default=list)
    message_count = Column(Integer, default=1)
    snippet = Column(Text, nullable=True)
    is_unread = Column(Boolean, default=False)
    sentiment = Column(String(50), default="neutral")
    last_message_at = Column(DateTime, server_default=func.now(), index=True)
    messages = Column(JSONB, default=list)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class WhatsAppTemplate(Base):
    """Meta WhatsApp Business Pre-Approved Message Template."""
    __tablename__ = "whatsapp_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, index=True)
    category = Column(String(50), default="MARKETING")  # 'MARKETING', 'UTILITY', 'AUTHENTICATION'
    language = Column(String(10), default="en_US")
    status = Column(String(50), default="APPROVED")  # 'APPROVED', 'PENDING', 'REJECTED'
    body_text = Column(Text, nullable=False)
    variables = Column(JSONB, default=list)  # e.g. ["{{1}}", "{{2}}"]
    header_type = Column(String(50), default="NONE")  # 'NONE', 'TEXT', 'IMAGE', 'DOCUMENT'
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())





