"""FastAPI Router for AI Deal War Room, Strategy Matrix, and Smart Proposal Studio."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated, Dict, Any, List, Optional
from pydantic import BaseModel, Field
import uuid

from database.connection import get_db
from database.models import Deal, Customer, Contact
from workflows.orchestrator import AgentOrchestrator

router = APIRouter()
_orchestrator = AgentOrchestrator()

# In-memory store for custom multi-agent automation trigger rules
_AUTOMATION_RULES: List[Dict[str, Any]] = [
    {
        "id": "rule-1",
        "name": "High Value Lead ➔ Instant WhatsApp Auto-Pilot Greeting",
        "trigger_event": "lead_score_above",
        "trigger_threshold": 80,
        "action_agent": "whatsapp_agent",
        "action_type": "send_welcome_template",
        "status": "active",
        "executions_count": 14,
    },
    {
        "id": "rule-2",
        "name": "Deal Stage to Proposal ➔ Auto-Generate DocuSign Pitch Deck",
        "trigger_event": "deal_stage_changed",
        "trigger_threshold": "proposal",
        "action_agent": "proposal_agent",
        "action_type": "draft_enterprise_proposal",
        "status": "active",
        "executions_count": 8,
    },
    {
        "id": "rule-3",
        "name": "Churn Risk Detected (>60%) ➔ Trigger Executive CS Escalation",
        "trigger_event": "churn_risk_above",
        "trigger_threshold": 60,
        "action_agent": "customer_success_agent",
        "action_type": "schedule_retention_call",
        "status": "active",
        "executions_count": 5,
    },
]


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
def list_war_room_deals(db: Session = Depends(get_db)):
    """List deals available for war room multi-agent strategic alignment."""
    deals = db.query(Deal).all()
    results = []

    for d in deals:
        comp_name = d.company.name if d.company else "Enterprise Account"
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

    return results


@router.get("/deals/{deal_id}/strategy", response_model=Dict[str, Any])
def get_deal_strategy_matrix(deal_id: str, db: Session = Depends(get_db)):
    """Generate multi-agent war room consensus, SWOT, competitor battle-cards, and stakeholder influence map."""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    company_name = deal.company.name if deal.company else "Enterprise Prospect"
    deal_value = float(deal.value) if deal.value else 50000.0

    # Cross-agent consensus scoring
    consensus_score = int(deal.health_score or 78)
    lead_sentiment = "High Intent" if consensus_score >= 75 else "Moderate"
    pipeline_velocity = "Accelerating" if consensus_score >= 70 else "At Risk"

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
        ],
        "stakeholder_influence_map": [
            {
                "name": "VP of Revenue Operations",
                "role": "Economic Buyer",
                "stance": "Champion",
                "influence": "High",
                "strategy": "Deliver ROI business case showing 3.8x faster lead response times.",
            },
            {
                "name": "Head of Sales Engineering",
                "role": "Technical Evaluator",
                "stance": "Neutral",
                "influence": "High",
                "strategy": "Provide OpenAPI swagger docs and architecture sandbox walkthrough.",
            },
            {
                "name": "Procurement Lead",
                "role": "Contract Gatekeeper",
                "stance": "Cautionary",
                "influence": "Medium",
                "strategy": "Attach standard mutual NDA and DPA security addendum with tier discount.",
            },
        ],
        "recommended_win_actions": [
            "Trigger 1-Click Proposal Studio to generate customized Tier Proposal Deck",
            "Send WhatsApp Broadcast demo recap directly to VP of RevOps",
            "Schedule 15-min Technical Security Q&A with Solutions Architect",
        ],
    }


@router.post("/proposals/generate", response_model=Dict[str, Any])
def generate_deal_proposal(payload: GenerateProposalSchema, db: Session = Depends(get_db)):
    """Auto-generate structured enterprise proposal deck with tier pricing and SLA terms."""
    deal = db.query(Deal).filter(Deal.id == payload.deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    company_name = deal.company.name if deal.company else "Enterprise Prospect"
    base_value = float(deal.value) if deal.value else 60000.0

    multiplier = 1.5 if payload.tier == "enterprise" else (1.0 if payload.tier == "growth" else 0.6)
    subtotal = round(base_value * multiplier, 2)
    discount_pct = (payload.custom_discount_pct or 0.0)
    discount = round(subtotal * (discount_pct / 100.0), 2)
    final_arr = subtotal - discount

    proposal_id = f"PROP-{str(uuid.uuid4())[:8].upper()}"

    executive_summary = (
        f"This executive proposal outlines the deployment of the AI-Powered Multi-Agent CRM platform "
        f"for {company_name}. By deploying specialized autonomous agents across Lead Qualification, "
        f"Voice AI Intelligence, and 24/7 WhatsApp Business hubs, {company_name} will accelerate sales pipeline "
        f"velocity, reduce inbound lead response latency from hours to seconds, and forecast revenue with Monte Carlo precision."
    )

    modules_included = [
        "24/7 Omnichannel WhatsApp Business Fleet with Audio Intelligence",
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


@router.get("/automations", response_model=List[Dict[str, Any]])
def list_automation_rules():
    """List active multi-agent event trigger automation rules."""
    return _AUTOMATION_RULES


@router.post("/automations", response_model=Dict[str, Any])
def create_automation_rule(payload: CreateAutomationRuleSchema):
    """Create a new multi-agent event trigger rule."""
    new_rule = {
        "id": f"rule-{uuid.uuid4().hex[:6]}",
        "name": payload.name,
        "trigger_event": payload.trigger_event,
        "trigger_threshold": payload.trigger_threshold,
        "action_agent": payload.action_agent,
        "action_type": payload.action_type,
        "status": "active",
        "executions_count": 0,
    }
    _AUTOMATION_RULES.append(new_rule)
    return new_rule


@router.put("/automations/{rule_id}", response_model=Dict[str, Any])
def update_automation_rule(rule_id: str, payload: CreateAutomationRuleSchema):
    """Update an existing multi-agent event trigger rule."""
    for rule in _AUTOMATION_RULES:
        if rule["id"] == rule_id:
            rule["name"] = payload.name
            rule["trigger_event"] = payload.trigger_event
            rule["trigger_threshold"] = payload.trigger_threshold
            rule["action_agent"] = payload.action_agent
            rule["action_type"] = payload.action_type
            return rule
    raise HTTPException(status_code=404, detail="Automation rule not found")


@router.post("/automations/{rule_id}/execute", response_model=Dict[str, Any])
async def execute_automation_rule(rule_id: str):
    """Trigger manual execution of a multi-agent automation rule via AgentOrchestrator and LLM."""
    for rule in _AUTOMATION_RULES:
        if rule["id"] == rule_id:
            rule["executions_count"] += 1
            result = await _orchestrator.execute_automation_rule(rule)
            result["executions_count"] = rule["executions_count"]
            return result
    raise HTTPException(status_code=404, detail="Automation rule not found")


@router.post("/automations/{rule_id}/toggle", response_model=Dict[str, Any])
def toggle_automation_rule(rule_id: str):
    """Toggle an automation rule active/paused."""
    for rule in _AUTOMATION_RULES:
        if rule["id"] == rule_id:
            rule["status"] = "paused" if rule["status"] == "active" else "active"
            return {"status": "success", "rule": rule}
    raise HTTPException(status_code=404, detail="Automation rule not found")


@router.delete("/automations/{rule_id}", response_model=Dict[str, Any])
def delete_automation_rule(rule_id: str):
    """Delete an automation rule."""
    global _AUTOMATION_RULES
    initial_len = len(_AUTOMATION_RULES)
    _AUTOMATION_RULES = [r for r in _AUTOMATION_RULES if r["id"] != rule_id]
    if len(_AUTOMATION_RULES) == initial_len:
        raise HTTPException(status_code=404, detail="Automation rule not found")
    return {"status": "success", "deleted_rule_id": rule_id}

