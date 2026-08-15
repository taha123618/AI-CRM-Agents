"""Database Seeding Script for AI CRM development"""

# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
import uuid

from database.models import Company, Contact, Deal, Customer, Meeting, Email


def seed_database(db: Session):
    """Seed the database with sample data if empty"""
    # Check if companies already exist
    if db.query(Company).count() > 0:
        print("Database already has data. Skipping seed.")
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

    print(
        "Database seeding completed successfully! Added 3 companies, 4 contacts, 2 customers, 3 deals, 2 meetings, and 2 emails."
    )
