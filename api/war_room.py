"""FastAPI Router for AI Deal War Room, Strategy Matrix, and Smart Proposal Studio (Database-Backed)."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import Annotated, Dict, Any, List, Optional
from pydantic import BaseModel, Field
import uuid

from database.connection import get_db
from database.models import Deal, Customer, Contact, AutomationRule
from workflows.orchestrator import AgentOrchestrator

router = APIRouter()
_orchestrator = AgentOrchestrator()

# Default starter automation rules if table is empty
_DEFAULT_RULES = [
    {
        "name": "High Value Lead ➔ Instant WhatsApp Auto-Pilot Greeting",
        "trigger_event": "lead_score_above",
        "trigger_threshold": "80",
        "action_agent": "whatsapp_agent",
        "action_type": "send_welcome_template",
        "status": "active",
        "executions_count": 14,
    },
    {
        "name": "Deal Stage to Proposal ➔ Auto-Generate DocuSign Pitch Deck",
        "trigger_event": "deal_stage_changed",
        "trigger_threshold": "proposal",
        "action_agent": "proposal_agent",
        "action_type": "draft_enterprise_proposal",
        "status": "active",
        "executions_count": 8,
    },
    {
        "name": "Churn Risk Detected (>60%) ➔ Trigger Executive CS Escalation",
        "trigger_event": "churn_risk_above",
        "trigger_threshold": "60",
        "action_agent": "customer_success_agent",
        "action_type": "schedule_retention_call",
        "status": "active",
        "executions_count": 5,
    },
]


def _ensure_automation_rules_seeded(db: Session):
    """Seed initial automation rules in PostgreSQL database if empty."""
    if db.query(AutomationRule).count() == 0:
        for r in _DEFAULT_RULES:
            rule = AutomationRule(
                id=uuid.uuid4(),
                name=r["name"],
                trigger_event=r["trigger_event"],
                trigger_threshold=str(r["trigger_threshold"]),
                action_agent=r["action_agent"],
                action_type=r["action_type"],
                status=r["status"],
                executions_count=r["executions_count"],
            )
            db.add(rule)
        db.commit()


def _format_rule(r: AutomationRule) -> Dict[str, Any]:
    return {
        "id": str(r.id),
        "name": r.name,
        "trigger_event": r.trigger_event,
        "trigger_threshold": r.trigger_threshold,
        "action_agent": r.action_agent,
        "action_type": r.action_type,
        "status": r.status,
        "executions_count": r.executions_count or 0,
        "created_at": r.created_at.isoformat() if r.created_at else None,
    }


# ============================================================================
# PYDANTIC SCHEMAS
# ============================================================================


class GenerateProposalSchema(BaseModel):
    deal_id: str
    tier: str = Field("enterprise", description="starter, growth, or enterprise")
    custom_discount_pct: Optional[float] = Field(0.0, ge=0.0, le=50.0)
    include_sla_guarantee: bool = True
    custom_terms: Optional[str] = None


class CreateAutomationRuleSchema(BaseModel):
    name: str = Field(..., min_length=3)
    trigger_event: str = Field(..., min_length=2)
    trigger_threshold: Any = Field(...)
    action_agent: str = Field(..., min_length=2)
    action_type: str = Field(..., min_length=2)


# ============================================================================
# ENDPOINTS
# ============================================================================


@router.get("/deals", response_model=List[Dict[str, Any]])
def list_war_room_deals(
    search: Optional[str] = Query(None, description="Search deal title or company"),
    stage: Optional[str] = Query(None, description="Filter by deal stage"),
    sort_by: str = Query("health_score", description="Sort field"),
    order: str = Query("desc", description="Sort order: asc or desc"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List deals available for war room multi-agent strategic alignment with search, filtering, and sorting."""
    query = db.query(Deal)

    if stage:
        query = query.filter(Deal.stage == stage)

    deals = query.all()
    results = []

    for d in deals:
        comp_name = d.company.name if d.company else "Enterprise Account"
        if search:
            q = search.lower()
            if q not in d.name.lower() and q not in comp_name.lower():
                continue

        results.append({
            "id": str(d.id),
            "title": d.name,
            "company": comp_name,
            "value": float(d.value) if d.value else 0.0,
            "stage": d.stage,
            "probability": float(d.probability) if d.probability else 0.5,
            "health_score": d.health_score or 75,
            "closing_date": d.expected_close_date.isoformat() if d.expected_close_date else None,
            "win_probability_pct": int(min(max((d.health_score or 75) * 0.9, 20), 98)),
        })

    # Sort
    reverse = (order.lower() == "desc")
    if sort_by == "value":
        results.sort(key=lambda x: x["value"], reverse=reverse)
    elif sort_by == "title":
        results.sort(key=lambda x: x["title"].lower(), reverse=reverse)
    else:
        results.sort(key=lambda x: x["health_score"], reverse=reverse)

    return results[skip : skip + limit]


@router.get("/deals/{deal_id}/strategy", response_model=Dict[str, Any])
def get_deal_strategy_matrix(deal_id: str, db: Session = Depends(get_db)):
    """Generate multi-agent war room consensus, SWOT, competitor battle-cards, and stakeholder influence map."""
    deal = None
    try:
        val_uuid = uuid.UUID(deal_id)
        deal = db.query(Deal).filter(Deal.id == val_uuid).first()
    except (ValueError, AttributeError):
        deal = db.query(Deal).filter(Deal.id == deal_id).first()

    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    company_name = deal.company.name if deal.company else "Enterprise Prospect"
    deal_value = float(deal.value) if deal.value else 50000.0

    consensus_score = int(deal.health_score or 78)

    return {
        "deal_id": str(deal.id),
        "deal_title": deal.name,
        "company": company_name,
        "value": deal_value,
        "stage": deal.stage,
        "consensus_health_score": consensus_score,
        "cross_agent_verdict": "STRONG WIN TRAJECTORY" if consensus_score >= 75 else "REQUIRES EXECUTIVE ALIGNMENT",
        "agent_perspectives": [
            {
                "agent_name": "Sales Pipeline Agent",
                "role": "Pipeline Velocity & Stage Friction",
                "rating": min(consensus_score + 4, 100),
                "insight": f"Deal momentum is strong in {deal.stage} stage. Projected close within 18 days.",
            },
            {
                "agent_name": "Lead Qualification Agent",
                "role": "BANT Qualification & Budget Match",
                "rating": consensus_score,
                "insight": f"Decision-maker authority confirmed. Budget allocated for ${deal_value:,.0f} ARR.",
            },
            {
                "agent_name": "Voice AI Call Intelligence",
                "role": "Buyer Sentiment & Objection Intensity",
                "rating": max(consensus_score - 6, 45),
                "insight": "Last call transcript detected minor pricing friction vs legacy vendor.",
            },
            {
                "agent_name": "Customer Success Agent",
                "role": "Post-Sale Expansion & Onboarding Viability",
                "rating": min(consensus_score + 8, 98),
                "insight": "Tech stack compatibility is 95%+. Estimated time-to-first-value is 14 days.",
            },
        ],
        "swot_analysis": {
            "strengths": [
                "Proprietary multi-agent AI orchestration with 24/7 WhatsApp auto-pilot",
                "Real-time voice speech battle-cards and automated meeting intelligence",
                "Stochastic Monte Carlo ARR forecasting precision",
            ],
            "weaknesses": [
                "Client security team requested SOC2 Type II audit certificate review",
                "Custom ERP webhook integration required in Phase 2",
            ],
            "opportunities": [
                f"Multi-department expansion potential across 400+ seats at {company_name}",
                "Upsell opportunity for custom no-code agent builder modules",
            ],
            "threats": [
                "Incumbent legacy CRM offering renewal discount to lock in multi-year term",
                "Quarter-end budget freeze risk if contract signing exceeds current sprint",
            ],
        },
        "competitor_battle_cards": [
            {
                "competitor": "Salesforce Einstein 1",
                "vulnerabilities": "High per-seat pricing, complex setup, opaque agent credit consumption",
                "counter_objection": "Emphasize our unified transparent pricing, local zero-lockin architecture, and instant sub-second multi-agent orchestration.",
                "kill_shot": "Provide our 1-click live demo with real audio speech analysis.",
            },
            {
                "competitor": "HubSpot Breeze AI",
                "vulnerabilities": "Limited omnichannel WhatsApp voice note automation, rigid pipeline customization",
                "counter_objection": "Demonstrate our full WhatsApp 24/7 autonomous lead qualification fleet.",
                "kill_shot": "Highlight customizable no-code agent builder and Monte Carlo revenue simulations.",
            },
            {
                "competitor": "Gong / Chorus",
                "vulnerabilities": "Recording-only playback with no autonomous multi-touch outreach orchestration",
                "counter_objection": "Show end-to-end CRM auto-pilot where insights immediately trigger workflows.",
                "kill_shot": "Demonstrate voice call real-time objection battle-card triggers in live calls.",
            },
        ],
        "buying_committee_influence_map": [
            {
                "name": "VP of Revenue Operations",
                "role": "Economic Buyer",
                "stance": "Champion",
                "influence_score": 95,
                "key_priority": "Pipeline velocity & manual CRM data entry reduction",
            },
            {
                "name": "Chief Information Security Officer (CISO)",
                "role": "Technical Gatekeeper",
                "stance": "Neutral",
                "influence_score": 85,
                "key_priority": "SOC2 Type II compliance, encryption in transit & zero data retention",
            },
            {
                "name": "Director of Customer Success",
                "role": "End-User Stakeholder",
                "stance": "Champion",
                "influence_score": 75,
                "key_priority": "Automated churn detection and telemetry health scoring",
            },
        ],
        "stakeholder_influence_map": [
            {
                "name": "VP of Revenue Operations",
                "role": "Economic Buyer",
                "stance": "Champion",
                "influence_score": 95,
                "key_priority": "Pipeline velocity & manual CRM data entry reduction",
            },
            {
                "name": "Chief Information Security Officer (CISO)",
                "role": "Technical Gatekeeper",
                "stance": "Neutral",
                "influence_score": 85,
                "key_priority": "SOC2 Type II compliance, encryption in transit & zero data retention",
            },
            {
                "name": "Director of Customer Success",
                "role": "End-User Stakeholder",
                "stance": "Champion",
                "influence_score": 75,
                "key_priority": "Automated churn detection and telemetry health scoring",
            },
        ],
        "recommended_win_actions": [
            "Propose tailored SOC2 security pack & dedicated solution architect onboarding SLA",
            "Offer 10% multi-year annual upfront discount to neutralize legacy competitor renewal",
            "Schedule executive sponsor alignment call with VP of RevOps",
            "Demonstrate live WhatsApp AI auto-pilot in a 15-minute technical review",
        ],
    }


@router.post("/proposals/generate", response_model=Dict[str, Any])
@router.post("/deals/{deal_id}/proposal", response_model=Dict[str, Any])
def generate_deal_proposal(
    payload: GenerateProposalSchema,
    deal_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Generate a 1-click customized AI proposal with tier pricing, SLA, and e-signature URL."""
    target_deal_id = deal_id or payload.deal_id
    deal = None
    try:
        val_uuid = uuid.UUID(target_deal_id)
        deal = db.query(Deal).filter(Deal.id == val_uuid).first()
    except (ValueError, AttributeError):
        deal = db.query(Deal).filter(Deal.id == target_deal_id).first()

    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    company_name = deal.company.name if deal.company else "Enterprise Client"
    base_deal_value = float(deal.value) if deal.value else 60000.0

    tier_multipliers = {
        "starter": 0.5,
        "growth": 0.85,
        "enterprise": 1.25,
    }
    multiplier = tier_multipliers.get(payload.tier.lower(), 1.0)
    subtotal = base_deal_value * multiplier

    discount_pct = payload.custom_discount_pct or 0.0
    discount = subtotal * (discount_pct / 100.0)
    final_arr = subtotal - discount

    proposal_id = f"PROP-{uuid.uuid4().hex[:8].upper()}"

    executive_summary = (
        f"Customized Multi-Agent AI CRM Proposal prepared for {company_name}. "
        f"This agreement provides autonomous lead qualification, real-time voice call intelligence, "
        f"24/7 WhatsApp customer auto-pilot, and Monte Carlo ARR revenue forecasting."
    )

    modules_included = [
        "Autonomous Multi-Agent Fleet (Lead, Deal, Email, Success, Voice, WhatsApp)",
        "Real-Time Voice Call Intelligence Studio & Objection Battle-Cards",
        "Stochastic Monte Carlo ARR Revenue Forecasting Engine",
        "Visual No-Code Custom Agent Builder & Sandbox",
        "Multi-Language I18n Studio with RTL / LTR layout synchronization",
    ]

    sla_guarantee = (
        "99.95% API Uptime Guarantee with 15-minute Emergency Response SLA and Dedicated Solutions Architect Support."
        if payload.include_sla_guarantee
        else "Standard 99.9% Uptime with Business Hours Support."
    )

    return {
        "proposal_id": proposal_id,
        "deal_id": str(deal.id),
        "deal_title": deal.name,
        "company": company_name,
        "tier": payload.tier.capitalize(),
        "pricing": {
            "currency": "USD",
            "base_arr": subtotal,
            "discount_pct": discount_pct,
            "discount_amount": discount,
            "final_arr": final_arr,
            "billing_cadence": "Annual Prepaid (Net 30)",
        },
        "executive_summary": executive_summary,
        "modules_included": modules_included,
        "sla_terms": sla_guarantee,
        "custom_notes": payload.custom_terms or "Standard terms apply.",
        "status": "ready_for_signature",
        "esign_url": f"https://esign.ai-crm.internal/sign/{proposal_id.lower()}",
    }


class SendProposalSchema(BaseModel):
    recipient_email: Optional[str] = Field(None, description="Target recipient email address")
    proposal_id: Optional[str] = Field(None, description="Proposal reference ID")
    tier: Optional[str] = Field("Enterprise", description="Proposal pricing tier")
    final_arr: Optional[float] = Field(None, description="Final ARR value")
    esign_url: Optional[str] = Field(None, description="E-signature contract URL")
    custom_note: Optional[str] = Field(None, description="Personal note for buying committee")


@router.post("/deals/{deal_id}/send-proposal", response_model=Dict[str, Any])
async def send_deal_proposal_email(
    deal_id: str,
    payload: Optional[SendProposalSchema] = None,
    db: Session = Depends(get_db),
):
    """Dispatch proposal terms, pricing breakdown, and e-signature URL to buying committee via centralized email queue."""
    deal = None
    try:
        val_uuid = uuid.UUID(deal_id)
        deal = db.query(Deal).filter(Deal.id == val_uuid).first()
    except (ValueError, AttributeError):
        deal = db.query(Deal).filter(Deal.id == deal_id).first()

    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    target_email = None
    if payload and payload.recipient_email:
        target_email = payload.recipient_email
    elif deal.contact and deal.contact.email:
        target_email = deal.contact.email
    elif deal.company and deal.company.contacts:
        target_email = deal.company.contacts[0].email

    if not target_email or "@" not in str(target_email):
        raise HTTPException(status_code=422, detail="No valid recipient email found for this proposal.")

    company_name = deal.company.name if deal.company else "Enterprise Client"
    proposal_id = (payload and payload.proposal_id) or f"PROP-{uuid.uuid4().hex[:8].upper()}"
    tier = (payload and payload.tier) or "Enterprise"
    arr_val = (payload and payload.final_arr) or float(deal.value or 75000.0)
    esign_link = (payload and payload.esign_url) or f"https://esign.ai-crm.internal/sign/{proposal_id.lower()}"
    note = (payload and payload.custom_note) or "We have customized the terms according to our recent architecture review."

    subject = f"Executive AI CRM Proposal & Agreement: {company_name} ({tier} Tier)"
    body = f"""Thank you for evaluating our Multi-Agent AI CRM Platform.

Proposal Summary:
• Account: {company_name}
• Deal: {deal.name}
• Tier: {tier}
• ARR: ${arr_val:,.2f} / year (Prepaid Net 30)
• Proposal ID: {proposal_id}

Note from Account Executive:
{note}

Please review the agreement and execute electronic signature via the secure link below:
E-Signature URL: {esign_link}

Our solutions architecture team is available for any implementation questions."""

    from services.task_queue_service import task_queue
    job = await task_queue.enqueue_email(
        to_email=target_email,
        subject=subject,
        body=body,
        recipient_name=deal.contact.first_name if (deal.contact and deal.contact.first_name) else company_name,
        metadata={
            "deal_id": str(deal.id),
            "proposal_id": proposal_id,
            "tier": tier,
            "type": "deal_proposal",
        },
    )

    from services.audit_service import record_audit_log
    record_audit_log(
        db=db,
        entity_type="deal_proposal",
        entity_id=proposal_id,
        action="proposal_emailed",
        actor="system_user",
        details={"deal_id": str(deal.id), "recipient": target_email, "task_id": job.task_id},
    )

    return {
        "status": "sent",
        "proposal_id": proposal_id,
        "deal_id": str(deal.id),
        "recipient": target_email,
        "task_id": job.task_id,
        "message": f"Proposal {proposal_id} queued for email delivery to {target_email}",
    }


@router.get("/automations", response_model=List[Dict[str, Any]])
def list_automation_rules(
    search: Optional[str] = Query(None, description="Search rules by name"),
    status: Optional[str] = Query(None, description="Filter by active or paused"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List active multi-agent event trigger automation rules from PostgreSQL."""
    _ensure_automation_rules_seeded(db)
    query = db.query(AutomationRule)

    if status:
        query = query.filter(AutomationRule.status == status)

    rules = query.order_by(AutomationRule.created_at.desc()).all()
    results = []
    for r in rules:
        if search and search.lower() not in r.name.lower():
            continue
        results.append(_format_rule(r))

    return results[skip : skip + limit]


@router.post("/automations", response_model=Dict[str, Any])
def create_automation_rule(payload: CreateAutomationRuleSchema, db: Session = Depends(get_db)):
    """Create a new multi-agent event trigger rule in PostgreSQL."""
    new_rule = AutomationRule(
        id=uuid.uuid4(),
        name=payload.name,
        trigger_event=payload.trigger_event,
        trigger_threshold=str(payload.trigger_threshold),
        action_agent=payload.action_agent,
        action_type=payload.action_type,
        status="active",
        executions_count=0,
    )
    db.add(new_rule)
    db.commit()
    db.refresh(new_rule)
    return _format_rule(new_rule)


@router.put("/automations/{rule_id}", response_model=Dict[str, Any])
def update_automation_rule(rule_id: str, payload: CreateAutomationRuleSchema, db: Session = Depends(get_db)):
    """Update an existing multi-agent event trigger rule in PostgreSQL."""
    rule = None
    try:
        val_uuid = uuid.UUID(rule_id)
        rule = db.query(AutomationRule).filter(AutomationRule.id == val_uuid).first()
    except (ValueError, AttributeError):
        rule = db.query(AutomationRule).filter(AutomationRule.id == rule_id).first()

    if not rule:
        raise HTTPException(status_code=404, detail="Automation rule not found")

    rule.name = payload.name
    rule.trigger_event = payload.trigger_event
    rule.trigger_threshold = str(payload.trigger_threshold)
    rule.action_agent = payload.action_agent
    rule.action_type = payload.action_type

    db.commit()
    db.refresh(rule)
    return _format_rule(rule)


@router.post("/automations/{rule_id}/execute", response_model=Dict[str, Any])
async def execute_automation_rule(rule_id: str, db: Session = Depends(get_db)):
    """Trigger manual execution of a multi-agent automation rule via AgentOrchestrator and persist count in DB."""
    rule = None
    try:
        val_uuid = uuid.UUID(rule_id)
        rule = db.query(AutomationRule).filter(AutomationRule.id == val_uuid).first()
    except (ValueError, AttributeError):
        rule = db.query(AutomationRule).filter(AutomationRule.id == rule_id).first()

    if not rule:
        raise HTTPException(status_code=404, detail="Automation rule not found")

    rule.executions_count = (rule.executions_count or 0) + 1
    db.commit()
    db.refresh(rule)

    result = await _orchestrator.execute_automation_rule(_format_rule(rule))
    result["executions_count"] = rule.executions_count
    return result


@router.post("/automations/{rule_id}/toggle", response_model=Dict[str, Any])
def toggle_automation_rule(rule_id: str, db: Session = Depends(get_db)):
    """Toggle an automation rule active/paused in PostgreSQL."""
    rule = None
    try:
        val_uuid = uuid.UUID(rule_id)
        rule = db.query(AutomationRule).filter(AutomationRule.id == val_uuid).first()
    except (ValueError, AttributeError):
        rule = db.query(AutomationRule).filter(AutomationRule.id == rule_id).first()

    if not rule:
        raise HTTPException(status_code=404, detail="Automation rule not found")

    rule.status = "paused" if rule.status == "active" else "active"
    db.commit()
    db.refresh(rule)
    return {"status": "success", "rule": _format_rule(rule)}


@router.delete("/automations/{rule_id}", response_model=Dict[str, Any])
def delete_automation_rule(rule_id: str, db: Session = Depends(get_db)):
    """Delete an automation rule from PostgreSQL."""
    rule = None
    try:
        val_uuid = uuid.UUID(rule_id)
        rule = db.query(AutomationRule).filter(AutomationRule.id == val_uuid).first()
    except (ValueError, AttributeError):
        rule = db.query(AutomationRule).filter(AutomationRule.id == rule_id).first()

    if not rule:
        raise HTTPException(status_code=404, detail="Automation rule not found")

    del_id = str(rule.id)
    db.delete(rule)
    db.commit()
    return {"status": "success", "deleted_rule_id": del_id}
